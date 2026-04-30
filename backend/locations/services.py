"""
Locations — Routing & Geocoding Services
============================================
Production-grade services using free, self-hostable APIs:
- OSRM (Open Source Routing Machine) for route calculation
- Nominatim (OSM Geocoder) for address ↔ coordinate conversion
- Shapely for point-in-polygon geofencing
"""

import logging
import requests
from decimal import Decimal
from math import radians, sin, cos, sqrt, atan2

from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


OSRM_BASE_URL = getattr(settings, "OSRM_BASE_URL", "https://router.project-osrm.org")
NOMINATIM_BASE_URL = getattr(settings, "NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
ORS_API_KEY = getattr(settings, "ORS_API_KEY", "")
ORS_BASE_URL = "https://api.openrouteservice.org"

REQUEST_TIMEOUT = 10  






def get_route_osrm(origin_lat, origin_lng, dest_lat, dest_lng):
    """
    Get driving route from OSRM.

    Returns:
        dict with distance_meters, duration_seconds, route_geojson, waypoints
    """
    try:
        
        url = (
            f"{OSRM_BASE_URL}/route/v1/driving/"
            f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
            f"?overview=full&geometries=geojson&steps=true"
        )

        response = requests.get(url, timeout=REQUEST_TIMEOUT, headers={
            "User-Agent": "Pecafoo/1.0"
        })
        response.raise_for_status()
        data = response.json()

        if data.get("code") != "Ok" or not data.get("routes"):
            logger.warning(f"OSRM returned no routes: {data.get('code')}")
            return None

        route = data["routes"][0]
        geometry = route.get("geometry", {})
        legs = route.get("legs", [])

        
        waypoints = []
        for leg in legs:
            for step in leg.get("steps", []):
                maneuver = step.get("maneuver", {})
                location = maneuver.get("location", [])
                if location:
                    waypoints.append({
                        "lng": location[0],
                        "lat": location[1],
                        "instruction": step.get("name", ""),
                        "distance": step.get("distance", 0),
                        "duration": step.get("duration", 0),
                        "modifier": maneuver.get("modifier", ""),
                        "type": maneuver.get("type", ""),
                    })

        return {
            "distance_meters": int(route.get("distance", 0)),
            "duration_seconds": int(route.get("duration", 0)),
            "route_geojson": {
                "type": "Feature",
                "geometry": geometry,
                "properties": {
                    "distance": route.get("distance", 0),
                    "duration": route.get("duration", 0),
                },
            },
            "waypoints": waypoints,
            "polyline": "",  
        }

    except requests.RequestException as e:
        logger.error(f"OSRM routing failed: {e}")
        return None


def get_route_ors(origin_lat, origin_lng, dest_lat, dest_lng):
    """
    Fallback: Get route from OpenRouteService API.
    Requires ORS_API_KEY in settings.
    """
    if not ORS_API_KEY:
        logger.warning("ORS API key not configured, skipping ORS routing.")
        return None

    try:
        url = f"{ORS_BASE_URL}/v2/directions/driving-car"
        headers = {
            "Authorization": ORS_API_KEY,
            "Content-Type": "application/json",
        }
        body = {
            "coordinates": [
                [float(origin_lng), float(origin_lat)],
                [float(dest_lng), float(dest_lat)],
            ],
            "geometry": True,
            "instructions": True,
        }

        response = requests.post(url, json=body, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        if not data.get("routes"):
            return None

        route = data["routes"][0]
        summary = route.get("summary", {})

        return {
            "distance_meters": int(summary.get("distance", 0)),
            "duration_seconds": int(summary.get("duration", 0)),
            "route_geojson": {
                "type": "Feature",
                "geometry": route.get("geometry", {}),
                "properties": summary,
            },
            "waypoints": [],
            "polyline": "",
        }

    except requests.RequestException as e:
        logger.error(f"ORS routing failed: {e}")
        return None


def calculate_route(origin_lat, origin_lng, dest_lat, dest_lng):
    """
    Calculate route using OSRM (primary) with ORS fallback.
    Returns route data dict or None.
    """
    
    route = get_route_osrm(origin_lat, origin_lng, dest_lat, dest_lng)

    
    if route is None:
        route = get_route_ors(origin_lat, origin_lng, dest_lat, dest_lng)

    
    if route is None:
        distance = haversine_distance(
            float(origin_lat), float(origin_lng),
            float(dest_lat), float(dest_lng),
        )
        
        est_distance = int(distance * 1.3 * 1000)
        est_duration = int((distance * 1.3 / 25) * 3600)

        route = {
            "distance_meters": est_distance,
            "duration_seconds": est_duration,
            "route_geojson": {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [float(origin_lng), float(origin_lat)],
                        [float(dest_lng), float(dest_lat)],
                    ],
                },
                "properties": {
                    "source": "straight_line_estimate",
                    "distance": est_distance,
                    "duration": est_duration,
                },
            },
            "waypoints": [],
            "polyline": "",
        }
        logger.info("Using straight-line distance estimate (OSRM + ORS both failed).")

    return route






