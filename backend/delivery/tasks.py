"""
Delivery — Celery Tasks
========================
Background tasks for delivery partner statistics and maintenance.
"""

import logging
from celery import shared_task
from django.db.models import Avg, Count
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task
def update_delivery_stats():
    """
    Update delivery partner statistics from order data.
    Runs every 30 minutes via Celery Beat.
    """
    from delivery.models import DeliveryPartnerProfile
    from orders.models import Order

    profiles = DeliveryPartnerProfile.objects.all()
    updated = 0

    for profile in profiles:
        
        delivered_count = Order.objects.filter(
            delivery_partner=profile.user,
            status="delivered",
        ).count()

        
        avg_rating = (
            Order.objects.filter(
                delivery_partner=profile.user,
                status="delivered",
                rating__isnull=False,
            )
            .aggregate(avg=Avg("rating"))
            .get("avg")
            or 0.00
        )

        needs_update = False
        if profile.total_deliveries != delivered_count:
            profile.total_deliveries = delivered_count
            needs_update = True
        if float(profile.average_rating) != float(avg_rating):
            profile.average_rating = round(avg_rating, 2)
            needs_update = True

        if needs_update:
            profile.save(update_fields=["total_deliveries", "average_rating"])
            updated += 1

    logger.info(f"Updated stats for {updated} delivery partners.")
    return f"Updated {updated} delivery partner profiles."
