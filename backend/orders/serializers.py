"""
Orders — Serializers
======================
"""

from rest_framework import serializers
from orders.models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for items within an order."""

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "menu_item",
            "item_name",
            "item_price",
            "quantity",
            "total_price",
            "special_note",
        ]
        read_only_fields = ["id", "item_name", "item_price", "total_price"]


class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer for creating order items (input from customer)."""

    menu_item_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    special_note = serializers.CharField(max_length=255, required=False, default="", allow_blank=True)


class OrderSerializer(serializers.ModelSerializer):
    """Full order serializer with nested items."""

    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    restaurant_name = serializers.CharField(source="restaurant.name", read_only=True)
    delivery_partner_name = serializers.CharField(
        source="delivery_partner.full_name", read_only=True, default=None
    )
    delivery_otp = serializers.SerializerMethodField()
    delivery_otp_verified = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer",
            "customer_name",
            "restaurant",
            "restaurant_name",
            "delivery_partner",
            "delivery_partner_name",
            "status",
            "special_instructions",
            "delivery_address",
            "delivery_latitude",
            "delivery_longitude",
            "subtotal",
            "delivery_fee",
            "tax",
            "discount",
            "total",
            "payment_status",
            "payment_method",
            "payment_id",
            "delivery_otp",
            "delivery_otp_verified",
            "rating",
            "review",
            "items",
            "placed_at",
            "confirmed_at",
            "prepared_at",
            "picked_up_at",
            "delivered_at",
            "cancelled_at",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "customer",
            "subtotal",
            "tax",
            "total",
            "placed_at",
        ]

    def get_delivery_otp(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return None
        if obj.status == Order.Status.DELIVERED:
            return None
        if user == obj.customer or user == obj.delivery_partner or getattr(user, "role", None) == "admin":
            return obj.delivery_otp
        return None

    def get_delivery_otp_verified(self, obj):
        return bool(obj.delivery_otp_verified_at)


class OrderCreateSerializer(serializers.Serializer):
    """
    Input serializer for creating a new order.
    Customer provides restaurant, items, delivery address, and payment method.
    """

    restaurant_id = serializers.UUIDField()
    items = OrderItemCreateSerializer(many=True)
    delivery_address = serializers.CharField()
    delivery_latitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False
    )
    delivery_longitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False
    )
    special_instructions = serializers.CharField(required=False, default="", allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
        default=Order.PaymentMethod.COD,
    )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value


class OrderStatusUpdateSerializer(serializers.Serializer):
    """For restaurant owners and delivery partners to update order status."""

    status = serializers.ChoiceField(choices=Order.Status.choices)
    delivery_otp = serializers.CharField(required=False, allow_blank=True, max_length=6)


class OrderRatingSerializer(serializers.Serializer):
    """For customers to rate a delivered order."""

    rating = serializers.IntegerField(min_value=1, max_value=5)
    review = serializers.CharField(required=False, default="")
