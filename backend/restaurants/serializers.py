"""
Restaurants — Serializers
===========================
"""

from rest_framework import serializers
from orders.models import Order
from restaurants.models import MenuCategory, MenuItem, Restaurant
from config.media_utils import SmartImageField, SmartFileField


class MenuItemSerializer(serializers.ModelSerializer):
    """Serializer for individual menu items."""

    effective_price = serializers.ReadOnlyField()
    has_discount = serializers.ReadOnlyField()
    restaurant_name = serializers.CharField(source="restaurant.name", read_only=True)
    restaurant_slug = serializers.CharField(source="restaurant.slug", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    image = SmartImageField(read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "category",
            "name",
            "description",
            "image",
            "food_type",
            "price",
            "discount_price",
            "effective_price",
            "has_discount",
            "restaurant_name",
            "restaurant_slug",
            "category_name",
            "is_available",
            "is_bestseller",
            "calories",
            "preparation_time",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class MenuCategorySerializer(serializers.ModelSerializer):
    """Serializer for menu categories with nested items."""

    items = MenuItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    image = SmartImageField(read_only=True)

    class Meta:
        model = MenuCategory
        fields = [
            "id",
            "name",
            "description",
            "image",
            "sort_order",
            "is_active",
            "items",
            "item_count",
        ]
        read_only_fields = ["id"]

    def get_item_count(self, obj):
        return obj.items.filter(is_available=True).count()


class RestaurantListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for restaurant listings."""

    owner_name = serializers.CharField(source="owner.full_name", read_only=True)
    logo = SmartImageField(read_only=True)
    cover_image = SmartImageField(read_only=True)
    business_license = SmartFileField(read_only=True)
    food_safety_certificate = SmartFileField(read_only=True)
    owner_id_proof = SmartFileField(read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "slug",
            "cuisine_type",
            "logo",
            "cover_image",
            "business_license",
            "food_safety_certificate",
            "owner_id_proof",
            "gst_number",
            "fssai_license_number",
            "city",
            "average_rating",
            "total_ratings",
            "average_delivery_time",
            "minimum_order_amount",
            "delivery_fee",
            "is_open",
            "is_featured",
            "owner_name",
        ]


class RestaurantDetailSerializer(serializers.ModelSerializer):
    """Full serializer for restaurant detail view with nested categories."""

    categories = MenuCategorySerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source="owner.full_name", read_only=True)
    logo = SmartImageField(read_only=True)
    cover_image = SmartImageField(read_only=True)
    business_license = SmartFileField(read_only=True)
    food_safety_certificate = SmartFileField(read_only=True)
    owner_id_proof = SmartFileField(read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "owner",
            "owner_name",
            "name",
            "slug",
            "description",
            "cuisine_type",
            "logo",
            "cover_image",
            "business_license",
            "food_safety_certificate",
            "owner_id_proof",
            "gst_number",
            "fssai_license_number",
            "phone",
            "email",
            "address",
            "city",
            "state",
            "pincode",
            "latitude",
            "longitude",
            "opening_time",
            "closing_time",
            "is_open",
            "average_delivery_time",
            "minimum_order_amount",
            "delivery_fee",
            "average_rating",
            "total_ratings",
            "approval_status",
            "is_featured",
            "is_active",
            "categories",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "average_rating",
            "total_ratings",
            "approval_status",
            "is_featured",
            "created_at",
            "updated_at",
        ]


class RestaurantCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for restaurant owners to create/update their restaurant."""

    class Meta:
        model = Restaurant
        fields = [
            "name",
            "description",
            "cuisine_type",
            "logo",
            "cover_image",
            "business_license",
            "food_safety_certificate",
            "owner_id_proof",
            "gst_number",
            "fssai_license_number",
            "phone",
            "email",
            "address",
            "city",
            "state",
            "pincode",
            "latitude",
            "longitude",
            "opening_time",
            "closing_time",
            "is_open",
            "average_delivery_time",
            "minimum_order_amount",
            "delivery_fee",
        ]


class RestaurantVerificationSerializer(serializers.ModelSerializer):
    """Admin-facing serializer for restaurant verification review."""

    owner_name = serializers.CharField(source="owner.full_name", read_only=True)
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    owner_phone_number = serializers.CharField(source="owner.phone_number", read_only=True)
    business_license = SmartFileField(read_only=True)
    food_safety_certificate = SmartFileField(read_only=True)
    owner_id_proof = SmartFileField(read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "slug",
            "owner_name",
            "owner_email",
            "owner_phone_number",
            "description",
            "cuisine_type",
            "city",
            "state",
            "phone",
            "approval_status",
            "is_active",
            "business_license",
            "food_safety_certificate",
            "owner_id_proof",
            "gst_number",
            "fssai_license_number",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "name",
            "slug",
            "owner_name",
            "owner_email",
            "owner_phone_number",
            "description",
            "cuisine_type",
            "city",
            "state",
            "phone",
            "business_license",
            "food_safety_certificate",
            "owner_id_proof",
            "created_at",
            "updated_at",
        ]


class RestaurantReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    date = serializers.DateTimeField(source="delivered_at", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_name",
            "rating",
            "review",
            "date",
        ]
