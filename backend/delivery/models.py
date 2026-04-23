"""
Delivery — Models
===================
Delivery partner profile, location tracking, and earnings.
"""

import uuid
from django.conf import settings
from django.db import models
from django.db.models import Q


class DeliveryPartnerProfile(models.Model):
    """
    Extended profile for users with the 'delivery' role.
    Tracks availability, vehicle info, and verification status.
    """

    class VehicleType(models.TextChoices):
        BICYCLE = "bicycle", "Bicycle"
        MOTORCYCLE = "motorcycle", "Motorcycle"
        SCOOTER = "scooter", "Scooter"
        CAR = "car", "Car"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="delivery_profile",
    )

    
    vehicle_type = models.CharField(
        max_length=20,
        choices=VehicleType.choices,
        default=VehicleType.MOTORCYCLE,
    )
    vehicle_number = models.CharField(max_length=20, blank=True)
    license_number = models.CharField(max_length=50, blank=True)

    
    is_verified = models.BooleanField(
        default=False,
        help_text="Admin-approved verification status.",
    )
    id_proof = models.FileField(
        upload_to="delivery/id_proofs/", blank=True, null=True
    )
    license_image = models.FileField(
        upload_to="delivery/licenses/", blank=True, null=True
    )

    
    is_available = models.BooleanField(
        default=False,
        help_text="Whether the partner is currently accepting deliveries.",
    )

    
    current_latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    current_longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    last_location_update = models.DateTimeField(null=True, blank=True)

    
    total_deliveries = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.00
    )
    total_earnings = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.00
    )

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "delivery partner profile"
        verbose_name_plural = "delivery partner profiles"

    def __str__(self):
        return f"Delivery: {self.user.email}"


class DeliveryLocationLog(models.Model):
    """
    Logs delivery partner's location during an active delivery.
    Used for real-time order tracking.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery_partner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="location_logs",
    )
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="delivery_locations",
        null=True,
        blank=True,
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "delivery location log"
        verbose_name_plural = "delivery location logs"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.delivery_partner.email} @ {self.timestamp}"


class DeliveryEarning(models.Model):
    """Track earnings per delivery."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery_partner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="earnings",
    )
    order = models.OneToOneField(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="delivery_earning",
    )
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    tip = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=8, decimal_places=2)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "delivery earning"
        verbose_name_plural = "delivery earnings"
        ordering = ["-earned_at"]

    def __str__(self):
        return f"₹{self.total} — {self.order.order_number}"

    def save(self, *args, **kwargs):
        self.total = self.amount + self.tip
        super().save(*args, **kwargs)


class DeliveryPricingConfig(models.Model):
    """Global customer-facing delivery pricing configuration."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    base_fee = models.DecimalField(max_digits=6, decimal_places=2)
    per_km_rate = models.DecimalField(max_digits=6, decimal_places=2)
    base_distance_km = models.FloatField(default=3.0)
    min_order_fee_threshold = models.DecimalField(max_digits=8, decimal_places=2)
    small_cart_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    platform_margin_percent = models.FloatField(default=0)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["is_active"],
                condition=Q(is_active=True),
                name="uniq_active_delivery_pricing_config",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Delivery Pricing Config ({'active' if self.is_active else 'inactive'})"


class SurgeConfig(models.Model):
    """Time-window, manual, or weather-based surge multiplier rules."""

    class TriggerType(models.TextChoices):
        TIME_WINDOW = "time_window", "Time Window"
        WEATHER = "weather", "Weather"
        MANUAL = "manual", "Manual"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    multiplier = models.DecimalField(max_digits=4, decimal_places=2)
    trigger_type = models.CharField(max_length=20, choices=TriggerType.choices)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    days_of_week = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-priority", "-created_at"]

    def __str__(self):
        return f"{self.name} x{self.multiplier}"


class PartnerPayoutConfig(models.Model):
    """Delivery partner payout configuration."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    base_pay = models.DecimalField(max_digits=6, decimal_places=2)
    per_km_incentive = models.DecimalField(max_digits=6, decimal_places=2)
    peak_hour_bonus = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    rain_bonus = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    long_distance_threshold_km = models.FloatField(default=8.0)
    long_distance_bonus = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["is_active"],
                condition=Q(is_active=True),
                name="uniq_active_partner_payout_config",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Partner Payout Config ({'active' if self.is_active else 'inactive'})"


class IncentiveSlab(models.Model):
    """Daily/weekly incentive slabs for delivery partners."""

    class Period(models.TextChoices):
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    period = models.CharField(max_length=10, choices=Period.choices)
    orders_required = models.IntegerField()
    bonus_amount = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["period", "orders_required"]

    def __str__(self):
        return f"{self.period} slab {self.orders_required} => {self.bonus_amount}"


class DeliveryFeeBreakdown(models.Model):
    """Persistent audit snapshot of customer fee and partner payout for an order."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="delivery_fee_breakdown",
    )
    distance_km = models.FloatField(default=0)
    base_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    distance_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    surge_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    small_cart_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_customer_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    partner_base_pay = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    partner_distance_incentive = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    partner_peak_bonus = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    partner_rain_bonus = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    partner_long_distance_bonus = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_partner_payout = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    platform_margin = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    surge_config_applied = models.ForeignKey(
        SurgeConfig,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applied_breakdowns",
    )
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-calculated_at"]

    def __str__(self):
        return f"Breakdown for {self.order.order_number}"
