"""
Restaurants — API Views
=========================
Public browsing for customers + management CRUD for restaurant owners.
"""

import logging
from django.core.cache import cache
from django.db.models import Prefetch, Count
from django.utils.decorators import method_decorator
from orders.models import Order
from django.utils.text import slugify
from rest_framework import generics, status, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

logger = logging.getLogger(__name__)

from accounts.permissions import IsRestaurantOwner, IsAdmin
from restaurants.models import MenuCategory, MenuItem, Restaurant
from restaurants.serializers import (
    MenuCategorySerializer,
    MenuItemSerializer,
    RestaurantCreateUpdateSerializer,
    RestaurantDetailSerializer,
    RestaurantListSerializer,
    RestaurantReviewSerializer,
    RestaurantVerificationSerializer,
)






class PublicRestaurantListView(generics.ListAPIView):
    """
    GET /api/restaurants/
    Public listing of approved & active restaurants.
    Supports search, filtering, and ordering.
    Cached for 2 minutes.
    """

    serializer_class = RestaurantListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "name",
        "cuisine_type",
        "city",
        "categories__name",
        "categories__items__name",
        "categories__items__description",
    ]
    filterset_fields = ["city", "is_open", "is_featured"]
    ordering_fields = ["average_rating", "average_delivery_time", "minimum_order_amount"]

    def get_queryset(self):
        return Restaurant.objects.filter(
            approval_status=Restaurant.ApprovalStatus.APPROVED,
            is_active=True,
        ).select_related("owner")

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        return queryset.distinct()




class PublicRestaurantDetailView(generics.RetrieveAPIView):
    """
    GET /api/restaurants/<slug>/
    Public detail view of a single restaurant with full menu.
    """

    serializer_class = RestaurantDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Restaurant.objects.filter(
            approval_status=Restaurant.ApprovalStatus.APPROVED,
            is_active=True,
        ).select_related("owner").prefetch_related(
            Prefetch(
                "categories",
                queryset=MenuCategory.objects.filter(is_active=True)
                    .prefetch_related(
                        Prefetch("items", queryset=MenuItem.objects.filter(is_available=True))
                    )
                    .order_by("sort_order", "name"),
            )
        )


class PublicRestaurantReviewsView(generics.GenericAPIView):
    """
    GET /api/restaurants/<slug>/reviews/
    Public rating summary and review feed for a restaurant.
    """

    permission_classes = [AllowAny]

    def get(self, request, slug):
        restaurant = generics.get_object_or_404(
            Restaurant.objects.filter(
                approval_status=Restaurant.ApprovalStatus.APPROVED,
                is_active=True,
            ),
            slug=slug,
        )
        reviews = Order.objects.filter(
            restaurant=restaurant,
            rating__isnull=False,
        ).select_related("customer").order_by("-delivered_at", "-placed_at")

        distribution = {str(rating): 0 for rating in range(1, 6)}
        for review in reviews:
            distribution[str(review.rating)] += 1

        return Response({
            "restaurant": restaurant.name,
            "average_rating": restaurant.average_rating,
            "total_reviews": reviews.count(),
            "distribution": distribution,
            "reviews": RestaurantReviewSerializer(reviews, many=True).data,
        })


class PublicFoodItemListView(generics.ListAPIView):
    """
    GET /api/restaurants/food-items/
    Public listing of available menu items across approved restaurants.
    Supports dish-name search for customer search screens.
    """

    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "category__name", "restaurant__name", "restaurant__cuisine_type"]
    filterset_fields = ["food_type", "category", "restaurant"]
    ordering_fields = ["price", "discount_price", "created_at"]

    def get_queryset(self):
        return MenuItem.objects.filter(
            is_available=True,
            restaurant__approval_status=Restaurant.ApprovalStatus.APPROVED,
            restaurant__is_active=True,
        ).select_related("restaurant", "category")






class MyRestaurantListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/restaurants/my/
    POST /api/restaurants/my/
    List or create restaurants owned by the current user.
    """

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return RestaurantCreateUpdateSerializer
        return RestaurantListSerializer

    def get_queryset(self):
        return Restaurant.objects.filter(owner=self.request.user)

    from django.db import transaction
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        if Restaurant.objects.filter(owner=request.user).exists():
            return Response({"code": "PROFILE_ALREADY_EXISTS"}, status=status.HTTP_409_CONFLICT)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        name = serializer.validated_data.get("name", "")
        base_slug = slugify(name)
        slug = base_slug
        import uuid
        while Restaurant.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        serializer.save(owner=self.request.user, slug=slug)


class MyRestaurantDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/restaurants/my/<uuid:pk>/
    PATCH  /api/restaurants/my/<uuid:pk>/
    DELETE /api/restaurants/my/<uuid:pk>/
    Manage a specific restaurant owned by the current user.
    """

    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return RestaurantDetailSerializer
        return RestaurantCreateUpdateSerializer

    def get_queryset(self):
        return Restaurant.objects.filter(owner=self.request.user)


