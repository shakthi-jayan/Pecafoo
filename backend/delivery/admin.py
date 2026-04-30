from django.contrib import admin
from delivery.models import DeliveryEarning, DeliveryLocationLog, DeliveryPartnerProfile


@admin.register(DeliveryPartnerProfile)
class DeliveryPartnerProfileAdmin(admin.ModelAdmin):
    list_display = [
        "user", "vehicle_type", "is_verified",
        "is_available", "total_deliveries", "total_earnings",
    ]
    list_filter = ["vehicle_type", "is_verified", "is_available"]
    search_fields = ["user__email", "vehicle_number"]
    list_editable = ["is_verified"]


@admin.register(DeliveryLocationLog)
class DeliveryLocationLogAdmin(admin.ModelAdmin):
    list_display = ["delivery_partner", "order", "latitude", "longitude", "timestamp"]
    list_filter = ["timestamp"]


@admin.register(DeliveryEarning)
class DeliveryEarningAdmin(admin.ModelAdmin):
    list_display = ["delivery_partner", "order", "amount", "tip", "total", "earned_at"]
    list_filter = ["earned_at"]
