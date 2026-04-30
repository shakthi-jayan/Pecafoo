

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('restaurants', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('order_number', models.CharField(db_index=True, help_text='Human-readable order number like PF-20260228-001.', max_length=20, unique=True)),
                ('status', models.CharField(choices=[('placed', 'Order Placed'), ('confirmed', 'Confirmed by Restaurant'), ('preparing', 'Being Prepared'), ('ready', 'Ready for Pickup'), ('picked_up', 'Picked Up by Delivery'), ('on_the_way', 'On the Way'), ('delivered', 'Delivered'), ('cancelled', 'Cancelled')], db_index=True, default='placed', max_length=20)),
                ('special_instructions', models.TextField(blank=True)),
                ('delivery_address', models.TextField()),
                ('delivery_latitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('delivery_longitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('subtotal', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('delivery_fee', models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ('tax', models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ('discount', models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ('total', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('payment_status', models.CharField(choices=[('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed'), ('refunded', 'Refunded')], default='pending', max_length=20)),
                ('payment_method', models.CharField(choices=[('cod', 'Cash on Delivery'), ('razorpay', 'Razorpay'), ('stripe', 'Stripe'), ('wallet', 'Wallet')], default='cod', max_length=20)),
                ('payment_id', models.CharField(blank=True, help_text='Payment gateway transaction ID.', max_length=255)),
                ('placed_at', models.DateTimeField(auto_now_add=True)),
                ('confirmed_at', models.DateTimeField(blank=True, null=True)),
                ('prepared_at', models.DateTimeField(blank=True, null=True)),
                ('picked_up_at', models.DateTimeField(blank=True, null=True)),
                ('delivered_at', models.DateTimeField(blank=True, null=True)),
                ('cancelled_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('rating', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('review', models.TextField(blank=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='customer_orders', to=settings.AUTH_USER_MODEL)),
                ('delivery_partner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='delivery_orders', to=settings.AUTH_USER_MODEL)),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='restaurant_orders', to='restaurants.restaurant')),
            ],
            options={
                'verbose_name': 'order',
                'verbose_name_plural': 'orders',
                'ordering': ['-placed_at'],
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('item_name', models.CharField(max_length=200)),
                ('item_price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('special_note', models.CharField(blank=True, max_length=255)),
                ('menu_item', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='order_items', to='restaurants.menuitem')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order')),
            ],
            options={
                'verbose_name': 'order item',
                'verbose_name_plural': 'order items',
            },
        ),
    ]
