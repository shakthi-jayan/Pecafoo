"""
Notifications — Celery Tasks
===============================
Background tasks for sending notifications via email and push (FCM).
"""

import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_email_notification(self, user_email, subject, message):
    """
    Send an email notification asynchronously via Celery.
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        logger.info(f"Email sent to {user_email}: {subject}")
    except Exception as exc:
        logger.error(f"Failed to send email to {user_email}: {exc}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_push_notification(self, user_id, title, body, data=None):
    """
    Send a push notification via Firebase Cloud Messaging.
    Retrieves the user's fcm_token and sends using firebase-admin SDK.
    """
    from django.contrib.auth import get_user_model

    User = get_user_model()

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.warning(f"Push notification skipped: user {user_id} not found.")
        return

    if not user.fcm_token:
        logger.info(f"Push notification skipped: user {user_id} has no FCM token.")
        return

    try:
        import firebase_admin
        from firebase_admin import messaging

        
        if not firebase_admin._apps:
            cred = firebase_admin.credentials.Certificate(settings.FIREBASE_CONFIG)
            firebase_admin.initialize_app(cred)

        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            token=user.fcm_token,
        )
        response = messaging.send(message)
        logger.info(f"Push notification sent to user {user_id}: {response}")

    except Exception as exc:
        logger.error(f"Failed to send push to user {user_id}: {exc}")
        
        if "UNREGISTERED" in str(exc) or "INVALID_ARGUMENT" in str(exc):
            user.fcm_token = None
            user.save(update_fields=["fcm_token"])
            logger.info(f"Cleared invalid FCM token for user {user_id}")
        else:
            raise self.retry(exc=exc, countdown=60)


@shared_task
def send_order_notification(order_id, notification_type):
    """
    Send notifications related to order status changes.
    Creates in-app notification and triggers email/push as needed.
    """
    from orders.models import Order
    from notifications.models import Notification

    try:
        order = Order.objects.select_related(
            "customer", "restaurant", "delivery_partner"
        ).get(id=order_id)
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found for notification.")
        return

    notification_config = {
        "order_placed": {
            "user": order.restaurant.owner,
            "title": "New Order Received!",
            "message": f"Order #{order.order_number} has been placed. Total: ₹{order.total}",
        },
        "order_confirmed": {
            "user": order.customer,
            "title": "Order Confirmed!",
            "message": f"Your order #{order.order_number} has been confirmed by {order.restaurant.name}.",
        },
        "order_preparing": {
            "user": order.customer,
            "title": "Order Being Prepared",
            "message": f"Your order #{order.order_number} is now being prepared.",
        },
        "order_ready": {
            "user": order.customer,
            "title": "Order Ready for Pickup",
            "message": f"Your order #{order.order_number} is ready and waiting for pickup.",
        },
        "order_picked_up": {
            "user": order.customer,
            "title": "Order Picked Up!",
            "message": f"Your order #{order.order_number} has been picked up and is on the way.",
        },
        "order_delivered": {
            "user": order.customer,
            "title": "Order Delivered! 🎉",
            "message": f"Your order #{order.order_number} has been delivered. Enjoy your meal!",
        },
        "order_cancelled": {
            "user": order.customer,
            "title": "Order Cancelled",
            "message": f"Your order #{order.order_number} has been cancelled.",
        },
    }

    config = notification_config.get(notification_type)
    if not config:
        logger.warning(f"Unknown notification type: {notification_type}")
        return

    
    Notification.objects.create(
        user=config["user"],
        notification_type=notification_type,
        title=config["title"],
        message=config["message"],
        channel=Notification.Channel.IN_APP,
        related_order_id=order.id,
        is_sent=True,
    )

    
    send_email_notification.delay(
        config["user"].email,
        config["title"],
        config["message"],
    )

    
    send_push_notification.delay(
        str(config["user"].id),
        config["title"],
        config["message"],
        {"order_id": str(order.id), "type": notification_type},
    )

    logger.info(
        f"Order notification sent: {notification_type} for order {order.order_number}"
    )
