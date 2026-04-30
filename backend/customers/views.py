"""
Customers API Views
Customer profile, address CRUD, wishlist, food wishlist, and cart operations.
"""

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCustomer
from customers.models import Address, Cart, CustomerProfile, FoodWishlist, Wishlist
from customers.serializers import (
    AddressSerializer,
    CartSerializer,
    CustomerProfileSerializer,
    FoodWishlistSerializer,
    WishlistSerializer,
)
from restaurants.models import MenuItem, Restaurant


class CustomerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_object(self):
        profile, _ = CustomerProfile.objects.get_or_create(user=self.request.user)
        return profile


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class WishlistToggleView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        restaurant_id = request.data.get("restaurant_id")
        if not restaurant_id:
            return Response({"error": "restaurant_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, restaurant=restaurant)

        if not created:
            wishlist_item.delete()
            return Response({"status": "removed", "message": "Removed from wishlist"})

        return Response({"status": "added", "message": "Added to wishlist"})


class WishlistListView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related("restaurant")


class FoodWishlistToggleView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        menu_item_id = request.data.get("menu_item_id")
        if not menu_item_id:
            return Response({"error": "menu_item_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        menu_item = get_object_or_404(MenuItem, id=menu_item_id)
        item, created = FoodWishlist.objects.get_or_create(user=request.user, menu_item=menu_item)

        if not created:
            item.delete()
            return Response({"status": "removed", "message": "Removed from food wishlist"})

        return Response({"status": "added", "message": "Added to food wishlist"})


class FoodWishlistListView(generics.ListAPIView):
    serializer_class = FoodWishlistSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return FoodWishlist.objects.filter(user=self.request.user).select_related("menu_item", "menu_item__restaurant")


class CartView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def get(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            return Response({
                "items": cart.items or [],
                "restaurant": cart.restaurant,
                "updated_at": cart.updated_at,
            })
        except Cart.DoesNotExist:
            return Response({"items": [], "restaurant": None})

    def post(self, request):
        serializer = CartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items = serializer.validated_data.get("items", [])
        cart.restaurant = serializer.validated_data.get("restaurant")
        cart.save()

        return Response({
            "items": cart.items,
            "restaurant": cart.restaurant,
            "updated_at": cart.updated_at,
        })

    def delete(self, request):
        Cart.objects.filter(user=request.user).delete()
        return Response({"message": "Cart cleared"})
