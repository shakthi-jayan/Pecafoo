"""
Notifications — URL Configuration
====================================
"""

from django.urls import path
from notifications.views import (
    MarkAllReadView,
    MarkNotificationReadView,
    NotificationListView,
    UnreadNotificationCountView,
)

app_name = "notifications"

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("unread-count/", UnreadNotificationCountView.as_view(), name="unread-count"),
    path("<uuid:pk>/read/", MarkNotificationReadView.as_view(), name="mark-read"),
    path("mark-all-read/", MarkAllReadView.as_view(), name="mark-all-read"),
]
