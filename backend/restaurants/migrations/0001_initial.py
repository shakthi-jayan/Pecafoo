

import django.core.validators
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
            name='MenuCategory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(blank=True, max_length=255)),
                ('image', models.ImageField(blank=True, null=True, upload_to='restaurants/categories/')),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'menu category',
                'verbose_name_plural': 'menu categories',
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='Restaurant',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(db_index=True, max_length=200)),
                ('slug', models.SlugField(max_length=200, unique=True)),
                ('description', models.TextField(blank=True)),
                ('cuisine_type', models.CharField(blank=True, help_text="Comma-separated cuisine types, e.g. 'Indian, Chinese, Italian'.", max_length=200)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='restaurants/logos/')),
                ('cover_image', models.ImageField(blank=True, null=True, upload_to='restaurants/covers/')),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('address', models.TextField()),
                ('city', models.CharField(db_index=True, max_length=100)),
                ('state', models.CharField(max_length=100)),
                ('pincode', models.CharField(max_length=10)),
                ('latitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('longitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('opening_time', models.TimeField(blank=True, null=True)),
                ('closing_time', models.TimeField(blank=True, null=True)),
                ('is_open', models.BooleanField(default=False, help_text='Whether the restaurant is currently accepting orders.')),
                ('average_delivery_time', models.PositiveIntegerField(default=30, help_text='Average delivery time in minutes.')),
                ('minimum_order_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=8)),
                ('delivery_fee', models.DecimalField(decimal_places=2, default=0.0, max_digits=6)),
                ('average_rating', models.DecimalField(decimal_places=2, default=0.0, max_digits=3, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(5)])),
                ('total_ratings', models.PositiveIntegerField(default=0)),
                ('approval_status', models.CharField(choices=[('pending', 'Pending Approval'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('suspended', 'Suspended')], db_index=True, default='pending', max_length=20)),
                ('is_featured', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='restaurants', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'restaurant',
                'verbose_name_plural': 'restaurants',
                'ordering': ['-is_featured', '-average_rating'],
            },
        ),
        migrations.CreateModel(
            name='MenuItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(db_index=True, max_length=200)),
                ('description', models.TextField(blank=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='restaurants/items/')),
                ('food_type', models.CharField(choices=[('veg', 'Vegetarian'), ('non_veg', 'Non-Vegetarian'), ('vegan', 'Vegan'), ('egg', 'Contains Egg')], default='veg', max_length=10)),
                ('price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('discount_price', models.DecimalField(blank=True, decimal_places=2, help_text='Discounted price (leave blank for no discount).', max_digits=8, null=True)),
                ('is_available', models.BooleanField(default=True)),
                ('is_bestseller', models.BooleanField(default=False)),
                ('calories', models.PositiveIntegerField(blank=True, null=True)),
                ('preparation_time', models.PositiveIntegerField(default=15, help_text='Preparation time in minutes.')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='items', to='restaurants.menucategory')),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='menu_items', to='restaurants.restaurant')),
            ],
            options={
                'verbose_name': 'menu item',
                'verbose_name_plural': 'menu items',
                'ordering': ['-is_bestseller', 'name'],
            },
        ),
        migrations.AddField(
            model_name='menucategory',
            name='restaurant',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='categories', to='restaurants.restaurant'),
        ),
        migrations.AlterUniqueTogether(
            name='menucategory',
            unique_together={('restaurant', 'name')},
        ),
    ]
