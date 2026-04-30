

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("orders", "0001_initial"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["customer", "-placed_at"], name="idx_order_customer_date"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["customer", "status"], name="idx_order_customer_status"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["restaurant", "status"], name="idx_order_restaurant_status"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["restaurant", "-placed_at"], name="idx_order_restaurant_date"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["delivery_partner", "status"], name="idx_order_delivery_status"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["delivery_partner", "-placed_at"], name="idx_order_delivery_date"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["status", "delivery_partner"], name="idx_order_avail_delivery"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["payment_status"], name="idx_order_payment_status"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["-placed_at"], name="idx_order_placed_at"),
        ),
    ]
