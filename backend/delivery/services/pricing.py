"""
Pure pricing service for delivery fee and payout calculations.
"""

from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import urlopen
import json

from django.core.cache import cache
from django.utils import timezone

from delivery.models import (
    DeliveryFeeBreakdown,
    DeliveryPricingConfig,
    PartnerPayoutConfig,
    SurgeConfig,
)


TWOPLACES = Decimal("0.01")


def _money(value: Decimal | int | float | str) -> Decimal:
    return Decimal(str(value)).quantize(TWOPLACES, rounding=ROUND_HALF_UP)


class DeliveryPricingService:
    SURGE_CACHE_KEY = "delivery_pricing:active_surge"
    SURGE_CACHE_TTL = 60
    OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving/"

    @classmethod
    def get_active_pricing_config(cls) -> DeliveryPricingConfig:
        config = DeliveryPricingConfig.objects.filter(is_active=True).order_by("-created_at").first()
        if not config:
            raise DeliveryPricingConfig.DoesNotExist("No active DeliveryPricingConfig found.")
        return config

    @classmethod
    def get_active_payout_config(cls) -> PartnerPayoutConfig:
        config = PartnerPayoutConfig.objects.filter(is_active=True).order_by("-created_at").first()
        if not config:
            raise PartnerPayoutConfig.DoesNotExist("No active PartnerPayoutConfig found.")
        return config

    @classmethod
    def get_active_surge(cls) -> SurgeConfig | None:
        cached = cache.get(cls.SURGE_CACHE_KEY)
        if cached is not None:
            return cached

        now = timezone.localtime()
        current_time = now.time()
        weekday = now.weekday()

        matched = []
        for surge in SurgeConfig.objects.filter(is_active=True).order_by("-priority", "-created_at"):
            if surge.trigger_type == SurgeConfig.TriggerType.MANUAL:
                matched.append(surge)
                continue

            if surge.trigger_type == SurgeConfig.TriggerType.TIME_WINDOW:
                if surge.start_time and surge.end_time:
                    in_window = surge.start_time <= current_time <= surge.end_time
                    matches_day = not surge.days_of_week or weekday in surge.days_of_week
                    if in_window and matches_day:
                        matched.append(surge)
                continue

            if surge.trigger_type == SurgeConfig.TriggerType.WEATHER:
                
                matched.append(surge)

        active = matched[0] if matched else None
        cache.set(cls.SURGE_CACHE_KEY, active, cls.SURGE_CACHE_TTL)
        return active

    @classmethod
    def get_route_distance_km(cls, origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> float:
        query = urlencode({"overview": "false"})
        url = f"{cls.OSRM_BASE_URL}{origin_lng},{origin_lat};{dest_lng},{dest_lat}?{query}"
        with urlopen(url, timeout=8) as response:  
            payload = json.loads(response.read().decode("utf-8"))

        routes = payload.get("routes") or []
        if not routes:
            raise ValueError("No OSRM route found.")

        meters = routes[0].get("distance", 0) or 0
        return round(float(meters) / 1000.0, 2)

    @classmethod
    def calculate_delivery_fee(cls, distance_km: float, cart_value: Decimal) -> dict:
        config = cls.get_active_pricing_config()
        surge = cls.get_active_surge()

        base_fee = _money(config.base_fee)
        extra_distance = max(Decimal(str(distance_km)) - Decimal(str(config.base_distance_km)), Decimal("0"))
        distance_fee = _money(extra_distance * Decimal(str(config.per_km_rate))) if extra_distance > 0 else _money(0)

        surge_fee = _money(0)
        if surge:
            multiplier_delta = Decimal(str(surge.multiplier)) - Decimal("1")
            surge_fee = _money((base_fee + distance_fee) * multiplier_delta)

        small_cart_fee = _money(config.small_cart_fee) if Decimal(str(cart_value)) < Decimal(str(config.min_order_fee_threshold)) else _money(0)
        total_customer_fee = _money(base_fee + distance_fee + surge_fee + small_cart_fee)

        return {
            "distance_km": round(float(distance_km), 2),
            "base_fee": base_fee,
            "distance_fee": distance_fee,
            "surge_fee": surge_fee,
            "small_cart_fee": small_cart_fee,
            "total_customer_fee": total_customer_fee,
            "surge_active": surge is not None,
            "surge_label": surge.name if surge else None,
            "surge_config": surge,
            "pricing_config": config,
        }

    @classmethod
    def calculate_partner_payout(cls, distance_km: float, surge_config: SurgeConfig | None) -> dict:
        config = cls.get_active_payout_config()
        pricing_config = cls.get_active_pricing_config()
        payout = _money(config.base_pay)

        extra_distance = max(
            Decimal(str(distance_km)) - Decimal(str(pricing_config.base_distance_km)),
            Decimal("0"),
        )
        distance_incentive = _money(extra_distance * Decimal(str(config.per_km_incentive))) if extra_distance > 0 else _money(0)
        peak_bonus = _money(config.peak_hour_bonus) if surge_config and surge_config.trigger_type == SurgeConfig.TriggerType.TIME_WINDOW else _money(0)
        rain_bonus = _money(config.rain_bonus) if surge_config and surge_config.trigger_type == SurgeConfig.TriggerType.WEATHER else _money(0)
        long_distance_bonus = _money(config.long_distance_bonus) if distance_km > config.long_distance_threshold_km else _money(0)

        total_partner_payout = _money(payout + distance_incentive + peak_bonus + rain_bonus + long_distance_bonus)

        return {
            "partner_base_pay": payout,
            "partner_distance_incentive": distance_incentive,
            "partner_peak_bonus": peak_bonus,
            "partner_rain_bonus": rain_bonus,
            "partner_long_distance_bonus": long_distance_bonus,
            "total_partner_payout": total_partner_payout,
            "payout_config": config,
        }

    @classmethod
    def save_breakdown(cls, order, customer_breakdown: dict, partner_breakdown: dict) -> DeliveryFeeBreakdown:
        total_customer_fee = _money(customer_breakdown["total_customer_fee"])
        total_partner_payout = _money(partner_breakdown["total_partner_payout"])
        platform_margin = _money(total_customer_fee - total_partner_payout)

        breakdown, _ = DeliveryFeeBreakdown.objects.update_or_create(
            order=order,
            defaults={
                "distance_km": customer_breakdown["distance_km"],
                "base_fee": customer_breakdown["base_fee"],
                "distance_fee": customer_breakdown["distance_fee"],
                "surge_fee": customer_breakdown["surge_fee"],
                "small_cart_fee": customer_breakdown["small_cart_fee"],
                "total_customer_fee": total_customer_fee,
                "partner_base_pay": partner_breakdown["partner_base_pay"],
                "partner_distance_incentive": partner_breakdown["partner_distance_incentive"],
                "partner_peak_bonus": partner_breakdown["partner_peak_bonus"],
                "partner_rain_bonus": partner_breakdown["partner_rain_bonus"],
                "partner_long_distance_bonus": partner_breakdown["partner_long_distance_bonus"],
                "total_partner_payout": total_partner_payout,
                "platform_margin": platform_margin,
                "surge_config_applied": customer_breakdown.get("surge_config"),
            },
        )
        return breakdown
