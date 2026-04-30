"""
Promotions — Celery Tasks
"""

import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task
def deactivate_expired_promotions():
    """Deactivate promotions that have passed their expiry date."""
    from promotions.models import Promotion

    expired = Promotion.objects.filter(
        is_active=True,
        expiry_date__lt=timezone.now(),
    )
    count = expired.update(is_active=False)
    if count > 0:
        logger.info(f"Deactivated {count} expired promotions.")
    return {"deactivated": count}
