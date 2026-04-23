from django.db import migrations, models
import random


def populate_delivery_otps(apps, schema_editor):
    Order = apps.get_model("orders", "Order")
    for order in Order.objects.all().only("id", "delivery_otp"):
        if not order.delivery_otp:
            order.delivery_otp = f"{random.randint(1000, 9999)}"
            order.save(update_fields=["delivery_otp"])


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0002_add_performance_indexes"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="delivery_otp",
            field=models.CharField(blank=True, db_index=True, max_length=6),
        ),
        migrations.AddField(
            model_name="order",
            name="delivery_otp_verified_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(populate_delivery_otps, migrations.RunPython.noop),
    ]
