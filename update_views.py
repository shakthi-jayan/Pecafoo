import os

views_path = r'c:\Users\Machodev\OneDrive\Document\Pecafoo\backend\orders\views.py'
urls_path = r'c:\Users\Machodev\OneDrive\Document\Pecafoo\backend\orders\urls.py'


cancel_view = """
class OrderCancellationView(APIView):
    \"\"\"
    POST /api/orders/<uuid:pk>/cancel/
    Cancel an order.
    \"\"\"
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
"""

payments_code = """
# ═══════════════════════════════════════════════
# PAYMENTS (Razorpay & Stripe)
# ═══════════════════════════════════════════════
import razorpay
import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

class PaymentInitiateView(APIView):
    \"\"\"
    POST /api/orders/<uuid:pk>/pay/
    \"\"\"
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
"""

with open(views_path, 'r', encoding='utf-8') as f:
    v_content = f.read()

if 'PaymentInitiateView' not in v_content:
    with open(views_path, 'a', encoding='utf-8') as f:
        f.write("\n" + cancel_view + "\n" + payments_code)

with open(urls_path, 'r', encoding='utf-8') as f:
    u_content = f.read()

if 'PaymentInitiateView' not in u_content:
    u_content = u_content.replace(
        'OrderRatingView,',
        'OrderRatingView,\n    OrderCancellationView,\n    PaymentInitiateView,\n    RazorpayVerifyView,\n    stripe_webhook,'
    )
    u_content = u_content.replace(
        'path("<uuid:pk>/rate/", OrderRatingView.as_view(), name="order-rate"),',
        'path("<uuid:pk>/rate/", OrderRatingView.as_view(), name="order-rate"),\n    path("<uuid:pk>/cancel/", OrderCancellationView.as_view(), name="order-cancel"),\n    path("<uuid:pk>/pay/", PaymentInitiateView.as_view(), name="order-pay"),\n    path("razorpay/verify/", RazorpayVerifyView.as_view(), name="razorpay-verify"),\n    path("stripe/webhook/", stripe_webhook, name="stripe-webhook"),'
    )
    with open(urls_path, 'w', encoding='utf-8') as f:
        f.write(u_content)

print("Backend update complete.")


api_path = r'c:\Users\Machodev\OneDrive\Document\Pecafoo\frontend\customer-app\src\services\api.js'
with open(api_path, 'r', encoding='utf-8') as f:
    a_content = f.read()
if 'cancelOrder: (id)' not in a_content:
    a_content = a_content.replace(
        'rateOrder: (id, data) => api.post(`/orders/${id}/rate/`, data),',
        'rateOrder: (id, data) => api.post(`/orders/${id}/rate/`, data),\n    cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),\n    initiatePayment: (id, method) => api.post(`/orders/${id}/pay/`, { method }),\n    verifyRazorpay: (data) => api.post(`/orders/razorpay/verify/`, data),'
    )
    with open(api_path, 'w', encoding='utf-8') as f:
        f.write(a_content)

print("Frontend update complete.")
