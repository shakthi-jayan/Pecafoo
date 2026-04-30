"""
Locations — API Views
========================
Service area, geocoding, routing, and location-related endpoints.
"""

import logging
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsDeliveryPartner
from locations.models import ServiceArea, DeliveryRoute, LocationHistory
from locations.serializers import (
    ServiceAreaSerializer,
    DeliveryRouteSerializer,
    LocationHistorySerializer,
    GeocodingRequestSerializer,
    ReverseGeocodingRequestSerializer,
    ServiceAreaCheckSerializer,
)
from locations.services import (
    create_delivery_route,
    geocode_address,
    reverse_geocode,
    is_within_service_area,
)

logger = logging.getLogger(__name__)


def _build_route_fallback_payload(order):
    restaurant = order.restaurant
    return {
        "id": None,
        "order": str(order.id),
        "order_number": order.order_number,
        "origin_latitude": restaurant.latitude,
        "origin_longitude": restaurant.longitude,
        "origin_label": restaurant.name,
        "destination_latitude": order.delivery_latitude,
        "destination_longitude": order.delivery_longitude,
        "destination_label": order.delivery_address[:200] if order.delivery_address else "",
        "route_geojson": None,
        "distance_meters": 0,
        "duration_seconds": 0,
        "distance_km": 0,
        "duration_minutes": 0,
        "waypoints": [],
        "estimated_arrival": None,
        "last_eta_update": None,
        "route_unavailable": True,
    }






class ServiceAreaListView(generics.ListAPIView):
    """
    GET /api/locations/service-area/
    Public endpoint — returns active service area boundaries for map rendering.
    """
    serializer_class = ServiceAreaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ServiceArea.objects.filter(is_active=True)


class ServiceAreaDetailView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT /api/locations/service-area/<uuid:pk>/
    Admin-only: View or update a service area boundary.
    """
    serializer_class = ServiceAreaSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = ServiceArea.objects.all()


class ServiceAreaCreateView(generics.CreateAPIView):
    """
    POST /api/locations/service-area/create/
    Admin-only: Create a new service area.
    """
    serializer_class = ServiceAreaSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class ServiceAreaCheckView(APIView):
    """
    POST /api/locations/check-service-area/
    Check if coordinates fall within the active service area.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ServiceAreaCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        lat = serializer.validated_data["latitude"]
        lng = serializer.validated_data["longitude"]

        within, area_name = is_within_service_area(lat, lng)

        return Response({
            "within_service_area": within,
            "service_area_name": area_name,
            "latitude": float(lat),
            "longitude": float(lng),
        })






class GeocodeView(APIView):
    """
    POST /api/locations/geocode/
    Forward geocoding: address string → coordinates.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GeocodingRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        results = geocode_address(serializer.validated_data["address"])
        if results is None:
            return Response(
                {"error": "Geocoding service unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"results": results})


class ReverseGeocodeView(APIView):
    """
    POST /api/locations/reverse-geocode/
    Reverse geocoding: coordinates → address.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ReverseGeocodingRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = reverse_geocode(
            serializer.validated_data["latitude"],
            serializer.validated_data["longitude"],
        )

        if result is None:
            return Response(
                {"error": "Reverse geocoding failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(result)






class OrderRouteView(APIView):
    """
    GET /api/orders/<uuid:order_id>/route/
    Returns GeoJSON route data for an active order.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            route = DeliveryRoute.objects.select_related("order").get(
                order_id=order_id
            )
        except DeliveryRoute.DoesNotExist:
            from orders.models import Order

            try:
                order = Order.objects.select_related("restaurant", "restaurant__owner").get(pk=order_id)
            except Order.DoesNotExist:
                return Response(
                    {"error": "Order not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            user = request.user
            if user.role == "customer" and order.customer != user:
                return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            if user.role == "restaurant" and order.restaurant.owner != user:
                return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            if user.role == "delivery" and order.delivery_partner != user:
                return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            route = create_delivery_route(order)
            if route is None:
                return Response(_build_route_fallback_payload(order))

        
        order = route.order
        user = request.user
        if user.role == "customer" and order.customer != user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if user.role == "restaurant" and order.restaurant.owner != user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if user.role == "delivery" and order.delivery_partner != user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        return Response(DeliveryRouteSerializer(route).data)






class DeliveryPathView(APIView):
    """
    GET /api/locations/delivery-path/<uuid:order_id>/
    Admin: Reconstruct a delivery partner's path for a completed order.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, order_id):
        locations = LocationHistory.objects.filter(
            order_id=order_id
        ).order_by("timestamp").values(
            "latitude", "longitude", "speed", "heading", "timestamp"
        )

        
        coordinates = [
            [float(loc["longitude"]), float(loc["latitude"])]
            for loc in locations
        ]

        path_geojson = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coordinates,
            },
            "properties": {
                "order_id": str(order_id),
                "total_points": len(coordinates),
            },
        }

        return Response({
            "path": path_geojson,
            "points": list(locations),
            "total_points": len(coordinates),
        })






class ActiveDeliveryPartnersView(APIView):
    """
    GET /api/locations/active-partners/
    Admin: Get all delivery partners with their current status and location.
    For the admin operations dashboard map.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from delivery.models import DeliveryPartnerProfile

        partners = DeliveryPartnerProfile.objects.select_related("user").filter(
            current_latitude__isnull=False,
            current_longitude__isnull=False,
        )

        data = []
        for p in partners:
            
            if not p.is_available and not p.is_verified:
                partner_status = "offline"
            elif p.is_available:
                partner_status = "available"
            else:
                partner_status = "on_delivery"

            data.append({
                "id": str(p.user.id),
                "name": p.user.full_name,
                "email": p.user.email,
                "latitude": float(p.current_latitude),
                "longitude": float(p.current_longitude),
                "status": partner_status,
                "is_available": p.is_available,
                "is_verified": p.is_verified,
                "vehicle_type": p.vehicle_type,
                "total_deliveries": p.total_deliveries,
                "average_rating": float(p.average_rating),
            })

        return Response({
            "partners": data,
            "total": len(data),
            "available": sum(1 for d in data if d["status"] == "available"),
            "on_delivery": sum(1 for d in data if d["status"] == "on_delivery"),
        })
