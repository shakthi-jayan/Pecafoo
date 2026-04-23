from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("delivery", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="deliverypartnerprofile",
            name="id_proof",
            field=models.FileField(blank=True, null=True, upload_to="delivery/id_proofs/"),
        ),
        migrations.AlterField(
            model_name="deliverypartnerprofile",
            name="license_image",
            field=models.FileField(blank=True, null=True, upload_to="delivery/licenses/"),
        ),
    ]
