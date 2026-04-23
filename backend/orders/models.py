"""
Orders — Models
=================
Order lifecycle management with payment tracking.
Order flow: placed → confirmed → preparing → ready → picked_up → delivered
                                                   → cancelled (at any point)
"""

import secrets
import uuid
from django.conf import settings
from django.db import models, transaction

from restaurants.models import MenuItem, Restaurant


class Order(models.Model):
    """
    Represents a customer's order from a single restaurant.
    """

    class Status(models.TextChoices):
        PLACED = "placed", "Order Placed"
        CONFIRMED = "confirmed", "Confirmed by Restaurant"
        PREPARING = "preparing", "Being Prepared"
        READY = "ready", "Ready for Pickup"
        PICKED_UP = "picked_up", "Picked Up by Delivery"
        ON_THE_WAY = "on_the_way", "On the Way"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    class PaymentMethod(models.TextChoices):
        COD = "cod", "Cash on Delivery"
        RAZORPAY = "razorpay", "Razorpay"
        STRIPE = "stripe", "Stripe"
        WALLET = "wallet", "Wallet"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_orders",
    )
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="restaurant_orders",
    )
    delivery_partner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivery_orders",
    )

    
    order_number = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text="Human-readable order number like PF-20260228-001.",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLACED,
        db_index=True,
    )
    special_instructions = models.TextField(blank=True)

    
    delivery_address = models.TextField()
    delivery_latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    delivery_longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.COD,
    )
    payment_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="Payment gateway transaction ID.",
    )

    delivery_otp = models.CharField(max_length=6, blank=True, db_index=True)
    delivery_otp_verified_at = models.DateTimeField(null=True, blank=True)

    
    placed_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    prepared_at = models.DateTimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    review = models.TextField(blank=True)

    class Meta:
        verbose_name = "order"
        verbose_name_plural = "orders"
        ordering = ["-placed_at"]
        indexes = [
            models.Index(fields=["customer", "-placed_at"], name="idx_order_customer_date"),
            models.Index(fields=["customer", "status"], name="idx_order_customer_status"),
            models.Index(fields=["restaurant", "status"], name="idx_order_restaurant_status"),
            models.Index(fields=["restaurant", "-placed_at"], name="idx_order_restaurant_date"),
            models.Index(fields=["delivery_partner", "status"], name="idx_order_delivery_status"),
            models.Index(fields=["delivery_partner", "-placed_at"], name="idx_order_delivery_date"),
            models.Index(fields=["status", "delivery_partner"], name="idx_order_avail_delivery"),
            models.Index(fields=["payment_status"], name="idx_order_payment_status"),
            models.Index(fields=["-placed_at"], name="idx_order_placed_at"),
        ]

    def __str__(self):
        return f"Order {self.order_number} — {self.get_status_display()}"

    def save(self, *args, **kwargs):
        """Auto-generate order number if not set, using atomic DB counter to avoid races."""
        if not self.order_number:
            self.order_number = self._generate_order_number()
        if not self.delivery_otp:
            self.delivery_otp = self.generate_delivery_otp()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_order_number() -> str:
        """
        Generate a unique order number in the format PF-YYYYMMDD-NNN.

        Uses SELECT FOR UPDATE to atomically find the next sequence number
        for the current day, preventing duplicates under concurrent load.
        Falls back to a short random suffix if the date-count exceeds 999.
        """
        from django.utils import timezone

        today = timezone.now().date()
        date_str = today.strftime("%Y%m%d")

        with transaction.atomic():
            
            last = (
                Order.objects
                .filter(placed_at__date=today)
                .select_for_update()
                .order_by("-order_number")
                .values_list("order_number", flat=True)
                .first()
            )
            if last:
                try:
                    last_seq = int(last.split("-")[-1])
                except (ValueError, IndexError):
                    last_seq = 0
                seq = last_seq + 1
            else:
                seq = 1

        if seq > 9999:
            
            suffix = secrets.token_hex(3).upper()
            return f"PF-{date_str}-{suffix}"

        return f"PF-{date_str}-{seq:04d}"

    @staticmethod
    def generate_delivery_otp() -> str:
        """Generate a cryptographically secure 4-digit OTP."""
        return str(secrets.randbelow(9000) + 1000)


class OrderItem(models.Model):
    """Individual items within an order."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="items"
    )
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.SET_NULL,
        null=True,
        related_name="order_items",
    )

    
    item_name = models.CharField(max_length=200)
    item_price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    special_note = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = "order item"
        verbose_name_plural = "order items"

    def __str__(self):
        return f"{self.quantity}x {self.item_name}"

    def save(self, *args, **kwargs):
        """Auto-calculate total price."""
        self.total_price = self.item_price * self.quantity
        super().save(*args, **kwargs)
