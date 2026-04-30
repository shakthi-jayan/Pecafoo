"""
Promotions — Serializers
"""

from rest_framework import serializers
from promotions.models import Promotion, PromotionUsage


class PromotionSerializer(serializers.ModelSerializer):
    is_valid = serializers.ReadOnlyField()

    class Meta:
        model = Promotion
        fields = [
            "id", "code", "title", "description",
            "discount_type", "discount_value", "max_discount",
            "min_order_amount", "scope", "restaurant",
            "usage_limit", "usage_count", "per_user_limit",
            "start_date", "expiry_date", "is_active", "is_valid",
            "created_at",
        ]
        read_only_fields = ["id", "usage_count", "created_at"]


class PromotionApplySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=30)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    restaurant_id = serializers.UUIDField(required=False)


class PromotionUsageSerializer(serializers.ModelSerializer):
    promotion_code = serializers.CharField(source="promotion.code", read_only=True)

    class Meta:
        model = PromotionUsage
        fields = ["id", "promotion", "promotion_code", "discount_applied", "used_at"]
        read_only_fields = ["id", "used_at"]
