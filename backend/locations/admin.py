"""
Locations — Admin Registration
"""
from django.contrib import admin
from locations.models import ServiceArea, DeliveryRoute, LocationHistory


@admin.register(ServiceArea)
class ServiceAreaAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "center_latitude", "center_longitude", "max_delivery_radius_km", "updated_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]


@admin.register(DeliveryRoute)
class DeliveryRouteAdmin(admin.ModelAdmin):
    list_display = ["order", "distance_km", "duration_minutes", "estimated_arrival", "created_at"]
    raw_id_fields = ["order"]


@admin.register(LocationHistory)
class LocationHistoryAdmin(admin.ModelAdmin):
    list_display = ["delivery_partner", "order", "latitude", "longitude", "speed", "timestamp"]
    list_filter = ["timestamp"]
    raw_id_fields = ["delivery_partner", "order"]
