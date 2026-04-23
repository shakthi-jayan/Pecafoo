"""
Analytics - URLs
"""
from django.urls import path
from analytics.views import (
    DashboardAnalyticsView,
    DemandForecastView,
    SurgePricingView,
    FraudScoreView,
    SuggestedZoneView,
)

app_name = "analytics"

urlpatterns = [
    path("dashboard/", DashboardAnalyticsView.as_view(), name="dashboard"),
    path("demand-forecast/", DemandForecastView.as_view(), name="demand-forecast"),
    path("surge/", SurgePricingView.as_view(), name="surge"),
    path("fraud-score/<uuid:user_id>/", FraudScoreView.as_view(), name="fraud-score"),
    path("driver/suggested-zone/", SuggestedZoneView.as_view(), name="suggested-zone"),
]
