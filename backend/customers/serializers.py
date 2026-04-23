"""
Customers Serializers
"""

from rest_framework import serializers
from customers.models import Address, Cart, CustomerProfile, FoodWishlist, Wishlist
from config.media_utils import SmartImageField


class CustomerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            "id",
            "email",
            "full_name",
            "preferred_cuisine",
            "dietary_preference",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "address_type",
            "label",
            "full_address",
            "landmark",
            "city",
            "state",
            "pincode",
            "latitude",
            "longitude",
            "is_default",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class WishlistSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source="restaurant.name", read_only=True)
    restaurant_slug = serializers.CharField(source="restaurant.slug", read_only=True)
    restaurant_cuisine = serializers.CharField(source="restaurant.cuisine_type", read_only=True)
    restaurant_rating = serializers.CharField(source="restaurant.average_rating", read_only=True)
    restaurant_delivery_time = serializers.IntegerField(source="restaurant.average_delivery_time", read_only=True)
    restaurant_image = SmartImageField(source="restaurant.cover_image", read_only=True)
    restaurant_is_open = serializers.BooleanField(source="restaurant.is_open", read_only=True)

    class Meta:
        model = Wishlist
        fields = [
            "id",
            "restaurant",
            "restaurant_name",
            "restaurant_slug",
            "restaurant_cuisine",
            "restaurant_rating",
            "restaurant_delivery_time",
            "restaurant_image",
            "restaurant_is_open",
            "added_at",
        ]
        read_only_fields = ["id", "added_at"]


class FoodWishlistSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="menu_item.name", read_only=True)
    item_price = serializers.DecimalField(source="menu_item.price", max_digits=8, decimal_places=2, read_only=True)
    item_discount_price = serializers.DecimalField(source="menu_item.discount_price", max_digits=8, decimal_places=2, read_only=True, allow_null=True)
    item_image = SmartImageField(source="menu_item.image", read_only=True)
    item_food_type = serializers.CharField(source="menu_item.food_type", read_only=True)
    item_description = serializers.CharField(source="menu_item.description", read_only=True)
    item_is_available = serializers.BooleanField(source="menu_item.is_available", read_only=True)
    restaurant_id = serializers.UUIDField(source="menu_item.restaurant.id", read_only=True)
    restaurant_name = serializers.CharField(source="menu_item.restaurant.name", read_only=True)
    restaurant_slug = serializers.CharField(source="menu_item.restaurant.slug", read_only=True)

    class Meta:
        model = FoodWishlist
        fields = [
            "id",
            "menu_item",
            "item_name",
            "item_price",
            "item_discount_price",
            "item_image",
            "item_food_type",
            "item_description",
            "item_is_available",
            "restaurant_id",
            "restaurant_name",
            "restaurant_slug",
            "added_at",
        ]
        read_only_fields = ["id", "added_at"]


class CartSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField(), default=list)
    restaurant = serializers.DictField(required=False, allow_null=True)
