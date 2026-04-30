

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notification_type', models.CharField(choices=[('order_placed', 'Order Placed'), ('order_confirmed', 'Order Confirmed'), ('order_preparing', 'Order Being Prepared'), ('order_ready', 'Order Ready'), ('order_picked_up', 'Order Picked Up'), ('order_delivered', 'Order Delivered'), ('order_cancelled', 'Order Cancelled'), ('new_order', 'New Order (Restaurant)'), ('delivery_assigned', 'Delivery Assigned'), ('promotion', 'Promotion'), ('system', 'System Notification')], db_index=True, default='system', max_length=30)),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('channel', models.CharField(choices=[('in_app', 'In-App'), ('push', 'Push Notification'), ('email', 'Email'), ('sms', 'SMS')], default='in_app', max_length=10)),
                ('related_order_id', models.UUIDField(blank=True, null=True)),
                ('is_read', models.BooleanField(default=False)),
                ('is_sent', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'notification',
                'verbose_name_plural': 'notifications',
                'ordering': ['-created_at'],
            },
        ),
    ]
