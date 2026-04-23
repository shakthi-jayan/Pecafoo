

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0001_initial"),
    ]

    operations = [
        
        migrations.AddIndex(
            model_name="restaurant",
            index=models.Index(fields=["approval_status", "is_active"], name="idx_rest_approval_active"),
        ),
        migrations.AddIndex(
            model_name="restaurant",
            index=models.Index(fields=["owner"], name="idx_rest_owner"),
        ),
        migrations.AddIndex(
            model_name="restaurant",
            index=models.Index(fields=["city", "is_open"], name="idx_rest_city_open"),
        ),
        migrations.AddIndex(
            model_name="restaurant",
            index=models.Index(fields=["-is_featured", "-average_rating"], name="idx_rest_featured_rating"),
        ),
        
        migrations.AddIndex(
            model_name="menuitem",
            index=models.Index(fields=["restaurant", "is_available"], name="idx_menu_rest_avail"),
        ),
        migrations.AddIndex(
            model_name="menuitem",
            index=models.Index(fields=["is_available", "food_type"], name="idx_menu_avail_type"),
        ),
        migrations.AddIndex(
            model_name="menuitem",
            index=models.Index(fields=["price"], name="idx_menu_price"),
        ),
    ]
