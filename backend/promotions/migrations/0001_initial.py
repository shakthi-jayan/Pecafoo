

import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('orders', '0003_order_delivery_otp'),
        ('restaurants', '0003_restaurant_documents'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Promotion',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('code', models.CharField(db_index=True, max_length=30, unique=True)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('discount_type', models.CharField(choices=[('percentage', 'Percentage'), ('flat', 'Flat Amount')], default='percentage', max_length=20)),
                ('discount_value', models.DecimalField(decimal_places=2, help_text='Percentage (0-100) or flat amount depending on type.', max_digits=10)),
                ('max_discount', models.DecimalField(blank=True, decimal_places=2, help_text='Cap on discount amount for percentage-based promos.', max_digits=10, null=True)),
                ('min_order_amount', models.DecimalField(decimal_places=2, default=0, help_text='Minimum order subtotal required to use this promo.', max_digits=10)),
                ('scope', models.CharField(choices=[('platform', 'Platform-wide'), ('restaurant', 'Specific Restaurant')], default='platform', max_length=20)),
                ('usage_limit', models.PositiveIntegerField(default=0, help_text='0 = unlimited.')),
                ('usage_count', models.PositiveIntegerField(default=0)),
                ('per_user_limit', models.PositiveIntegerField(default=1, help_text='Max uses per individual user.')),
                ('start_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('expiry_date', models.DateTimeField()),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('restaurant', models.ForeignKey(blank=True, help_text="Only set if scope is 'restaurant'.", null=True, on_delete=django.db.models.deletion.CASCADE, related_name='promotions', to='restaurants.restaurant')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='PromotionUsage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('discount_applied', models.DecimalField(decimal_places=2, max_digits=10)),
                ('used_at', models.DateTimeField(auto_now_add=True)),
                ('order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='promotion_usage', to='orders.order')),
                ('promotion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='usages', to='promotions.promotion')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='promotion_usages', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-used_at'],
            },
        ),
        migrations.AddIndex(
            model_name='promotion',
            index=models.Index(fields=['code'], name='idx_promo_code'),
        ),
        migrations.AddIndex(
            model_name='promotion',
            index=models.Index(fields=['is_active', 'expiry_date'], name='idx_promo_active'),
        ),
        migrations.AddIndex(
            model_name='promotionusage',
            index=models.Index(fields=['promotion', 'user'], name='idx_promo_usage_user'),
        ),
    ]
