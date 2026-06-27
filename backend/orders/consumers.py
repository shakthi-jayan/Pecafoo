"""
Orders — WebSocket Consumer
==============================
Real-time order tracking via WebSocket.
Customers, restaurant owners, and delivery partners can subscribe
to order status updates.

Usage (Frontend):
    const ws = new WebSocket("<VITE_WS_BASE_URL>/orders/<order_id>/?token=<jwt_token>")
    ws.onmessage = (e) => { console.log(JSON.parse(e.data)); }
"""

import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class OrderTrackingConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time order tracking.

    - On connect: validates user + order access, joins order group.
    - On receive: allows status updates (from restaurant/delivery).
    - On disconnect: leaves the order group.
    """

    async def connect(self):
        self.order_id = self.scope["url_route"]["kwargs"]["order_id"]
        self.group_name = f"order_{self.order_id}"
        self.user = self.scope.get("user", AnonymousUser())

        
        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            logger.warning(f"WS order connect rejected: unauthenticated user for order {self.order_id}")
            await self.close()
            return

        
        has_access = await self.check_order_access()
        if not has_access:
            logger.warning(
                f"WS order connect rejected: user {self.user.email} "
                f"has no access to order {self.order_id}"
            )
            await self.close()
            return

        
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        
        order_data = await self.get_order_data()
        if order_data:
            await self.send_json({
                "type": "order_state",
                "data": order_data,
            })

        logger.info(f"WS order connected: {self.user.email} → order {self.order_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        logger.info(f"WS order disconnected: order {self.order_id}")

    async def receive_json(self, content):
        """
        Handle incoming messages (e.g., status updates from restaurant/delivery).
        """
        message_type = content.get("type")

        if message_type == "ping":
            await self.send_json({"type": "pong"})
            return

        
        if message_type == "status_update":
            if self.user.role not in ("restaurant", "delivery", "admin"):
                await self.send_json({
                    "type": "error",
                    "message": "You don't have permission to update order status.",
                })
                return

            new_status = content.get("status")
            if new_status:
                success = await self.update_order_status(new_status)
                if success:
                    
                    order_data = await self.get_order_data()
                    await self.channel_layer.group_send(
                        self.group_name,
                        {
                            "type": "order_update",
                            "data": order_data,
                        },
                    )

    

    async def order_update(self, event):
        """Handle order update broadcast from channel layer."""
        await self.send_json({
            "type": "order_update",
            "data": event["data"],
        })

    async def delivery_location_update(self, event):
        """Handle delivery location broadcast."""
        await self.send_json({
            "type": "delivery_location",
            "data": event["data"],
        })

    

    @database_sync_to_async
    def check_order_access(self):
        """Check if the connected user has access to this order."""
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
    def get_order_data(self):
        """Fetch current order data for WebSocket response."""
        from orders.models import Order
        from orders.serializers import OrderSerializer

        try:
            order = Order.objects.prefetch_related("items").get(id=self.order_id)
            return OrderSerializer(order).data
        except Order.DoesNotExist:
            return None

    @database_sync_to_async
    def update_order_status(self, new_status):
        """Update order status in the database."""
        from orders.models import Order
        from django.utils import timezone

        try:
            order = Order.objects.get(id=self.order_id)

            
            if self.user.role == "restaurant" and new_status not in (
                "confirmed", "preparing", "ready", "cancelled"
            ):
                return False
            if self.user.role == "delivery" and new_status not in (
                "picked_up", "on_the_way", "delivered"
            ):
                return False

            now = timezone.now()
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

            order.save()
            logger.info(f"Order {self.order_id} status updated to {new_status} by {self.user.email}")
            return True
        except Order.DoesNotExist:
            return False
