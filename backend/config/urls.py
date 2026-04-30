"""
Pecafoo Food Delivery - Root URL Configuration
Routes API endpoints for all apps and serves API documentation.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from config.health import HealthCheckView

api_urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health"),
    path("auth/", include("accounts.urls")),
    path("customers/", include("customers.urls")),
    path("restaurants/", include("restaurants.urls")),
    path("delivery/", include("delivery.urls")),
    path("orders/", include("orders.urls")),
    path("locations/", include("locations.urls")),
    path("notifications/", include("notifications.urls")),
    path("analytics/", include("analytics.urls")),
    path("promotions/", include("promotions.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include((api_urlpatterns, "api"), namespace="api")),
    path("api/v1/", include((api_urlpatterns, "api_v1"), namespace="api_v1")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
