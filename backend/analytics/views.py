"""
Analytics — API Views
========================
Admin dashboard, demand forecasting, surge pricing, fraud detection,
and delivery zone suggestion endpoints.
"""

import logging
from django.core.cache import cache
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from analytics.algorithms import (
    forecast_demand,
    calculate_surge_pricing,
    get_fraud_score,
    get_suggested_zone,
)
from accounts.permissions import IsAdmin, IsDeliveryPartner, IsRestaurantOwner

logger = logging.getLogger(__name__)


class DashboardAnalyticsView(APIView):
    """
    GET /api/analytics/dashboard/
    Admin Dashboard Stats — today's orders, revenue, active restaurants/users.
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        
        cache_key = "admin_dashboard_stats"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        from orders.models import Order
        from accounts.models import User
        from restaurants.models import Restaurant

        today = timezone.now().date()
        today_orders = Order.objects.filter(placed_at__date=today)

        
        revenue = (
            today_orders.exclude(status="cancelled")
            .aggregate(total_revenue=Sum("total"))
            .get("total_revenue")
            or 0
        )

        
        yesterday = today - timezone.timedelta(days=1)
        yesterday_orders = Order.objects.filter(placed_at__date=yesterday)
        yesterday_revenue = (
            yesterday_orders.exclude(status="cancelled")
            .aggregate(total_revenue=Sum("total"))
            .get("total_revenue")
            or 0
        )

        data = {
            "today": {
                "total_orders": today_orders.count(),
                "revenue": float(revenue),
                "delivered": today_orders.filter(status="delivered").count(),
                "cancelled": today_orders.filter(status="cancelled").count(),
                "pending": today_orders.filter(
                    status__in=["placed", "confirmed", "preparing"]
                ).count(),
            },
            "yesterday": {
                "total_orders": yesterday_orders.count(),
                "revenue": float(yesterday_revenue),
            },
            "totals": {
                "active_restaurants": Restaurant.objects.filter(
                    is_active=True,
                    approval_status=Restaurant.ApprovalStatus.APPROVED,
                ).count(),
                "pending_restaurants": Restaurant.objects.filter(
                    approval_status=Restaurant.ApprovalStatus.PENDING,
                ).count(),
                "total_customers": User.objects.filter(role="customer").count(),
                "total_delivery_partners": User.objects.filter(role="delivery").count(),
                "total_users": User.objects.count(),
            },
        }

        cache.set(cache_key, data, 60 * 5)  
        return Response(data)


class DemandForecastView(APIView):
    """
    GET /api/analytics/demand-forecast/
    Get hourly demand forecast (visible to Restaurant & Admin).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ("admin", "restaurant"):
            return Response(
                {"error": "Only admins and restaurant owners can access this."},
                status=403,
            )
        return Response(forecast_demand())


class SurgePricingView(APIView):
    """
    GET /api/analytics/surge/
    Get current surge multiplier based on supply/demand.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(calculate_surge_pricing())


class FraudScoreView(APIView):
    """
    GET /api/analytics/fraud-score/<uuid:user_id>/
    Get fraud score for a user (Admin only).
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, user_id):
        return Response(get_fraud_score(user_id))


class SuggestedZoneView(APIView):
    """
    GET /api/analytics/driver/suggested-zone/
    Get suggested hotspot zone (Delivery Partners & Admin).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ("admin", "delivery"):
            return Response(
                {"error": "Only admins and delivery partners can access this."},
                status=403,
            )
        return Response(get_suggested_zone())
