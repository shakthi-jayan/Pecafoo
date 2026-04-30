"""
Locations — Celery Tasks
===========================
Background tasks for:
- ETA recalculation
- Geofence monitoring (proximity alerts)
- Location history persistence
"""

import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task
def recalculate_live_eta():
    """
    Recalculate ETA for all active deliveries based on
    the current location of the delivery partner.
    Runs every 30 seconds via Celery Beat.
    """
    from orders.models import Order
    from delivery.models import DeliveryPartnerProfile
    from locations.models import DeliveryRoute
    from locations.services import calculate_route

    active_orders = Order.objects.filter(
        status__in=["picked_up", "on_the_way"],
        delivery_partner__isnull=False,
    ).select_related("restaurant")

    updated = 0
    for order in active_orders:
        try:
            profile = DeliveryPartnerProfile.objects.get(user=order.delivery_partner)
            if not profile.current_latitude or not profile.current_longitude:
                continue
            if not order.delivery_latitude or not order.delivery_longitude:
                continue

            
            route_data = calculate_route(
                profile.current_latitude,
                profile.current_longitude,
                order.delivery_latitude,
                order.delivery_longitude,
            )

            if route_data:
                eta = timezone.now() + timezone.timedelta(
                    seconds=route_data["duration_seconds"]
                )

                DeliveryRoute.objects.update_or_create(
                    order=order,
                    defaults={
                        "origin_latitude": profile.current_latitude,
                        "origin_longitude": profile.current_longitude,
                        "origin_label": "Delivery Partner (Live)",
                        "destination_latitude": order.delivery_latitude,
                        "destination_longitude": order.delivery_longitude,
                        "destination_label": order.delivery_address[:200] if order.delivery_address else "",
                        "route_geojson": route_data.get("route_geojson"),
                        "distance_meters": route_data["distance_meters"],
                        "duration_seconds": route_data["duration_seconds"],
                        "waypoints": route_data.get("waypoints"),
                        "estimated_arrival": eta,
                        "last_eta_update": timezone.now(),
                    },
                )

                
                try:
                    from channels.layers import get_channel_layer
                    from asgiref.sync import async_to_sync

                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f"order_{order.id}",
                        {
                            "type": "order_update",
                            "data": {
                                "type": "eta_update",
                                "order_id": str(order.id),
                                "eta": eta.isoformat(),
                                "distance_meters": route_data["distance_meters"],
                                "duration_seconds": route_data["duration_seconds"],
                            },
                        },
                    )
                except Exception:
                    pass

                updated += 1

        except DeliveryPartnerProfile.DoesNotExist:
            continue
        except Exception as e:
            logger.error(f"ETA recalc failed for order {order.order_number}: {e}")

    if updated:
        logger.info(f"Recalculated ETA for {updated} active deliveries.")
    return f"Updated {updated} ETAs."


@shared_task
def check_geofence_proximity():
    """
    Check if delivery partners are near pickup/dropoff points.
    Triggers notifications when within threshold distance.
    Runs every 15 seconds via Celery Beat.
    """
    from orders.models import Order
    from delivery.models import DeliveryPartnerProfile
    from locations.services import meters_between

    RESTAURANT_PROXIMITY_M = 150  
    CUSTOMER_PROXIMITY_M = 200    

    active_orders = Order.objects.filter(
        status__in=["confirmed", "preparing", "ready", "picked_up", "on_the_way"],
        delivery_partner__isnull=False,
    ).select_related("restaurant")

    for order in active_orders:
        try:
            profile = DeliveryPartnerProfile.objects.get(user=order.delivery_partner)
            if not profile.current_latitude or not profile.current_longitude:
                continue

            partner_lat = float(profile.current_latitude)
            partner_lng = float(profile.current_longitude)

            
            if order.status in ("confirmed", "preparing", "ready"):
                if order.restaurant.latitude and order.restaurant.longitude:
                    dist = meters_between(
                        partner_lat, partner_lng,
                        float(order.restaurant.latitude),
                        float(order.restaurant.longitude),
                    )
                    if dist <= RESTAURANT_PROXIMITY_M:
                        _send_proximity_notification(
                            order,
                            "restaurant_nearby",
                            f"Delivery partner is {int(dist)}m away. Please prepare the order!",
                        )

            
            if order.status in ("picked_up", "on_the_way"):
                if order.delivery_latitude and order.delivery_longitude:
                    dist = meters_between(
                        partner_lat, partner_lng,
                        float(order.delivery_latitude),
                        float(order.delivery_longitude),
                    )
                    if dist <= CUSTOMER_PROXIMITY_M:
                        _send_proximity_notification(
                            order,
                            "delivery_nearby",
                            f"Your order is almost here! Driver is {int(dist)}m away.",
                        )

        except DeliveryPartnerProfile.DoesNotExist:
            continue
        except Exception as e:
            logger.error(f"Geofence check failed for order {order.order_number}: {e}")


def _send_proximity_notification(order, notification_type, message):
    """Send a proximity geofence notification (deduplicated)."""
    from notifications.models import Notification
    from django.core.cache import cache

    
    cache_key = f"geofence:{notification_type}:{order.id}"
    if cache.get(cache_key):
        return  

    cache.set(cache_key, True, timeout=300)  

    if notification_type == "restaurant_nearby":
        
        target_user = order.restaurant.owner
        title = "🛵 Driver Approaching!"
    else:
        
        target_user = order.customer
        title = "🎉 Your Order is Almost Here!"

    try:
        Notification.objects.create(
            user=target_user,
            notification_type=Notification.NotificationType.ORDER_STATUS,
            title=title,
            message=message,
            channel=Notification.Channel.IN_APP,
            related_order_id=order.id,
            is_sent=True,
        )
        logger.info(f"Geofence alert sent: {notification_type} for order {order.order_number}")
    except Exception as e:
        logger.error(f"Failed to create geofence notification: {e}")


@shared_task
def persist_location_from_redis(partner_id, order_id, latitude, longitude, speed=None, heading=None, accuracy=None):
    """
    Persist a location point from Redis to the LocationHistory table.
    Called from the WebSocket consumer after storing in Redis.
    """
    from locations.models import LocationHistory
    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        LocationHistory.objects.create(
            delivery_partner_id=partner_id,
            order_id=order_id if order_id else None,
            latitude=latitude,
            longitude=longitude,
            speed=speed,
            heading=heading,
            accuracy=accuracy,
        )
    except Exception as e:
        logger.error(f"Failed to persist location history: {e}")