class AdminRestaurantVerificationListView(generics.ListAPIView):
    """List all restaurants and uploaded verification documents for admin review."""

    serializer_class = RestaurantVerificationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return Restaurant.objects.select_related("owner").order_by("-created_at")


class AdminRestaurantVerificationDetailView(generics.RetrieveUpdateAPIView):
    """Review and update restaurant verification status."""

    serializer_class = RestaurantVerificationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Restaurant.objects.select_related("owner").all()






class MenuCategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/restaurants/my/<uuid:restaurant_id>/categories/
    POST /api/restaurants/my/<uuid:restaurant_id>/categories/
    """

    serializer_class = MenuCategorySerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        return MenuCategory.objects.filter(
            restaurant__id=self.kwargs["restaurant_id"],
            restaurant__owner=self.request.user,
        )

    def perform_create(self, serializer):
        restaurant = Restaurant.objects.get(
            id=self.kwargs["restaurant_id"],
            owner=self.request.user,
        )
        serializer.save(restaurant=restaurant)


class MenuCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/restaurants/my/<uuid:restaurant_id>/categories/<uuid:pk>/
    """

    serializer_class = MenuCategorySerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        return MenuCategory.objects.filter(
            restaurant__id=self.kwargs["restaurant_id"],
            restaurant__owner=self.request.user,
        )






class MenuItemListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/restaurants/my/<uuid:restaurant_id>/items/
    POST /api/restaurants/my/<uuid:restaurant_id>/items/
    """

    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["name", "description"]
    filterset_fields = ["category", "food_type", "is_available", "is_bestseller"]

    def get_queryset(self):
        return MenuItem.objects.filter(
            restaurant__id=self.kwargs["restaurant_id"],
            restaurant__owner=self.request.user,
        )

    def perform_create(self, serializer):
        restaurant = Restaurant.objects.get(
            id=self.kwargs["restaurant_id"],
            owner=self.request.user,
        )
        serializer.save(restaurant=restaurant)


class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/restaurants/my/<uuid:restaurant_id>/items/<uuid:pk>/
    """

    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        return MenuItem.objects.filter(
            restaurant__id=self.kwargs["restaurant_id"],
            restaurant__owner=self.request.user,
        )






class PlatformCategoriesView(APIView):
    """
    GET /api/restaurants/categories/platform/
    Returns deduplicated platform-wide cuisine categories
    aggregated from all active restaurants' MenuCategory names.
    Cached for 5 minutes.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        cache_key = "platform_categories"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        categories = (
            MenuCategory.objects.filter(
                is_active=True,
                restaurant__is_active=True,
                restaurant__approval_status=Restaurant.ApprovalStatus.APPROVED,
            )
            .values("name")
            .annotate(
                restaurant_count=Count("restaurant", distinct=True),
                item_count=Count("items", distinct=True),
            )
            .order_by("-restaurant_count")
        )

        result = [
            {
                "name": cat["name"],
                "restaurant_count": cat["restaurant_count"],
                "item_count": cat["item_count"],
            }
            for cat in categories
        ]

        cache.set(cache_key, result, 60 * 5)
        return Response(result)


class PlatformCuisinesView(APIView):
    """
    GET /api/restaurants/cuisines/
    Returns deduplicated cuisine types across all active restaurants.
    Cached for 10 minutes.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        cache_key = "platform_cuisines"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        cuisines_raw = (
            Restaurant.objects.filter(
                is_active=True,
                approval_status=Restaurant.ApprovalStatus.APPROVED,
            )
            .exclude(cuisine_type="")
            .values_list("cuisine_type", flat=True)
        )

        cuisines_set = set()
        for entry in cuisines_raw:
            for cuisine in entry.split(","):
                cuisine = cuisine.strip()
                if cuisine:
                    cuisines_set.add(cuisine)

        result = sorted(cuisines_set)
        cache.set(cache_key, result, 60 * 10)
        return Response(result)
