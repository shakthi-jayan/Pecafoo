"""
Delivery — Assignment Service
================================
Handles automatic assignment of delivery partners to orders.
Uses proximity-based matching to find the nearest available AND free partner.
"""

import logging
from decimal import Decimal
from math import radians, sin, cos, sqrt, atan2

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

logger = logging.getLogger(__name__)


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points
    on Earth using the Haversine formula.
    Returns distance in kilometers.
    """
    R = 6371  

    lat1, lon1, lat2, lon2 = map(radians, [
        float(lat1), float(lon1), float(lat2), float(lon2)
    ])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


def find_nearest_free_delivery_partner(restaurant_lat, restaurant_lon, max_distance_km=10):
    """
    Find the nearest available AND free (no active orders) delivery partner.

    Priority:
    1. Partners with NO active orders (completely free) — nearest first
    2. If none found, partners who are available but may have orders — nearest first

    Args:
        restaurant_lat: Restaurant latitude
        restaurant_lon: Restaurant longitude
        max_distance_km: Maximum search radius in kilometers

    Returns:
        DeliveryPartnerProfile or None
    """
    from delivery.models import DeliveryPartnerProfile
    from orders.models import Order

    if not restaurant_lat or not restaurant_lon:
        logger.warning("Restaurant coordinates not available for delivery assignment.")
        return None

    
    available_partners = DeliveryPartnerProfile.objects.filter(
        is_available=True,
        is_verified=True,
        current_latitude__isnull=False,
        current_longitude__isnull=False,
    ).select_related("user")

    if not available_partners.exists():
        logger.info("No available delivery partners found.")
        return None

    
    active_statuses = [
        Order.Status.CONFIRMED,
        Order.Status.PREPARING,
        Order.Status.READY,
        Order.Status.PICKED_UP,
        Order.Status.ON_THE_WAY,
    ]

    
    busy_partner_user_ids = Order.objects.filter(
        delivery_partner__isnull=False,
        status__in=active_statuses,
    ).values_list("delivery_partner_id", flat=True).distinct()

    
    free_partners = []
    busy_partners = []

    for partner in available_partners:
        distance = haversine_distance(
            restaurant_lat,
            restaurant_lon,
            partner.current_latitude,
            partner.current_longitude,
        )

        if distance > max_distance_km:
            continue

        partner_data = {
            "partner": partner,
            "distance": distance,
        }

        if partner.user_id not in busy_partner_user_ids:
            free_partners.append(partner_data)
        else:
            busy_partners.append(partner_data)

    
    free_partners.sort(key=lambda x: x["distance"])
    busy_partners.sort(key=lambda x: x["distance"])

    
    if free_partners:
        chosen = free_partners[0]
        logger.info(
            f"Free delivery partner found: {chosen['partner'].user.email} "
            f"({chosen['distance']:.2f} km away)"
        )
        return chosen["partner"]
    elif busy_partners:
        chosen = busy_partners[0]
        logger.info(
            f"All partners busy. Assigning closest busy partner: "
            f"{chosen['partner'].user.email} ({chosen['distance']:.2f} km away)"
        )
        return chosen["partner"]
    else:
        logger.info(
            f"No delivery partners within {max_distance_km}km of restaurant."
        )
        return None



def find_nearest_delivery_partner(restaurant_lat, restaurant_lon, max_distance_km=10):
    return find_nearest_free_delivery_partner(restaurant_lat, restaurant_lon, max_distance_km)


@transaction.atomic
def assign_delivery_partner(order):
    """
    Assign the nearest available AND free delivery partner to an order.
    Called when an order status changes to 'ready' or 'confirmed'.

    Args:
        order: Order instance

    Returns:
        Tuple of (success: bool, partner_or_message: DeliveryPartnerProfile | str)
    """
    from delivery.models import DeliveryPartnerProfile
    from notifications.models import Notification

    
    if order.delivery_partner:
        return True, "Delivery partner already assigned."

    
    restaurant = order.restaurant
    if not restaurant.latitude or not restaurant.longitude:
        return False, "Restaurant location coordinates not available."

    
    partner = find_nearest_free_delivery_partner(
        restaurant.latitude,
        restaurant.longitude,
    )

    if not partner:
        return False, "No available delivery partners nearby."

    
    order.delivery_partner = partner.user
    order.save(update_fields=["delivery_partner"])

    logger.info(
        f"Delivery partner {partner.user.email} assigned to order {order.order_number}"
    )

    
    try:
        Notification.objects.create(
            user=partner.user,
            notification_type=Notification.NotificationType.DELIVERY_ASSIGNED,
            title="New Delivery Assignment!",
            message=(
                f"You've been assigned order #{order.order_number} "
                f"from {restaurant.name}. "
                f"Delivery to: {order.delivery_address[:100]}"
            ),
            channel=Notification.Channel.IN_APP,
            related_order_id=order.id,
            is_sent=True,
        )
    except Exception as e:
        logger.error(f"Failed to send delivery assignment notification: {e}")

    
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        from orders.serializers import OrderSerializer

        channel_layer = get_channel_layer()
        group_name = f"delivery_{partner.user.id}"
        order_data = OrderSerializer(order).data

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "delivery_assignment",
                "data": {
                    "order": order_data,
                    "message": f"New delivery from {restaurant.name}",
                },
            },
        )
    except Exception as e:
        logger.warning(f"WebSocket delivery broadcast failed: {e}")

    
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        from orders.serializers import OrderSerializer

        channel_layer = get_channel_layer()
        group_name = f"order_{order.id}"
        order_data = OrderSerializer(order).data

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "order_update",
                "data": order_data,
            },
        )
    except Exception as e:
        logger.warning(f"WebSocket customer broadcast failed: {e}")

    return True, partner


def auto_assign_on_status_change(order, new_status):
    """
    Hook to automatically assign a delivery partner when order
    status changes to 'ready' or 'confirmed'.

    Can be called from the OrderStatusUpdateView or via a signal.
    """
    if new_status in ("ready", "confirmed") and not order.delivery_partner:
        success, result = assign_delivery_partner(order)
        if success:
            logger.info(f"Auto-assigned delivery partner for order {order.order_number}")
        else:
            logger.warning(
                f"Auto-assignment failed for order {order.order_number}: {result}"
            )
        return success, result
    return False, "No assignment needed for this status."
