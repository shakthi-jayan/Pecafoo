"""
Promotions — Models
=====================
Coupon / Promotion management for platform-wide and restaurant-level discounts.
"""

import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone


class Promotion(models.Model):
    """
    A promotion or coupon code that can be applied to orders.
    Supports platform-wide or per-restaurant scoping.
    """

    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        FLAT = "flat", "Flat Amount"

    class Scope(models.TextChoices):
        PLATFORM = "platform", "Platform-wide"
        RESTAURANT = "restaurant", "Specific Restaurant"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    
    code = models.CharField(max_length=30, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE,
    )
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Percentage (0-100) or flat amount depending on type.",
    )
    max_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Cap on discount amount for percentage-based promos.",
    )
    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Minimum order subtotal required to use this promo.",
    )

    
    scope = models.CharField(
        max_length=20,
        choices=Scope.choices,
        default=Scope.PLATFORM,
    )
    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="promotions",
        help_text="Only set if scope is 'restaurant'.",
    )

    
    usage_limit = models.PositiveIntegerField(
        default=0, help_text="0 = unlimited."
    )
    usage_count = models.PositiveIntegerField(default=0)
    per_user_limit = models.PositiveIntegerField(
        default=1, help_text="Max uses per individual user."
    )

    
    start_date = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["code"], name="idx_promo_code"),
            models.Index(fields=["is_active", "expiry_date"], name="idx_promo_active"),
        ]

    def __str__(self):
        return f"{self.code} — {self.title}"

    @property
    def is_valid(self):
        """Check if promo is currently valid (active, not expired, within limits)."""
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.start_date or now > self.expiry_date:
            return False
        if self.usage_limit > 0 and self.usage_count >= self.usage_limit:
            return False
        return True

    def calculate_discount(self, subtotal):
        """Calculate discount amount for a given subtotal."""
        if subtotal < self.min_order_amount:
            return 0

        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = subtotal * (self.discount_value / 100)
            if self.max_discount:
                discount = min(discount, self.max_discount)
        else:
            discount = self.discount_value

        return min(discount, subtotal)


class PromotionUsage(models.Model):
    """Track who used which promotion and when."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    promotion = models.ForeignKey(
        Promotion, on_delete=models.CASCADE, related_name="usages"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="promotion_usages",
    )
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="promotion_usage",
    )
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-used_at"]
        indexes = [
            models.Index(fields=["promotion", "user"], name="idx_promo_usage_user"),
        ]

    def __str__(self):
        return f"{self.user.email} used {self.promotion.code}"