def geocode_address(address_string):
    """
    Forward geocoding: address string → coordinates.
    Uses Nominatim (OpenStreetMap).
    """
    try:
        url = f"{NOMINATIM_BASE_URL}/search"
        params = {
            "q": address_string,
            "format": "json",
            "limit": 5,
            "addressdetails": 1,
        }
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT, headers={
            "User-Agent": "Pecafoo/1.0"
        })
        response.raise_for_status()
        results = response.json()

        if not results:
            return None

        return [
            {
                "display_name": r.get("display_name", ""),
                "latitude": float(r.get("lat", 0)),
                "longitude": float(r.get("lon", 0)),
                "address": r.get("address", {}),
                "type": r.get("type", ""),
            }
            for r in results
        ]

    except requests.RequestException as e:
        logger.error(f"Geocoding failed: {e}")
        return None


def reverse_geocode(latitude, longitude):
    """
    Reverse geocoding: coordinates → address string.
    Uses Nominatim (OpenStreetMap).
    """
    try:
        url = f"{NOMINATIM_BASE_URL}/reverse"
        params = {
            "lat": latitude,
            "lon": longitude,
            "format": "json",
            "addressdetails": 1,
            "zoom": 18,
        }
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT, headers={
            "User-Agent": "Pecafoo/1.0"
        })
        response.raise_for_status()
        data = response.json()

        if data.get("error"):
            return None

        address = data.get("address", {})
        return {
            "display_name": data.get("display_name", ""),
            "road": address.get("road", ""),
            "suburb": address.get("suburb", ""),
            "city": address.get("city", address.get("town", address.get("village", ""))),
            "state": address.get("state", ""),
            "postcode": address.get("postcode", ""),
            "country": address.get("country", ""),
            "latitude": float(data.get("lat", latitude)),
            "longitude": float(data.get("lon", longitude)),
        }

    except requests.RequestException as e:
        logger.error(f"Reverse geocoding failed: {e}")
        return None






def point_in_polygon(lat, lng, geojson_polygon):
    """
    Check if a point (lat, lng) falls within a GeoJSON polygon.
    Uses ray casting algorithm (no external dependency needed).
    """
    try:
        
        if geojson_polygon.get("type") == "Feature":
            geometry = geojson_polygon.get("geometry", {})
        else:
            geometry = geojson_polygon

        if geometry.get("type") not in ("Polygon", "MultiPolygon"):
            logger.error(f"Unsupported geometry type: {geometry.get('type')}")
            return False

        coords = geometry.get("coordinates", [])
        if geometry["type"] == "Polygon":
            
            return _ray_cast(float(lng), float(lat), coords[0])
        elif geometry["type"] == "MultiPolygon":
            
            return any(_ray_cast(float(lng), float(lat), poly[0]) for poly in coords)

    except Exception as e:
        logger.error(f"Point-in-polygon check failed: {e}")
        return False


def _ray_cast(x, y, polygon):
    """Ray casting algorithm for point-in-polygon. Coords are [lng, lat]."""
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i][0], polygon[i][1]
        xj, yj = polygon[j][0], polygon[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def is_within_service_area(lat, lng):
    """
    Check if coordinates are within the active service area.
    Returns tuple: (is_within: bool, service_area_name: str|None)
    """
    from locations.models import ServiceArea

    active_areas = ServiceArea.objects.filter(is_active=True)
    for area in active_areas:
        if point_in_polygon(lat, lng, area.boundary):
            return True, area.name
    return False, None






def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate great-circle distance in kilometers."""
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def meters_between(lat1, lon1, lat2, lon2):
    """Distance in meters between two points."""
    return haversine_distance(lat1, lon1, lat2, lon2) * 1000






def create_delivery_route(order):
    """
    Calculate and store a delivery route for an order.
    Called when a delivery partner is assigned.
    """
    from locations.models import DeliveryRoute

    restaurant = order.restaurant

    
    if not all([restaurant.latitude, restaurant.longitude,
                order.delivery_latitude, order.delivery_longitude]):
        logger.warning(f"Missing coordinates for route calculation on order {order.order_number}")
        return None

    
    route_data = calculate_route(
        restaurant.latitude, restaurant.longitude,
        order.delivery_latitude, order.delivery_longitude,
    )

    if not route_data:
        return None

    
    eta = timezone.now() + timezone.timedelta(seconds=route_data["duration_seconds"])

    
    delivery_route, created = DeliveryRoute.objects.update_or_create(
        order=order,
        defaults={
            "origin_latitude": restaurant.latitude,
            "origin_longitude": restaurant.longitude,
            "origin_label": restaurant.name,
            "destination_latitude": order.delivery_latitude,
            "destination_longitude": order.delivery_longitude,
            "destination_label": order.delivery_address[:200] if order.delivery_address else "",
            "polyline": route_data.get("polyline", ""),
            "route_geojson": route_data.get("route_geojson"),
            "distance_meters": route_data["distance_meters"],
            "duration_seconds": route_data["duration_seconds"],
            "waypoints": route_data.get("waypoints"),
            "estimated_arrival": eta,
            "last_eta_update": timezone.now(),
        },
    )

    logger.info(
        f"Route {'created' if created else 'updated'} for order {order.order_number}: "
        f"{delivery_route.distance_km}km, {delivery_route.duration_minutes}min"
    )

    return delivery_route
