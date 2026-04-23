"""
Promotions — URL Configuration
"""

from django.urls import path
from promotions.views import (
    PromotionApplyView,
    PromotionDetailView,
    PromotionListCreateView,
)

app_name = "promotions"

urlpatterns = [
    path("", PromotionListCreateView.as_view(), name="promotion-list"),
    path("<uuid:pk>/", PromotionDetailView.as_view(), name="promotion-detail"),
    path("apply/", PromotionApplyView.as_view(), name="promotion-apply"),
]
