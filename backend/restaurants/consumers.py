"""
Restaurants WebSocket consumer.

Provides a restaurant-owner scoped websocket channel used by the
restaurant dashboard for live operational updates.
"""

import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class RestaurantConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for restaurant owner live updates.

    The current frontend connects with the authenticated user's ID in the URL,
    so this consumer validates that the path parameter matches the logged-in
    restaurant user before joining the owner's broadcast group.
    """

    async def connect(self):
        self.restaurant_id = self.scope["url_route"]["kwargs"]["restaurant_id"]
        self.user = self.scope.get("user", AnonymousUser())

        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close()
            return

        if getattr(self.user, "role", None) != "restaurant":
            await self.close()
            return

        if str(self.user.id) != str(self.restaurant_id):
            logger.warning(
                "WS restaurant connect rejected: user %s tried to open %s",
                getattr(self.user, "email", self.user.id),
                self.restaurant_id,
            )
            await self.close()
            return

        self.group_name = f"restaurant_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json(
            {
                "type": "connection_established",
                "group": self.group_name,
            }
        )

        logger.info(
            "WS restaurant connected: %s -> %s",
            getattr(self.user, "email", self.user.id),
            self.group_name,
        )

    async def disconnect(self, close_code):
        group_name = getattr(self, "group_name", None)
        if group_name:
            await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive_json(self, content):
        if content.get("type") == "ping":
            await self.send_json({"type": "pong"})

    async def order_update(self, event):
        await self.send_json(
            {
                "type": "order_update",
                "data": event.get("data"),
            }
        )

    async def delivery_assignment(self, event):
        await self.send_json(
            {
                "type": "delivery_assignment",
                "data": event.get("data"),
            }
        )

    async def restaurant_notification(self, event):
        await self.send_json(
            {
                "type": "restaurant_notification",
                "data": event.get("data"),
            }
        )
