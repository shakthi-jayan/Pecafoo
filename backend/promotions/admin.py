from django.contrib import admin
from promotions.models import Promotion, PromotionUsage


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ["code", "title", "discount_type", "discount_value", "is_active", "expiry_date", "usage_count"]
    list_filter = ["is_active", "discount_type", "scope"]
    search_fields = ["code", "title"]
    readonly_fields = ["usage_count", "created_at", "updated_at"]


@admin.register(PromotionUsage)
class PromotionUsageAdmin(admin.ModelAdmin):
    list_display = ["promotion", "user", "discount_applied", "used_at"]
    list_filter = ["used_at"]
    readonly_fields = ["used_at"]
