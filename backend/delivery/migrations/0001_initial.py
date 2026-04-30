

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('orders', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DeliveryEarning',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=8)),
                ('tip', models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ('total', models.DecimalField(decimal_places=2, max_digits=8)),
                ('earned_at', models.DateTimeField(auto_now_add=True)),
                ('delivery_partner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='earnings', to=settings.AUTH_USER_MODEL)),
                ('order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='delivery_earning', to='orders.order')),
            ],
            options={
                'verbose_name': 'delivery earning',
                'verbose_name_plural': 'delivery earnings',
                'ordering': ['-earned_at'],
            },
        ),
        migrations.CreateModel(
            name='DeliveryLocationLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('delivery_partner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='location_logs', to=settings.AUTH_USER_MODEL)),
                ('order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='delivery_locations', to='orders.order')),
            ],
            options={
                'verbose_name': 'delivery location log',
                'verbose_name_plural': 'delivery location logs',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='DeliveryPartnerProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('vehicle_type', models.CharField(choices=[('bicycle', 'Bicycle'), ('motorcycle', 'Motorcycle'), ('scooter', 'Scooter'), ('car', 'Car')], default='motorcycle', max_length=20)),
                ('vehicle_number', models.CharField(blank=True, max_length=20)),
                ('license_number', models.CharField(blank=True, max_length=50)),
                ('is_verified', models.BooleanField(default=False, help_text='Admin-approved verification status.')),
                ('id_proof', models.ImageField(blank=True, null=True, upload_to='delivery/id_proofs/')),
                ('license_image', models.ImageField(blank=True, null=True, upload_to='delivery/licenses/')),
                ('is_available', models.BooleanField(default=False, help_text='Whether the partner is currently accepting deliveries.')),
                ('current_latitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('current_longitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('last_location_update', models.DateTimeField(blank=True, null=True)),
                ('total_deliveries', models.PositiveIntegerField(default=0)),
                ('average_rating', models.DecimalField(decimal_places=2, default=0.0, max_digits=3)),
                ('total_earnings', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='delivery_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'delivery partner profile',
                'verbose_name_plural': 'delivery partner profiles',
            },
        ),
    ]
