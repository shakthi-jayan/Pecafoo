from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0001_initial"),
        ("delivery", "0002_alter_deliverypartnerprofile_documents"),
    ]

    operations = [
        migrations.CreateModel(
            name="DeliveryPricingConfig",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("base_fee", models.DecimalField(decimal_places=2, max_digits=6)),
                ("per_km_rate", models.DecimalField(decimal_places=2, max_digits=6)),
                ("base_distance_km", models.FloatField(default=3.0)),
                ("min_order_fee_threshold", models.DecimalField(decimal_places=2, max_digits=8)),
                ("small_cart_fee", models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ("platform_margin_percent", models.FloatField(default=0)),
                ("is_active", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="IncentiveSlab",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("period", models.CharField(choices=[("daily", "Daily"), ("weekly", "Weekly")], max_length=10)),
                ("orders_required", models.IntegerField()),
                ("bonus_amount", models.DecimalField(decimal_places=2, max_digits=8)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["period", "orders_required"]},
        ),
        migrations.CreateModel(
            name="PartnerPayoutConfig",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("base_pay", models.DecimalField(decimal_places=2, max_digits=6)),
                ("per_km_incentive", models.DecimalField(decimal_places=2, max_digits=6)),
                ("peak_hour_bonus", models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ("rain_bonus", models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ("long_distance_threshold_km", models.FloatField(default=8.0)),
                ("long_distance_bonus", models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ("is_active", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="SurgeConfig",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=120)),
                ("multiplier", models.DecimalField(decimal_places=2, max_digits=4)),
                ("trigger_type", models.CharField(choices=[("time_window", "Time Window"), ("weather", "Weather"), ("manual", "Manual")], max_length=20)),
                ("start_time", models.TimeField(blank=True, null=True)),
                ("end_time", models.TimeField(blank=True, null=True)),
                ("days_of_week", models.JSONField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=False)),
                ("priority", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-priority", "-created_at"]},
        ),
        migrations.CreateModel(
            name="DeliveryFeeBreakdown",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("distance_km", models.FloatField(default=0)),
                ("base_fee", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("distance_fee", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("surge_fee", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("small_cart_fee", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("total_customer_fee", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("partner_base_pay", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("partner_distance_incentive", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("partner_peak_bonus", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("partner_rain_bonus", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("partner_long_distance_bonus", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("total_partner_payout", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("platform_margin", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("calculated_at", models.DateTimeField(auto_now_add=True)),
                ("order", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="delivery_fee_breakdown", to="orders.order")),
                ("surge_config_applied", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="applied_breakdowns", to="delivery.surgeconfig")),
            ],
            options={"ordering": ["-calculated_at"]},
        ),
        migrations.AddConstraint(
            model_name="deliverypricingconfig",
            constraint=models.UniqueConstraint(condition=models.Q(("is_active", True)), fields=("is_active",), name="uniq_active_delivery_pricing_config"),
        ),
        migrations.AddConstraint(
            model_name="partnerpayoutconfig",
            constraint=models.UniqueConstraint(condition=models.Q(("is_active", True)), fields=("is_active",), name="uniq_active_partner_payout_config"),
        ),
    ]
