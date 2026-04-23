"""
Customers URL Configuration
"""

from django.urls import path
from customers.views import (
    AddressDetailView,
    AddressListCreateView,
    CartView,
    CustomerProfileView,
    FoodWishlistListView,
    FoodWishlistToggleView,
    WishlistListView,
    WishlistToggleView,
)

app_name = "customers"

urlpatterns = [
    path("profile/", CustomerProfileView.as_view(), name="profile"),
    path("addresses/", AddressListCreateView.as_view(), name="address-list"),
    path("addresses/<uuid:pk>/", AddressDetailView.as_view(), name="address-detail"),
    path("wishlist/", WishlistListView.as_view(), name="wishlist-list"),
    path("wishlist/toggle/", WishlistToggleView.as_view(), name="wishlist-toggle"),
    path("food-wishlist/", FoodWishlistListView.as_view(), name="food-wishlist-list"),
    path("food-wishlist/toggle/", FoodWishlistToggleView.as_view(), name="food-wishlist-toggle"),
    path("cart/", CartView.as_view(), name="cart"),
]
