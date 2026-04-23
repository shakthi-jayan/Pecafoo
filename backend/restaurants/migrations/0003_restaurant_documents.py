from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0002_add_performance_indexes"),
    ]

    operations = [
        migrations.AddField(
            model_name="restaurant",
            name="business_license",
            field=models.FileField(blank=True, null=True, upload_to="restaurants/documents/licenses/"),
        ),
        migrations.AddField(
            model_name="restaurant",
            name="food_safety_certificate",
            field=models.FileField(blank=True, null=True, upload_to="restaurants/documents/food_safety/"),
        ),
        migrations.AddField(
            model_name="restaurant",
            name="owner_id_proof",
            field=models.FileField(blank=True, null=True, upload_to="restaurants/documents/owner_ids/"),
        ),
    ]
