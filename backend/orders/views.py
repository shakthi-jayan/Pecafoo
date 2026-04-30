"""
Orders — API Views
====================
Order creation (customer), status management (restaurant/delivery),
and order history for all roles.
"""

import logging
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsCustomer, IsDeliveryPartner, IsRestaurantOwner
from delivery.models import DeliveryEarning, DeliveryPartnerProfile
from delivery.pricing_service import DeliveryPricingService
from orders.models import Order, OrderItem
from orders.serializers import (
    OrderCreateSerializer,
    OrderRatingSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
)
from restaurants.models import MenuItem, Restaurant

logger = logging.getLogger(__name__)


TAX_RATE = Decimal("0.05")  


def _optimized_order_qs(base_qs=None):
    """
    Returns an optimized Order queryset with all related data pre-fetched.
    Eliminates N+1 queries by using select_related for ForeignKey joins
    and prefetch_related for reverse FK relationships.

    Before: 1 + N*4 queries (customer, restaurant, delivery_partner, items per order)
    After:  3 queries total (orders + items + delivery_profiles)
    """
    if base_qs is None:
        base_qs = Order.objects.all()
    return base_qs.select_related(
        "customer",               
        "restaurant",             
        "restaurant__owner",      
        "delivery_partner",       
    ).prefetch_related(
        "items",                  
        "items__menu_item",       
    )


