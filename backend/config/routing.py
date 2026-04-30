"""
Central WebSocket routing for live order tracking and delivery location updates.
"""

from django.urls import path, re_path

from delivery.consumers import DeliveryLocationConsumer
from orders.consumers import OrderTrackingConsumer
from restaurants.consumers import RestaurantConsumer


websocket_urlpatterns = [
    path("ws/orders/<uuid:order_id>/", OrderTrackingConsumer.as_asgi()),
    path("ws/delivery/<uuid:order_id>/", DeliveryLocationConsumer.as_asgi()),
    re_path(r'ws/restaurant/(?P<restaurant_id>[^/]+)/$', RestaurantConsumer.as_asgi()),
]
