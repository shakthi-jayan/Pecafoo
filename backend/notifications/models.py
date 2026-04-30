"""
Notifications — Models
========================
In-app, push, and email notification management.
"""

import uuid
from django.conf import settings
from django.db import models


class Notification(models.Model):
    """
    Notification model for all types of notifications.
    Supports in-app, push, and email notifications.
    """

    class NotificationType(models.TextChoices):
        ORDER_PLACED = "order_placed", "Order Placed"
        ORDER_CONFIRMED = "order_confirmed", "Order Confirmed"
        ORDER_PREPARING = "order_preparing", "Order Being Prepared"
        ORDER_READY = "order_ready", "Order Ready"
        ORDER_PICKED_UP = "order_picked_up", "Order Picked Up"
        ORDER_DELIVERED = "order_delivered", "Order Delivered"
        ORDER_CANCELLED = "order_cancelled", "Order Cancelled"
        NEW_ORDER = "new_order", "New Order (Restaurant)"
        DELIVERY_ASSIGNED = "delivery_assigned", "Delivery Assigned"
        PROMOTION = "promotion", "Promotion"
        SYSTEM = "system", "System Notification"

    class Channel(models.TextChoices):
        IN_APP = "in_app", "In-App"
        PUSH = "push", "Push Notification"
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        db_index=True,
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    channel = models.CharField(
        max_length=10,
        choices=Channel.choices,
        default=Channel.IN_APP,
    )

    
    related_order_id = models.UUIDField(null=True, blank=True)

    
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)

    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "notification"
        verbose_name_plural = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} → {self.user.email}"