class OrderCreateView(APIView):
    """
    POST /api/orders/create/
    Create a new order. Only accessible by customers.
    """

    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        
        try:
            restaurant = Restaurant.objects.get(
                id=data["restaurant_id"],
                approval_status=Restaurant.ApprovalStatus.APPROVED,
                is_active=True,
                is_open=True,
            )
        except Restaurant.DoesNotExist:
            return Response(
                {"error": "Restaurant not found or not currently accepting orders."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        order_items_data = []
        subtotal = Decimal("0.00")

        for item_data in data["items"]:
            try:
                menu_item = MenuItem.objects.get(
                    id=item_data["menu_item_id"],
                    restaurant=restaurant,
                    is_available=True,
                )
            except MenuItem.DoesNotExist:
                return Response(
                    {"error": f"Menu item {item_data['menu_item_id']} not found or unavailable."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            item_price = menu_item.effective_price
            quantity = item_data["quantity"]
            total_price = item_price * quantity
            subtotal += total_price

            order_items_data.append({
                "menu_item": menu_item,
                "item_name": menu_item.name,
                "item_price": item_price,
                "quantity": quantity,
                "total_price": total_price,
                "special_note": item_data.get("special_note", ""),
            })

        
        if subtotal < restaurant.minimum_order_amount:
            return Response(
                {
                    "error": f"Minimum order amount is ₹{restaurant.minimum_order_amount}. "
                    f"Your subtotal is ₹{subtotal}."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        delivery_latitude = data.get("delivery_latitude")
        delivery_longitude = data.get("delivery_longitude")
        if delivery_latitude is None or delivery_longitude is None:
            return Response(
                {"error": "Delivery latitude and longitude are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            distance_km = 0.0
            if restaurant.latitude is not None and restaurant.longitude is not None:
                distance_km = DeliveryPricingService.get_route_distance_km(
                    float(restaurant.latitude),
                    float(restaurant.longitude),
                    float(delivery_latitude),
                    float(delivery_longitude),
                )

            customer_breakdown = DeliveryPricingService.calculate_delivery_fee(distance_km, subtotal)
            partner_breakdown = DeliveryPricingService.calculate_partner_payout(
                customer_breakdown["distance_km"],
                customer_breakdown.get("surge_config"),
            )
        except Exception as exc:
            logger.exception("Failed to calculate delivery pricing for order creation.")
            customer_breakdown = {
                "distance_km": 0,
                "base_fee": restaurant.delivery_fee,
                "distance_fee": Decimal("0.00"),
                "surge_fee": Decimal("0.00"),
                "small_cart_fee": Decimal("0.00"),
                "total_customer_fee": restaurant.delivery_fee,
                "surge_active": False,
                "surge_label": None,
                "surge_config": None,
            }
            partner_breakdown = {
                "partner_base_pay": Decimal("0.00"),
                "partner_distance_incentive": Decimal("0.00"),
                "partner_peak_bonus": Decimal("0.00"),
                "partner_rain_bonus": Decimal("0.00"),
                "partner_long_distance_bonus": Decimal("0.00"),
                "total_partner_payout": Decimal("0.00"),
            }

        
        delivery_fee = customer_breakdown["total_customer_fee"]
        tax = subtotal * TAX_RATE
        total = subtotal + delivery_fee + tax

        with transaction.atomic():
            
            order = Order.objects.create(
                customer=request.user,
                restaurant=restaurant,
                delivery_address=data["delivery_address"],
                delivery_latitude=delivery_latitude,
                delivery_longitude=delivery_longitude,
                special_instructions=data.get("special_instructions", ""),
                payment_method=data.get("payment_method", Order.PaymentMethod.COD),
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                tax=tax,
                total=total,
            )

            
            for item in order_items_data:
                OrderItem.objects.create(order=order, **item)

            DeliveryPricingService.save_breakdown(
                order,
                customer_breakdown=customer_breakdown,
                partner_breakdown=partner_breakdown,
            )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class CustomerOrderListView(generics.ListAPIView):
    """
    GET /api/orders/my/
    List all orders for the current customer.
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return _optimized_order_qs(
            Order.objects.filter(customer=self.request.user)
        )


class RestaurantOrderListView(generics.ListAPIView):
    """
    GET /api/orders/restaurant/
    List all orders for the restaurant owner's restaurants.
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        return _optimized_order_qs(
            Order.objects.filter(restaurant__owner=self.request.user)
        )


class DeliveryOrderListView(generics.ListAPIView):
    """
    GET /api/orders/delivery/
    List orders assigned to the current delivery partner.
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def get_queryset(self):
        return _optimized_order_qs(
            Order.objects.filter(delivery_partner=self.request.user)
        )


class AdminOrderListView(generics.ListAPIView):
    """
    GET /api/orders/admin/
    List all orders for admin oversight.
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return _optimized_order_qs(Order.objects.all()).order_by("-placed_at")


class AvailableOrdersForDeliveryView(generics.ListAPIView):
    """
    GET /api/orders/available-for-delivery/
    Returns ready or confirmed orders that are not yet assigned.
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsDeliveryPartner]

    def get_queryset(self):
        return _optimized_order_qs(
            Order.objects.filter(
                status__in=[Order.Status.READY, Order.Status.CONFIRMED],
                delivery_partner__isnull=True,
            )
        ).order_by("-placed_at")


class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/orders/<uuid:pk>/
    Retrieve a specific order. Accessible by customer, restaurant owner, or delivery partner.
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "customer":
            base = Order.objects.filter(customer=user)
        elif user.role == "restaurant":
            base = Order.objects.filter(restaurant__owner=user)
        elif user.role == "delivery":
            base = Order.objects.filter(delivery_partner=user)
        elif user.role == "admin":
            base = Order.objects.all()
        else:
            return Order.objects.none()
        return _optimized_order_qs(base)


class OrderStatusUpdateView(APIView):
    """
    PATCH /api/orders/<uuid:pk>/status/
    Update order status. Accessible by restaurant owner and delivery partner.
    """

    permission_classes = [IsAuthenticated]

    @staticmethod
    def _sync_delivery_earning(order):
        if order.status != Order.Status.DELIVERED or not order.delivery_partner:
            return

        breakdown = getattr(order, "delivery_fee_breakdown", None)
        if not breakdown:
            return

        DeliveryEarning.objects.update_or_create(
            order=order,
            defaults={
                "delivery_partner": order.delivery_partner,
                "amount": breakdown.total_partner_payout,
                "tip": Decimal("0.00"),
            },
        )

        profile, _ = DeliveryPartnerProfile.objects.get_or_create(user=order.delivery_partner)
        delivered_orders = Order.objects.filter(
            delivery_partner=order.delivery_partner,
            status=Order.Status.DELIVERED,
        )
        profile.total_deliveries = delivered_orders.count()
        profile.total_earnings = sum(
            (
                delivered_order.delivery_fee_breakdown.total_partner_payout
                for delivered_order in delivered_orders.select_related("delivery_fee_breakdown")
                if hasattr(delivered_order, "delivery_fee_breakdown")
            ),
            Decimal("0.00"),
        )
        profile.save(update_fields=["total_deliveries", "total_earnings"])

    def patch(self, request, pk):
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]
        delivery_otp = serializer.validated_data.get("delivery_otp", "").strip()

        
        try:
            if request.user.role == "restaurant":
                order = Order.objects.get(pk=pk, restaurant__owner=request.user)
            elif request.user.role == "delivery":
                order = Order.objects.get(pk=pk, delivery_partner=request.user)
            elif request.user.role == "admin":
                order = Order.objects.get(pk=pk)
            else:
                return Response(
                    {"error": "You don't have permission to update this order."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        
        now = timezone.now()

        if (
            request.user.role == "delivery"
            and new_status == Order.Status.DELIVERED
        ):
            if order.status not in [Order.Status.PICKED_UP, Order.Status.ON_THE_WAY]:
                return Response(
                    {"error": "Order must be picked up before it can be delivered."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not delivery_otp:
                return Response(
                    {"error": "Customer delivery OTP is required before marking this order as delivered."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if delivery_otp != order.delivery_otp:
                return Response(
                    {"error": "Invalid delivery OTP. Please confirm the code shown in the customer's app."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        order.status = new_status

        status_timestamp_map = {
            "confirmed": "confirmed_at",
            "preparing": "confirmed_at",
            "ready": "prepared_at",
            "picked_up": "picked_up_at",
            "delivered": "delivered_at",
            "cancelled": "cancelled_at",
        }

        timestamp_field = status_timestamp_map.get(new_status)
        if timestamp_field:
            setattr(order, timestamp_field, now)

        with transaction.atomic():
            if new_status == Order.Status.DELIVERED:
                order.delivery_otp_verified_at = now
            order.save()
            if new_status == Order.Status.DELIVERED:
                self._sync_delivery_earning(order)

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class OrderRatingView(APIView):
    """
    POST /api/orders/<uuid:pk>/rate/
    Rate a delivered order. Only accessible by the customer.
    """

    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request, pk):
        serializer = OrderRatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(pk=pk, customer=request.user)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status != Order.Status.DELIVERED:
            return Response(
                {"error": "You can only rate delivered orders."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.rating = serializer.validated_data["rating"]
        order.review = serializer.validated_data.get("review", "")
        order.save(update_fields=["rating", "review"])

        
        restaurant = order.restaurant
        all_ratings = Order.objects.filter(
            restaurant=restaurant,
            rating__isnull=False,
        ).values_list("rating", flat=True)

        if all_ratings:
            restaurant.average_rating = sum(all_ratings) / len(all_ratings)
            restaurant.total_ratings = len(all_ratings)
            restaurant.save(update_fields=["average_rating", "total_ratings"])

        return Response(
            {"message": "Rating submitted successfully."},
            status=status.HTTP_200_OK,
        )


class OrderCancellationView(APIView):
    """
    POST /api/orders/<uuid:pk>/cancel/
    Cancel an order.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            if request.user.role == "customer":
                order = Order.objects.get(pk=pk, customer=request.user)
            elif request.user.role in ["restaurant", "admin"]:
                order = Order.objects.get(pk=pk)
            else:
                return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status in [Order.Status.DELIVERED, Order.Status.CANCELLED]:
            return Response(
                {"error": f"Order cannot be cancelled. Current status: {order.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.role == "customer" and order.status not in [Order.Status.PLACED, Order.Status.CONFIRMED]:
            return Response(
                {"error": "Order is already being prepared and cannot be cancelled by customer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = Order.Status.CANCELLED
        order.cancelled_at = timezone.now()
        order.save(update_fields=["status", "cancelled_at"])

        return Response({"message": "Order cancelled successfully."}, status=status.HTTP_200_OK)





import razorpay
import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

class PaymentInitiateView(APIView):
    """
    POST /api/orders/<uuid:pk>/pay/
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, customer=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_status == Order.PaymentStatus.PAID:
            return Response({"error": "Order is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        method = request.data.get('method', 'razorpay')
        
        if method == 'razorpay':
            if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
                return Response({"error": "Razorpay not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            amount_in_paise = int(order.total * 100)
            
            payment_data = {
                'amount': amount_in_paise,
                'currency': 'INR',
                'receipt': str(order.order_number),
                'notes': {
                    'order_id': str(order.id),
                    'customer_id': str(request.user.id)
                }
            }
            
            try:
                razorpay_order = client.order.create(data=payment_data)
                order.payment_id = razorpay_order['id']
                order.payment_method = Order.PaymentMethod.RAZORPAY
                order.save(update_fields=['payment_id', 'payment_method'])
                
                return Response({
                    "razorpay_order_id": razorpay_order['id'],
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "key_id": settings.RAZORPAY_KEY_ID
                })
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        elif method == 'stripe':
            if not settings.STRIPE_SECRET_KEY:
                return Response({"error": "Stripe not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            stripe.api_key = settings.STRIPE_SECRET_KEY
            amount_in_paise = int(order.total * 100)
            
            try:
                intent = stripe.PaymentIntent.create(
                    amount=amount_in_paise,
                    currency='inr',
                    metadata={'order_id': str(order.id)}
                )
                order.payment_id = intent['id']
                order.payment_method = Order.PaymentMethod.STRIPE
                order.save(update_fields=['payment_id', 'payment_method'])
                
                return Response({
                    "client_secret": intent['client_secret'],
                    "stripe_public_key": settings.STRIPE_PUBLIC_KEY
                })
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"error": "Invalid payment method."}, status=status.HTTP_400_BAD_REQUEST)

class RazorpayVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)
            
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            order = Order.objects.get(payment_id=razorpay_order_id)
            order.payment_status = Order.PaymentStatus.PAID
            order.save(update_fields=['payment_status'])
            return Response({"message": "Payment verified successfully"}, status=status.HTTP_200_OK)
        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)
        except Order.DoesNotExist:
            return Response({"error": "Associated order not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    stripe.api_key = settings.STRIPE_SECRET_KEY
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        order_id = payment_intent.get('metadata', {}).get('order_id')
        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                order.payment_status = Order.PaymentStatus.PAID
                order.save(update_fields=['payment_status'])
            except Order.DoesNotExist:
                pass
                
    return Response(status=status.HTTP_200_OK)
