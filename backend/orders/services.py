"""
Orders — Payment Services
============================
Production-grade payment integration with Razorpay and Stripe.
Handles order creation, verification, and webhook processing.
"""

import logging
import hmac
import hashlib

from decimal import Decimal
from django.conf import settings

logger = logging.getLogger(__name__)






def get_razorpay_client():
    """Get initialized Razorpay client."""
    import razorpay

    key_id = settings.RAZORPAY_KEY_ID
    key_secret = settings.RAZORPAY_KEY_SECRET

    if not key_id or not key_secret:
        raise ValueError("Razorpay credentials not configured.")

    return razorpay.Client(auth=(key_id, key_secret))


def create_razorpay_order(order):
    """
    Create a Razorpay order for payment.

    Args:
        order: Order model instance

    Returns:
        dict with razorpay_order_id, amount, currency, key_id
    """
    client = get_razorpay_client()

    
    amount_paise = int(order.total * 100)

    razorpay_order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": str(order.id),
        "notes": {
            "order_number": order.order_number,
            "customer_email": order.customer.email,
            "restaurant": order.restaurant.name,
        },
    })

    logger.info(
        f"Razorpay order created: {razorpay_order['id']} "
        f"for order {order.order_number} (₹{order.total})"
    )

    return {
        "razorpay_order_id": razorpay_order["id"],
        "amount": amount_paise,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
    }


def verify_razorpay_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    """
    Verify Razorpay payment signature.

    Args:
        razorpay_order_id: Razorpay order ID
        razorpay_payment_id: Razorpay payment ID
        razorpay_signature: Razorpay payment signature

    Returns:
        True if payment is verified, False otherwise
    """
    try:
        client = get_razorpay_client()
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        })
        logger.info(f"Razorpay payment verified: {razorpay_payment_id}")
        return True
    except Exception as e:
        logger.error(f"Razorpay payment verification failed: {e}")
        return False






def get_stripe_client():
    """Configure and return stripe module."""
    import stripe

    stripe.api_key = settings.STRIPE_SECRET_KEY

    if not stripe.api_key:
        raise ValueError("Stripe credentials not configured.")

    return stripe


def create_stripe_payment_intent(order):
    """
    Create a Stripe PaymentIntent for the order.

    Args:
        order: Order model instance

    Returns:
        dict with client_secret and payment_intent_id
    """
    stripe = get_stripe_client()

    
    amount_paise = int(order.total * 100)

    intent = stripe.PaymentIntent.create(
        amount=amount_paise,
        currency="inr",
        metadata={
            "order_id": str(order.id),
            "order_number": order.order_number,
            "customer_email": order.customer.email,
        },
        description=f"Pecafoo Order #{order.order_number}",
    )

    logger.info(
        f"Stripe PaymentIntent created: {intent.id} "
        f"for order {order.order_number} (₹{order.total})"
    )

    return {
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id,
    }


def verify_stripe_webhook(payload, sig_header):
    """
    Verify a Stripe webhook signature.

    Args:
        payload: Raw request body
        sig_header: Stripe-Signature header

    Returns:
        Parsed event dict or None
    """
    import stripe

    stripe.api_key = settings.STRIPE_SECRET_KEY
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    if not endpoint_secret:
        logger.error("Stripe webhook secret not configured.")
        return None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
        return event
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Stripe webhook signature verification failed: {e}")
        return None
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return None


def handle_stripe_payment_success(payment_intent_id):
    """
    Handle successful Stripe payment.
    Updates order payment status.
    """
    from orders.models import Order

    try:
        order = Order.objects.get(payment_id=payment_intent_id)
        order.payment_status = Order.PaymentStatus.PAID
        order.save(update_fields=["payment_status"])
        logger.info(f"Order {order.order_number} marked as paid via Stripe.")
        return True
    except Order.DoesNotExist:
        logger.error(f"Order not found for Stripe payment: {payment_intent_id}")
        return False
