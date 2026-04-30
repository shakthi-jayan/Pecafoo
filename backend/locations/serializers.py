"""
Locations — Serializers
========================
"""

from rest_framework import serializers
from locations.models import ServiceArea, DeliveryRoute, LocationHistory


class ServiceAreaSerializer(serializers.ModelSerializer):
    """Public serializer for the active service area boundary."""

    class Meta:
        model = ServiceArea
        fields = [
            "id", "name", "boundary", "center_latitude", "center_longitude",
            "zoom_level", "max_delivery_radius_km", "is_active",
        ]
        read_only_fields = ["id"]


class DeliveryRouteSerializer(serializers.ModelSerializer):
    """Route data for live order tracking."""

    order_number = serializers.CharField(source="order.order_number", read_only=True)
    distance_km = serializers.FloatField(read_only=True)
    duration_minutes = serializers.FloatField(read_only=True)

    class Meta:
        model = DeliveryRoute
        fields = [
            "id", "order", "order_number",
            "origin_latitude", "origin_longitude", "origin_label",
            "destination_latitude", "destination_longitude", "destination_label",
            "route_geojson", "distance_meters", "duration_seconds",
            "distance_km", "duration_minutes",
            "waypoints", "estimated_arrival", "last_eta_update",
        ]
        read_only_fields = ["id"]


class LocationHistorySerializer(serializers.ModelSerializer):
    """Location history for route reconstruction."""

    class Meta:
        model = LocationHistory
        fields = [
            "id", "delivery_partner", "order",
            "latitude", "longitude", "speed", "heading", "accuracy",
            "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]


class GeocodingRequestSerializer(serializers.Serializer):
    """Input for forward geocoding."""
    address = serializers.CharField(max_length=500)


class ReverseGeocodingRequestSerializer(serializers.Serializer):
    """Input for reverse geocoding."""
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)


class ServiceAreaCheckSerializer(serializers.Serializer):
    """Check if coordinates are within the service area."""
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
