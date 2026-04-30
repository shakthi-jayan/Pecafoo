"""
Delivery URL configuration.
"""

from django.urls import path

from delivery.views import (
    AcceptOrderView,
    ActiveDeliveryOrdersView,
    AdminIncentiveSlabDetailView,
    AdminIncentiveSlabListCreateView,
    AdminDeliveryVerificationDetailView,
    AdminDeliveryVerificationListView,
    AdminPricingConfigView,
    AdminPricingSurgeDetailView,
    AdminPricingSurgeView,
    DeclineOrderView,
    DeliveryEstimateView,
    DeliveryProfileView,
    EarningsListView,
    EarningsSummaryView,
    PartnerTodayEarningsView,
    ToggleAvailabilityView,
    UpdateLocationView,
)

app_name = "delivery"

urlpatterns = [
    path("profile/", DeliveryProfileView.as_view(), name="profile"),
    path("availability/", ToggleAvailabilityView.as_view(), name="availability"),
    path("location/", UpdateLocationView.as_view(), name="update-location"),
    path("active-orders/", ActiveDeliveryOrdersView.as_view(), name="active-orders"),
    path("orders/<uuid:pk>/accept/", AcceptOrderView.as_view(), name="accept-order"),
    path("orders/<uuid:pk>/decline/", DeclineOrderView.as_view(), name="decline-order"),
    path("earnings/", EarningsListView.as_view(), name="earnings-list"),
    path("earnings/summary/", EarningsSummaryView.as_view(), name="earnings-summary"),
    path("estimate/", DeliveryEstimateView.as_view(), name="delivery-estimate"),
    path("partner/earnings/today/", PartnerTodayEarningsView.as_view(), name="partner-earnings-today"),
    path("admin/pricing/config/", AdminPricingConfigView.as_view(), name="admin-pricing-config"),
    path("admin/pricing/surge/", AdminPricingSurgeView.as_view(), name="admin-pricing-surge"),
    path("admin/pricing/surge/<uuid:pk>/", AdminPricingSurgeDetailView.as_view(), name="admin-pricing-surge-detail"),
    path("admin/pricing/slabs/", AdminIncentiveSlabListCreateView.as_view(), name="admin-incentive-slab-list"),
    path("admin/pricing/slabs/<uuid:pk>/", AdminIncentiveSlabDetailView.as_view(), name="admin-incentive-slab-detail"),
    path("admin/profiles/", AdminDeliveryVerificationListView.as_view(), name="admin-profile-list"),
    path("admin/profiles/<uuid:pk>/", AdminDeliveryVerificationDetailView.as_view(), name="admin-profile-detail"),
]
