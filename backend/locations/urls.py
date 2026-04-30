"""
Locations — URL Configuration
================================
"""

from django.urls import path
from locations.views import (
    ServiceAreaListView,
    ServiceAreaDetailView,
    ServiceAreaCreateView,
    ServiceAreaCheckView,
    GeocodeView,
    ReverseGeocodeView,
    OrderRouteView,
    DeliveryPathView,
    ActiveDeliveryPartnersView,
)

app_name = "locations"

urlpatterns = [
    
    path("service-area/", ServiceAreaListView.as_view(), name="service-area-list"),
    path("service-area/create/", ServiceAreaCreateView.as_view(), name="service-area-create"),
    path("service-area/<uuid:pk>/", ServiceAreaDetailView.as_view(), name="service-area-detail"),
    path("check-service-area/", ServiceAreaCheckView.as_view(), name="check-service-area"),

    
    path("geocode/", GeocodeView.as_view(), name="geocode"),
    path("reverse-geocode/", ReverseGeocodeView.as_view(), name="reverse-geocode"),

    
    path("orders/<uuid:order_id>/route/", OrderRouteView.as_view(), name="order-route"),

    
    path("delivery-path/<uuid:order_id>/", DeliveryPathView.as_view(), name="delivery-path"),
    path("active-partners/", ActiveDeliveryPartnersView.as_view(), name="active-partners"),
]
