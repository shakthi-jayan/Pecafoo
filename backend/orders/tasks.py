"""
Orders — Celery Tasks
========================
Background tasks for order processing and cleanup.
"""

import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task
def cleanup_stale_orders():
    """
    Automatically cancel orders that have been in 'placed' status
    for more than 30 minutes without restaurant confirmation.
    Runs every hour via Celery Beat.
    """
    from orders.models import Order

    threshold = timezone.now() - timezone.timedelta(minutes=30)

    stale_orders = Order.objects.filter(
        status=Order.Status.PLACED,
        placed_at__lt=threshold,
    )

    count = stale_orders.count()
    if count > 0:
        stale_orders.update(
            status=Order.Status.CANCELLED,
            cancelled_at=timezone.now(),
        )
        logger.info(f"Cleaned up {count} stale orders (unconfirmed for 30+ min).")

    return f"Cleaned {count} stale orders."


@shared_task
def process_order_completion(order_id):
    """
    Post-delivery processing: update delivery partner stats and earnings.
    Called when an order is marked as 'delivered'.
    """
    from orders.models import Order
    from delivery.models import DeliveryPartnerProfile, DeliveryEarning

    try:
        order = Order.objects.get(id=order_id, status=Order.Status.DELIVERED)
    except Order.DoesNotExist:
        logger.warning(f"Order {order_id} not found or not delivered.")
        return

    if not order.delivery_partner:
        return

    try:
        profile = DeliveryPartnerProfile.objects.get(user=order.delivery_partner)

        
        profile.total_deliveries += 1

        
        delivery_fee = order.delivery_fee
        earning, created = DeliveryEarning.objects.get_or_create(
            order=order,
            defaults={
                "delivery_partner": order.delivery_partner,
                "amount": delivery_fee,
                "tip": 0,
            },
        )

        if created:
            profile.total_earnings += earning.total
            logger.info(
                f"Earning recorded: ₹{earning.total} for {order.delivery_partner.email}"
            )

        profile.save(update_fields=["total_deliveries", "total_earnings"])

    except DeliveryPartnerProfile.DoesNotExist:
        logger.error(
            f"Delivery profile not found for {order.delivery_partner.email}"
        )
