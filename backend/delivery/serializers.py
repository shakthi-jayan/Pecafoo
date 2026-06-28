"""
Delivery serializers.
"""

from rest_framework import serializers
from config.media_utils import SmartFileField

from delivery.models import (
    DeliveryEarning,
    DeliveryFeeBreakdown,
    DeliveryLocationLog,
    DeliveryPartnerProfile,
    DeliveryPricingConfig,
    IncentiveSlab,
    PartnerPayoutConfig,
    SurgeConfig,
)


class DeliveryPartnerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    id_proof = SmartFileField(read_only=True)
    license_image = SmartFileField(read_only=True)
    class Meta:
        model = DeliveryPartnerProfile
        fields = [
            "id",
            "email",
            "full_name",
            "vehicle_type",
            "vehicle_number",
            "license_number",
            "driving_license_number",
            "rc_number",
            "is_verified",
            "id_proof",
            "license_image",
            "is_available",
            "current_latitude",
            "current_longitude",
            "total_deliveries",
            "average_rating",
            "total_earnings",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "is_verified",
            "total_deliveries",
            "average_rating",
            "total_earnings",
            "created_at",
        ]


class DeliveryVerificationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    id_proof = SmartFileField(read_only=True)
    license_image = SmartFileField(read_only=True)
    class Meta:
        model = DeliveryPartnerProfile
        fields = [
            "id",
            "full_name",
            "email",
            "phone_number",
            "vehicle_type",
            "vehicle_number",
            "license_number",
            "driving_license_number",
            "rc_number",
            "id_proof",
            "license_image",
            "is_verified",
            "created_at",
            "updated_at",
        ]


class DeliveryLocationUpdateSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    order_id = serializers.UUIDField(required=False)


class AvailabilitySerializer(serializers.Serializer):
    is_available = serializers.BooleanField()


class DeliveryEarningSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source="order.order_number", read_only=True)

    class Meta:
        model = DeliveryEarning
        fields = ["id", "order", "order_number", "amount", "tip", "total", "earned_at"]
        read_only_fields = ["id", "total", "earned_at"]


class DeliveryLocationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryLocationLog
        fields = ["id", "latitude", "longitude", "timestamp"]
        read_only_fields = ["id", "timestamp"]


class DeliveryEstimateRequestSerializer(serializers.Serializer):
    restaurant_id = serializers.UUIDField()
    customer_lat = serializers.FloatField()
    customer_lng = serializers.FloatField()
    cart_value = serializers.DecimalField(max_digits=10, decimal_places=2)


class DeliveryPricingConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPricingConfig
        fields = [
            "id",
            "base_fee",
            "per_km_rate",
            "base_distance_km",
            "min_order_fee_threshold",
            "small_cart_fee",
            "platform_margin_percent",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class PartnerPayoutConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerPayoutConfig
        fields = [
            "id",
            "base_pay",
            "per_km_incentive",
            "peak_hour_bonus",
            "rain_bonus",
            "long_distance_threshold_km",
            "long_distance_bonus",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class SurgeConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurgeConfig
        fields = [
            "id",
            "name",
            "multiplier",
            "trigger_type",
            "start_time",
            "end_time",
            "days_of_week",
            "is_active",
            "priority",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class IncentiveSlabSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncentiveSlab
        fields = ["id", "period", "orders_required", "bonus_amount", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class DeliveryFeeBreakdownSerializer(serializers.ModelSerializer):
    surge_label = serializers.CharField(source="surge_config_applied.name", read_only=True)

    class Meta:
        model = DeliveryFeeBreakdown
        fields = [
            "order",
            "distance_km",
            "base_fee",
            "distance_fee",
            "surge_fee",
            "small_cart_fee",
            "total_customer_fee",
            "partner_base_pay",
            "partner_distance_incentive",
            "partner_peak_bonus",
            "partner_rain_bonus",
            "partner_long_distance_bonus",
            "total_partner_payout",
            "platform_margin",
            "surge_label",
            "calculated_at",
        ]
