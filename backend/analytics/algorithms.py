"""
Analytics — Algorithms
========================
Production-grade analytics algorithms for:
1. Demand Forecasting — time-series based on real order history
2. Surge Pricing — supply/demand ratio calculation
3. Fraud Detection — rule-based anomaly scoring
4. Driver Positioning — order density-based zone suggestion
"""

import datetime
import logging
from collections import defaultdict
from decimal import Decimal

from django.db.models import Count, Sum, Avg
from django.utils import timezone

logger = logging.getLogger(__name__)






def forecast_demand():
    """
    Returns hourly demand forecast for the next 6 hours
    based on historical order patterns (same day of week, same hours).

    Uses a 4-week lookback to calculate average orders per hour.
    """
    from orders.models import Order

    now = timezone.now()
    forecast = []

    
    lookback_weeks = 4
    lookback_dates = [
        now - datetime.timedelta(weeks=w) for w in range(1, lookback_weeks + 1)
    ]

    for i in range(1, 7):
        target_time = now + datetime.timedelta(hours=i)
        hour = target_time.hour

        
        historical_counts = []
        for past_date in lookback_dates:
            
            if past_date.weekday() == target_time.weekday():
                count = Order.objects.filter(
                    placed_at__date=past_date.date(),
                    placed_at__hour=hour,
                ).exclude(status="cancelled").count()
                historical_counts.append(count)

        if historical_counts:
            avg_demand = sum(historical_counts) / len(historical_counts)
        else:
            
            if 11 <= hour <= 14:  
                avg_demand = 15
            elif 18 <= hour <= 21:  
                avg_demand = 20
            elif 7 <= hour <= 10:  
                avg_demand = 8
            else:
                avg_demand = 5

        
        if target_time.weekday() in (4, 5):  
            avg_demand *= 1.3
        elif target_time.weekday() == 6:  
            avg_demand *= 1.2

        predicted = max(1, int(round(avg_demand)))

        forecast.append({
            "time": target_time.strftime("%I %p"),
            "hour": hour,
            "predicted_orders": predicted,
            "is_peak": predicted > 15,
            "day_of_week": target_time.strftime("%A"),
        })

    return forecast






def calculate_surge_pricing():
    """
    Calculate current surge multiplier based on real supply/demand ratio.

    Supply = online delivery partners
    Demand = active (unfulfilled) orders
    """
    from delivery.models import DeliveryPartnerProfile
    from orders.models import Order

    active_drivers = DeliveryPartnerProfile.objects.filter(
        is_available=True, is_verified=True
    ).count()

    pending_orders = Order.objects.filter(
        status__in=["placed", "confirmed", "preparing", "ready"]
    ).count()

    if active_drivers == 0:
        multiplier = 1.5 if pending_orders > 0 else 1.0
    else:
        ratio = pending_orders / active_drivers
        if ratio > 3:
            multiplier = 2.0
        elif ratio > 2:
            multiplier = 1.5
        elif ratio > 1.2:
            multiplier = 1.2
        else:
            multiplier = 1.0

    demand_level = "Normal"
    if multiplier >= 1.5:
        demand_level = "High"
    elif multiplier > 1.0:
        demand_level = "Medium"

    return {
        "multiplier": round(multiplier, 1),
        "is_surge": multiplier > 1.0,
        "demand_level": demand_level,
        "active_drivers": active_drivers,
        "pending_orders": pending_orders,
    }






def get_fraud_score(user_id):
    """
    Calculate fraud risk score based on real order patterns.

    Rules:
    - Rule 1: High velocity (>5 orders in 24h) → +40 points
    - Rule 2: Multiple large transactions (>₹2000) → +30 points
    - Rule 3: High cancellation rate → +50 points
    - Rule 4: Multiple different addresses in short time → +20 points
    """
    from accounts.models import User
    from orders.models import Order

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return {"error": "User not found", "score": 0, "risk_level": "Unknown", "reasons": []}

    time_window = timezone.now() - datetime.timedelta(hours=24)
    recent_orders = Order.objects.filter(
        customer=user,
        placed_at__gte=time_window,
    )

    score_points = 0
    reasons = []

    
    order_count = recent_orders.count()
    if order_count > 5:
        score_points += 40
        reasons.append(f"High order frequency ({order_count} orders in 24h)")

    
    large_orders = recent_orders.filter(total__gt=2000)
    if large_orders.count() >= 2:
        score_points += 30
        reasons.append(f"Multiple large transactions ({large_orders.count()} orders > ₹2000)")

    
    cancelled = recent_orders.filter(status="cancelled").count()
    if cancelled >= 2:
        score_points += 50
        reasons.append(f"High cancellation rate ({cancelled} cancellations in 24h)")
    elif order_count > 0 and cancelled / max(order_count, 1) > 0.5:
        score_points += 30
        reasons.append(f"Cancellation ratio over 50%")

    
    distinct_addresses = recent_orders.values("delivery_address").distinct().count()
    if distinct_addresses > 3:
        score_points += 20
        reasons.append(f"Multiple delivery addresses ({distinct_addresses} in 24h)")

    
    risk_level = "Low"
    if score_points >= 70:
        risk_level = "High"
    elif score_points >= 30:
        risk_level = "Medium"

    return {
        "user_id": str(user_id),
        "score": min(score_points, 100),
        "risk_level": risk_level,
        "reasons": reasons,
        "order_count_24h": order_count,
        "cancellation_count_24h": cancelled,
    }






def get_suggested_zone():
    """
    Return a suggested area for delivery partners based on
    real order density data.

    Analyzes recent active orders to find the restaurant cluster
    with the highest demand.
    """
    from orders.models import Order
    from restaurants.models import Restaurant

    time_window = timezone.now() - datetime.timedelta(hours=2)

    
    active_order_restaurants = (
        Order.objects.filter(
            placed_at__gte=time_window,
            status__in=["placed", "confirmed", "preparing"],
        )
        .values("restaurant")
        .annotate(order_count=Count("id"))
        .order_by("-order_count")[:5]
    )

    if not active_order_restaurants:
        
        top_restaurant = (
            Restaurant.objects.filter(
                is_active=True,
                approval_status=Restaurant.ApprovalStatus.APPROVED,
                latitude__isnull=False,
                longitude__isnull=False,
            )
            .order_by("-average_rating")
            .first()
        )

        if top_restaurant:
            return {
                "name": f"Near {top_restaurant.name}",
                "lat": float(top_restaurant.latitude) if top_restaurant.latitude else None,
                "lng": float(top_restaurant.longitude) if top_restaurant.longitude else None,
                "expected_orders": 0,
                "source": "fallback",
            }
        return {
            "name": "No active demand zones",
            "lat": None,
            "lng": None,
            "expected_orders": 0,
            "source": "none",
        }

    
    top_restaurant_id = active_order_restaurants[0]["restaurant"]
    top_count = active_order_restaurants[0]["order_count"]

    try:
        restaurant = Restaurant.objects.get(id=top_restaurant_id)
        return {
            "name": f"Near {restaurant.name} ({restaurant.city})",
            "lat": float(restaurant.latitude) if restaurant.latitude else None,
            "lng": float(restaurant.longitude) if restaurant.longitude else None,
            "expected_orders": top_count,
            "source": "real_data",
        }
    except Restaurant.DoesNotExist:
        return {
            "name": "Unknown zone",
            "lat": None,
            "lng": None,
            "expected_orders": top_count,
            "source": "error",
        }
