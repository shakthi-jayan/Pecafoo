"""
Promotions — API Views
========================
CRUD for admin, public listing for customers, and coupon validation.
"""

import logging
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from promotions.models import Promotion, PromotionUsage
from promotions.serializers import (
    PromotionApplySerializer,
    PromotionSerializer,
)

logger = logging.getLogger(__name__)


class PromotionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/promotions/           — List active promotions (public)
    POST /api/promotions/           — Create promotion (admin)
    """
    serializer_class = PromotionSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        if self.request.user.is_authenticated and getattr(self.request.user, "role", None) == "admin":
            return Promotion.objects.all()
        return Promotion.objects.filter(
            is_active=True,
            start_date__lte=timezone.now(),
            expiry_date__gte=timezone.now(),
        )


class PromotionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/promotions/<uuid:pk>/
    Admin management of individual promotions.
    """
    serializer_class = PromotionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Promotion.objects.all()


class PromotionApplyView(APIView):
    """
    POST /api/promotions/apply/
    Validate and apply a coupon code. Returns discount amount.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PromotionApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"].strip().upper()
        subtotal = serializer.validated_data["subtotal"]
        restaurant_id = serializer.validated_data.get("restaurant_id")

        try:
            promo = Promotion.objects.get(code=code)
        except Promotion.DoesNotExist:
            return Response(
                {"error": "Invalid coupon code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not promo.is_valid:
            return Response(
                {"error": "This coupon has expired or is no longer available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if subtotal < promo.min_order_amount:
            return Response(
                {"error": f"Minimum order amount for this coupon is ₹{promo.min_order_amount}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if promo.scope == Promotion.Scope.RESTAURANT and restaurant_id:
            if str(promo.restaurant_id) != str(restaurant_id):
                return Response(
                    {"error": "This coupon is not valid for the selected restaurant."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        
        user_usage_count = PromotionUsage.objects.filter(
            promotion=promo, user=request.user
        ).count()
        if user_usage_count >= promo.per_user_limit:
            return Response(
                {"error": "You have already used this coupon the maximum number of times."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        discount = promo.calculate_discount(subtotal)

        return Response({
            "code": promo.code,
            "title": promo.title,
            "discount_type": promo.discount_type,
            "discount_value": float(promo.discount_value),
            "discount_amount": float(discount),
            "new_subtotal": float(subtotal - discount),
        })
