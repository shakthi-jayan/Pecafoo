"""
Locations App — Models
========================
Geospatial models for service area management, delivery routing,
and location history tracking.

Note: Uses JSONField for GeoJSON storage and Shapely for geometry ops
instead of PostGIS, for easier cross-platform development.
"""

import uuid
from django.conf import settings
from django.db import models


class ServiceArea(models.Model):
    """
    Defines the operational area boundary.
    Stored as a GeoJSON polygon. All orders must originate and
    deliver within this boundary.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    boundary = models.JSONField(
        help_text="GeoJSON Polygon defining the service boundary"
    )
    is_active = models.BooleanField(default=True)
    center_latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    center_longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    zoom_level = models.IntegerField(default=13)
    max_delivery_radius_km = models.DecimalField(
        max_digits=5, decimal_places=2, default=10.00,
        help_text="Maximum delivery distance in kilometers"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"


class DeliveryRoute(models.Model):
    """
    Stores calculated route data between two points.
    Generated when an order is assigned to a delivery partner.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(
        "orders.Order", on_delete=models.CASCADE, related_name="route"
    )

    
    origin_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    origin_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    origin_label = models.CharField(max_length=200, blank=True, default="")

    
    destination_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_label = models.CharField(max_length=200, blank=True, default="")

    
    polyline = models.TextField(
        blank=True, default="",
        help_text="Encoded polyline or GeoJSON LineString"
    )
    route_geojson = models.JSONField(
        null=True, blank=True,
        help_text="Full GeoJSON LineString of the route"
    )
    distance_meters = models.IntegerField(default=0)
    duration_seconds = models.IntegerField(default=0)
    waypoints = models.JSONField(
        null=True, blank=True,
        help_text="List of turn-by-turn waypoint coordinates"
    )

    
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    last_eta_update = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        dist_km = self.distance_meters / 1000
        dur_min = self.duration_seconds // 60
        return f"Route for Order {self.order.order_number}: {dist_km:.1f}km, {dur_min}min"

    @property
    def distance_km(self):
        return round(self.distance_meters / 1000, 2)

    @property
    def duration_minutes(self):
        return round(self.duration_seconds / 60, 1)


class LocationHistory(models.Model):
    """
    Persistent location history for delivery partners.
    Used for analytics, audit trails, and route reconstruction.
    GPS coordinates are streamed via WebSocket → Redis → async Celery task → DB.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery_partner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="location_history",
    )
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="location_history",
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    speed = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        help_text="Speed in km/h"
    )
    heading = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="Bearing in degrees"
    )
    accuracy = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        help_text="GPS accuracy in meters"
    )
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["delivery_partner", "-timestamp"]),
            models.Index(fields=["order", "-timestamp"]),
        ]

    def __str__(self):
        return f"{self.delivery_partner.email} @ ({self.latitude}, {self.longitude})"
