"""
Orders — URL Configuration
=============================
"""

from django.urls import path
from orders.views import (
    AdminOrderListView,
    AvailableOrdersForDeliveryView,
    CustomerOrderListView,
    DeliveryOrderListView,
    OrderCreateView,
    OrderDetailView,
    OrderRatingView,
    OrderCancellationView,
    PaymentInitiateView,
    RazorpayVerifyView,
    stripe_webhook,
    OrderStatusUpdateView,
    RestaurantOrderListView,
)

app_name = "orders"

urlpatterns = [
    
    path("create/", OrderCreateView.as_view(), name="order-create"),

    
    path("my/", CustomerOrderListView.as_view(), name="customer-orders"),
    path("restaurant/", RestaurantOrderListView.as_view(), name="restaurant-orders"),
    path("delivery/", DeliveryOrderListView.as_view(), name="delivery-orders"),
    path("admin/", AdminOrderListView.as_view(), name="admin-orders"),
    path("available-for-delivery/", AvailableOrdersForDeliveryView.as_view(), name="available-delivery"),

    
    path("<uuid:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("<uuid:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status"),
    path("<uuid:pk>/rate/", OrderRatingView.as_view(), name="order-rate"),
    path("<uuid:pk>/cancel/", OrderCancellationView.as_view(), name="order-cancel"),
    path("<uuid:pk>/pay/", PaymentInitiateView.as_view(), name="order-pay"),
    path("razorpay/verify/", RazorpayVerifyView.as_view(), name="razorpay-verify"),
    path("stripe/webhook/", stripe_webhook, name="stripe-webhook"),
]
