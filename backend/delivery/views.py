"""
Delivery API views.
"""

from decimal import Decimal

from django.core.cache import cache
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsCustomer, IsDeliveryPartner
from delivery.models import (
    DeliveryEarning,
    DeliveryLocationLog,
    DeliveryPartnerProfile,
    DeliveryPricingConfig,
    IncentiveSlab,
    PartnerPayoutConfig,
    SurgeConfig,
)
from delivery.serializers import (
    AvailabilitySerializer,
    DeliveryEstimateRequestSerializer,
    DeliveryEarningSerializer,
    DeliveryPricingConfigSerializer,
    DeliveryLocationUpdateSerializer,
    DeliveryPartnerProfileSerializer,
    DeliveryVerificationSerializer,
    IncentiveSlabSerializer,
    PartnerPayoutConfigSerializer,
    SurgeConfigSerializer,
)
from delivery.pricing_service import DeliveryPricingService
from orders.models import Order
from orders.serializers import OrderSerializer
from restaurants.models import Restaurant


class DeliveryProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = DeliveryPartnerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            return DeliveryPartnerProfile.objects.get(user=self.request.user)
        except DeliveryPartnerProfile.DoesNotExist:
            from django.http import Http404
            raise Http404

    def get(self, request, *args, **kwargs):
        from django.http import Http404
        try:
            return super().get(request, *args, **kwargs)
        except Http404:
            return Response({"profile_exists": False, "can_create": True})

    from django.db import transaction
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        if DeliveryPartnerProfile.objects.filter(user=request.user).exists():
            return Response({"code": "PROFILE_ALREADY_EXISTS"}, status=status.HTTP_409_CONFLICT)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ToggleAvailabilityView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def post(self, request):
        serializer = AvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile, _ = DeliveryPartnerProfile.objects.get_or_create(user=request.user)
        profile.is_available = serializer.validated_data["is_available"]
        profile.save(update_fields=["is_available"])
        return Response({"message": f"Availability set to {'online' if profile.is_available else 'offline'}.", "is_available": profile.is_available})


class UpdateLocationView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def post(self, request):
        serializer = DeliveryLocationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        profile, _ = DeliveryPartnerProfile.objects.get_or_create(user=request.user)
        profile.current_latitude = data["latitude"]
        profile.current_longitude = data["longitude"]
        profile.last_location_update = timezone.now()
        profile.save(update_fields=["current_latitude", "current_longitude", "last_location_update"])

        log_data = {
            "delivery_partner": request.user,
            "latitude": data["latitude"],
            "longitude": data["longitude"],
        }
        if data.get("order_id"):
            log_data["order_id"] = data["order_id"]
        DeliveryLocationLog.objects.create(**log_data)
        return Response({"message": "Location updated."})


class EarningsListView(generics.ListAPIView):
    serializer_class = DeliveryEarningSerializer
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def get_queryset(self):
        return DeliveryEarning.objects.filter(delivery_partner=self.request.user)


class AcceptOrderView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in (Order.Status.PLACED, Order.Status.CONFIRMED, Order.Status.PREPARING, Order.Status.READY):
            return Response({"error": "Order cannot be accepted in its current state."}, status=status.HTTP_400_BAD_REQUEST)

        if order.delivery_partner and order.delivery_partner != request.user:
            return Response({"error": "This order is already assigned to another delivery partner."}, status=status.HTTP_409_CONFLICT)

        order.delivery_partner = request.user
        order.status = Order.Status.PICKED_UP
        order.picked_up_at = timezone.now()
        order.save(update_fields=["delivery_partner", "status", "picked_up_at"])
        return Response({"message": "Order accepted successfully.", "order": OrderSerializer(order).data})


class DeclineOrderView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.delivery_partner == request.user:
            order.delivery_partner = None
            order.save(update_fields=["delivery_partner"])

        return Response({"message": "Order declined."})


class ActiveDeliveryOrdersView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def get(self, request):
        active_orders = Order.objects.filter(
            delivery_partner=request.user,
            status__in=[Order.Status.CONFIRMED, Order.Status.PREPARING, Order.Status.READY, Order.Status.PICKED_UP],
        ).prefetch_related("items")
        return Response(OrderSerializer(active_orders, many=True).data)


class EarningsSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def get(self, request):
        earnings = DeliveryEarning.objects.filter(delivery_partner=request.user)
        today = timezone.now().date()
        week_start = today - timezone.timedelta(days=today.weekday())

        total = earnings.aggregate(total=Sum("total"))["total"] or 0
        today_total = earnings.filter(earned_at__date=today).aggregate(total=Sum("total"))["total"] or 0
        week_total = earnings.filter(earned_at__date__gte=week_start).aggregate(total=Sum("total"))["total"] or 0

        return Response({
            "total_earnings": total,
            "today_earnings": today_total,
            "week_earnings": week_total,
            "total_deliveries": earnings.count(),
        })


