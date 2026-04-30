"""
Restaurants URL Configuration
"""

from django.urls import path
from restaurants.views import (
    AdminRestaurantApproveView,
    AdminRestaurantRejectView,
    AdminRestaurantVerificationDetailView,
    AdminRestaurantVerificationListView,
    MenuCategoryDetailView,
    MenuCategoryListCreateView,
    MenuItemDetailView,
    MenuItemListCreateView,
    MyRestaurantDetailView,
    MyRestaurantListCreateView,
    PlatformCategoriesView,
    PlatformCuisinesView,
    PublicFoodItemListView,
    PublicRestaurantDetailView,
    PublicRestaurantListView,
    PublicRestaurantReviewsView,
)

app_name = "restaurants"

urlpatterns = [
    path("admin/", AdminRestaurantVerificationListView.as_view(), name="admin-restaurant-list"),
    path("admin/<uuid:pk>/", AdminRestaurantVerificationDetailView.as_view(), name="admin-restaurant-detail"),
    path("admin/<uuid:pk>/approve/", AdminRestaurantApproveView.as_view(), name="admin-restaurant-approve"),
    path("admin/<uuid:pk>/reject/", AdminRestaurantRejectView.as_view(), name="admin-restaurant-reject"),
    path("my/", MyRestaurantListCreateView.as_view(), name="my-restaurants"),
    path("my/<uuid:pk>/", MyRestaurantDetailView.as_view(), name="my-restaurant-detail"),
    path("my/<uuid:restaurant_id>/categories/", MenuCategoryListCreateView.as_view(), name="category-list"),
    path("my/<uuid:restaurant_id>/categories/<uuid:pk>/", MenuCategoryDetailView.as_view(), name="category-detail"),
    path("my/<uuid:restaurant_id>/items/", MenuItemListCreateView.as_view(), name="item-list"),
    path("my/<uuid:restaurant_id>/items/<uuid:pk>/", MenuItemDetailView.as_view(), name="item-detail"),
    path("categories/platform/", PlatformCategoriesView.as_view(), name="platform-categories"),
    path("cuisines/", PlatformCuisinesView.as_view(), name="platform-cuisines"),
    path("food-items/", PublicFoodItemListView.as_view(), name="food-item-list"),
    path("", PublicRestaurantListView.as_view(), name="restaurant-list"),
    path("<slug:slug>/reviews/", PublicRestaurantReviewsView.as_view(), name="restaurant-reviews"),
    path("<slug:slug>/", PublicRestaurantDetailView.as_view(), name="restaurant-detail"),
]
