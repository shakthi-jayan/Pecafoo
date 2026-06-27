"""
Delivery — WebSocket Consumer
================================
Real-time delivery location tracking via WebSocket.
Customers tracking their delivery can receive live location updates.

Usage (Frontend):
    const ws = new WebSocket("<VITE_WS_BASE_URL>/delivery/<order_id>/?token=<jwt_token>")

Usage (Delivery Partner sends location):
    ws.send(JSON.stringify({
        "type": "location_update",
        "latitude": 19.0760,
        "longitude": 72.8777
    }))
"""

import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class DeliveryLocationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time delivery tracking.

    - Delivery partners send their location via this WebSocket.
    - Customers/restaurants subscribe to receive location updates.
    - Updates are broadcast to the order group so the order tracking
      consumer also receives them.
    """

    async def connect(self):
        self.order_id = self.scope["url_route"]["kwargs"]["order_id"]
        self.delivery_group = f"delivery_{self.order_id}"
        self.order_group = f"order_{self.order_id}"
        self.user = self.scope.get("user", AnonymousUser())

        
        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close()
            return

        
        has_access = await self.check_delivery_access()
        if not has_access:
            await self.close()
            return

        
        await self.channel_layer.group_add(self.delivery_group, self.channel_name)
        await self.channel_layer.group_add(self.order_group, self.channel_name)
        await self.accept()

        
        location = await self.get_current_location()
        if location:
            await self.send_json({
                "type": "current_location",
                "data": location,
            })

        logger.info(f"WS delivery connected: {self.user.email} → order {self.order_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.delivery_group, self.channel_name)
        await self.channel_layer.group_discard(self.order_group, self.channel_name)

    async def receive_json(self, content):
        """
        Handle incoming messages.
        Delivery partners can send location updates.
        """
        message_type = content.get("type")

        if message_type == "ping":
            await self.send_json({"type": "pong"})
            return

        if message_type == "location_update":
            
            if self.user.role != "delivery":
                await self.send_json({
                    "type": "error",
                    "message": "Only delivery partners can send location updates.",
                })
                return

            latitude = content.get("latitude")
            longitude = content.get("longitude")

            if latitude is None or longitude is None:
                await self.send_json({
                    "type": "error",
                    "message": "latitude and longitude are required.",
                })
                return

            
            await self.save_location(latitude, longitude)

            
            location_data = {
                "latitude": float(latitude),
                "longitude": float(longitude),
                "order_id": str(self.order_id),
            }

            await self.channel_layer.group_send(
                self.delivery_group,
                {
                    "type": "location_broadcast",
                    "data": location_data,
                },
            )

            
            await self.channel_layer.group_send(
                self.order_group,
                {
                    "type": "delivery_location_update",
                    "data": location_data,
                },
            )

    

    async def location_broadcast(self, event):
        """Handle location broadcast to delivery group subscribers."""
        await self.send_json({
            "type": "delivery_location",
            "data": event["data"],
        })

    async def delivery_location_update(self, event):
        """Handle location broadcast to order group subscribers."""
        await self.send_json({
            "type": "delivery_location",
            "data": event["data"],
        })

    

    @database_sync_to_async
    def check_delivery_access(self):
        """Check if the user can access this delivery tracking."""
        from orders.models import Order

        try:
            order = Order.objects.select_related(
                "customer", "restaurant", "delivery_partner"
            ).get(id=self.order_id)

            if self.user.role == "admin":
                return True
            if self.user.role == "customer" and order.customer == self.user:
                return True
            if self.user.role == "restaurant" and order.restaurant.owner == self.user:
                return True
            if self.user.role == "delivery" and order.delivery_partner == self.user:
                return True
            return False
        except Order.DoesNotExist:
            return False

    @database_sync_to_async
    def save_location(self, latitude, longitude):
        """Save delivery partner's location to profile and log."""
        from delivery.models import DeliveryLocationLog, DeliveryPartnerProfile
        from django.utils import timezone

        
        try:
            profile = DeliveryPartnerProfile.objects.get(user=self.user)
            profile.current_latitude = latitude
            profile.current_longitude = longitude
            profile.last_location_update = timezone.now()
            profile.save(update_fields=[
                "current_latitude", "current_longitude", "last_location_update"
            ])
        except DeliveryPartnerProfile.DoesNotExist:
            pass

        
        DeliveryLocationLog.objects.create(
            delivery_partner=self.user,
            order_id=self.order_id,
            latitude=latitude,
            longitude=longitude,
        )

    @database_sync_to_async
    def get_current_location(self):
        """Get the current delivery partner's location for this order."""
        from orders.models import Order
        from delivery.models import DeliveryPartnerProfile

        try:
            order = Order.objects.get(id=self.order_id)
            if order.delivery_partner:
                try:
                    profile = DeliveryPartnerProfile.objects.get(
                        user=order.delivery_partner
                    )
                    if profile.current_latitude and profile.current_longitude:
                        return {
                            "latitude": float(profile.current_latitude),
                            "longitude": float(profile.current_longitude),
                            "last_updated": (
                                profile.last_location_update.isoformat()
                                if profile.last_location_update
                                else None
                            ),
                        }
                except DeliveryPartnerProfile.DoesNotExist:
                    pass
        except Exception:
            pass
        return None
