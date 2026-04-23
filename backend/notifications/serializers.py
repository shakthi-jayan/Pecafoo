"""
Notifications — Serializers
==============================
"""

from rest_framework import serializers
from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""

    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "channel",
            "related_order_id",
            "is_read",
            "created_at",
            "read_at",
        ]
        read_only_fields = ["id", "created_at"]