class DeliveryEstimateView(APIView):
    """
    POST /api/delivery/estimate/
    Calculate delivery fee estimate. Open to any authenticated user
    (customers viewing their cart, unauthenticated users get cached public pricing).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DeliveryEstimateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        restaurant = get_object_or_404(Restaurant, id=data["restaurant_id"], is_active=True)
        distance_km = 0.0
        if restaurant.latitude is not None and restaurant.longitude is not None:
            distance_km = DeliveryPricingService.get_route_distance_km(
                float(restaurant.latitude),
                float(restaurant.longitude),
                data["customer_lat"],
                data["customer_lng"],
            )
        breakdown = DeliveryPricingService.calculate_delivery_fee(distance_km, data["cart_value"])
        return Response({
            "distance_km": breakdown["distance_km"],
            "base_fee": breakdown["base_fee"],
            "distance_fee": breakdown["distance_fee"],
            "surge_fee": breakdown["surge_fee"],
            "small_cart_fee": breakdown["small_cart_fee"],
            "total_delivery_fee": breakdown["total_customer_fee"],
            "surge_active": breakdown["surge_active"],
            "surge_label": breakdown["surge_label"],
        })


class PartnerTodayEarningsView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def get(self, request):
        today = timezone.localdate()
        breakdowns = Order.objects.filter(
            delivery_partner=request.user,
            status=Order.Status.DELIVERED,
            delivered_at__date=today,
            delivery_fee_breakdown__isnull=False,
        ).select_related("delivery_fee_breakdown")

        orders_completed = breakdowns.count()
        base_pay_total = Decimal("0")
        distance_total = Decimal("0")
        bonus_total = Decimal("0")
        total_earned = Decimal("0")

        for order in breakdowns:
            fee = order.delivery_fee_breakdown
            base_pay_total += fee.partner_base_pay
            distance_total += fee.partner_distance_incentive
            bonus_total += fee.partner_peak_bonus + fee.partner_rain_bonus + fee.partner_long_distance_bonus
            total_earned += fee.total_partner_payout

        slab_progress = []
        for slab in IncentiveSlab.objects.filter(is_active=True, period=IncentiveSlab.Period.DAILY).order_by("orders_required"):
            achieved = orders_completed >= slab.orders_required
            slab_progress.append({
                "orders_required": slab.orders_required,
                "bonus_amount": slab.bonus_amount,
                "achieved": achieved,
                "orders_remaining": 0 if achieved else slab.orders_required - orders_completed,
            })

        return Response({
            "orders_completed": orders_completed,
            "total_earned": total_earned,
            "breakdown": {
                "base_pay_total": base_pay_total,
                "distance_incentive_total": distance_total,
                "bonus_total": bonus_total,
            },
            "slab_progress": slab_progress,
        })


class AdminPricingConfigView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        pricing = DeliveryPricingConfig.objects.filter(is_active=True).order_by("-created_at").first()
        payout = PartnerPayoutConfig.objects.filter(is_active=True).order_by("-created_at").first()
        return Response({
            "delivery_pricing": DeliveryPricingConfigSerializer(pricing).data if pricing else None,
            "partner_payout": PartnerPayoutConfigSerializer(payout).data if payout else None,
            "surges": SurgeConfigSerializer(SurgeConfig.objects.all(), many=True).data,
            "incentive_slabs": IncentiveSlabSerializer(IncentiveSlab.objects.all(), many=True).data,
        })

    def put(self, request):
        pricing_instance = DeliveryPricingConfig.objects.filter(is_active=True).order_by("-created_at").first()
        payout_instance = PartnerPayoutConfig.objects.filter(is_active=True).order_by("-created_at").first()

        pricing_payload = request.data.get("delivery_pricing", {})
        payout_payload = request.data.get("partner_payout", {})
        pricing_serializer = DeliveryPricingConfigSerializer(pricing_instance, data=pricing_payload, partial=bool(pricing_instance))
        payout_serializer = PartnerPayoutConfigSerializer(payout_instance, data=payout_payload, partial=bool(payout_instance))
        pricing_serializer.is_valid(raise_exception=True)
        payout_serializer.is_valid(raise_exception=True)

        DeliveryPricingConfig.objects.filter(is_active=True).update(is_active=False)
        PartnerPayoutConfig.objects.filter(is_active=True).update(is_active=False)

        pricing = pricing_serializer.save(is_active=True)
        payout = payout_serializer.save(is_active=True)

        return Response({
            "delivery_pricing": DeliveryPricingConfigSerializer(pricing).data,
            "partner_payout": PartnerPayoutConfigSerializer(payout).data,
        })


class AdminPricingSurgeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = SurgeConfigSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        surge = serializer.save()
        cache.delete(DeliveryPricingService.SURGE_CACHE_KEY)
        return Response(SurgeConfigSerializer(surge).data, status=status.HTTP_201_CREATED)


class AdminPricingSurgeDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SurgeConfigSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = SurgeConfig.objects.all()

    def perform_update(self, serializer):
        serializer.save()
        cache.delete(DeliveryPricingService.SURGE_CACHE_KEY)


class AdminIncentiveSlabListCreateView(generics.ListCreateAPIView):
    serializer_class = IncentiveSlabSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = IncentiveSlab.objects.all().order_by("period", "orders_required")


class AdminIncentiveSlabDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncentiveSlabSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = IncentiveSlab.objects.all()


class AdminDeliveryVerificationListView(generics.ListAPIView):
    serializer_class = DeliveryVerificationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return DeliveryPartnerProfile.objects.select_related("user").order_by("-created_at")


class AdminDeliveryVerificationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DeliveryVerificationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = DeliveryPartnerProfile.objects.select_related("user").all()
