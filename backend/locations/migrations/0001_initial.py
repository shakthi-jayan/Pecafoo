

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
            name='ServiceArea',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('boundary', models.JSONField(help_text='GeoJSON Polygon defining the service boundary')),
                ('is_active', models.BooleanField(default=True)),
                ('center_latitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('center_longitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('zoom_level', models.IntegerField(default=13)),
                ('max_delivery_radius_km', models.DecimalField(decimal_places=2, default=10.0, help_text='Maximum delivery distance in kilometers', max_digits=5)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='DeliveryRoute',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('origin_latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('origin_longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('origin_label', models.CharField(blank=True, default='', max_length=200)),
                ('destination_latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('destination_longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('destination_label', models.CharField(blank=True, default='', max_length=200)),
                ('polyline', models.TextField(blank=True, default='', help_text='Encoded polyline or GeoJSON LineString')),
                ('route_geojson', models.JSONField(blank=True, help_text='Full GeoJSON LineString of the route', null=True)),
                ('distance_meters', models.IntegerField(default=0)),
                ('duration_seconds', models.IntegerField(default=0)),
                ('waypoints', models.JSONField(blank=True, help_text='List of turn-by-turn waypoint coordinates', null=True)),
                ('estimated_arrival', models.DateTimeField(blank=True, null=True)),
                ('last_eta_update', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='route', to='orders.order')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='LocationHistory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('speed', models.DecimalField(blank=True, decimal_places=2, help_text='Speed in km/h', max_digits=6, null=True)),
                ('heading', models.DecimalField(blank=True, decimal_places=2, help_text='Bearing in degrees', max_digits=5, null=True)),
                ('accuracy', models.DecimalField(blank=True, decimal_places=2, help_text='GPS accuracy in meters', max_digits=8, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('delivery_partner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='location_history', to=settings.AUTH_USER_MODEL)),
                ('order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='location_history', to='orders.order')),
            ],
            options={
                'ordering': ['-timestamp'],
                'indexes': [models.Index(fields=['delivery_partner', '-timestamp'], name='locations_l_deliver_b01b75_idx'), models.Index(fields=['order', '-timestamp'], name='locations_l_order_i_661528_idx')],
            },
        ),
    ]
