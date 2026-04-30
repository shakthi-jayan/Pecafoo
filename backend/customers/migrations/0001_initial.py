

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
            name='Address',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('address_type', models.CharField(choices=[('home', 'Home'), ('work', 'Work'), ('other', 'Other')], default='home', max_length=10)),
                ('label', models.CharField(blank=True, help_text="Custom label like 'Mom's House'.", max_length=100)),
                ('full_address', models.TextField(help_text='Complete street address.')),
                ('landmark', models.CharField(blank=True, max_length=255)),
                ('city', models.CharField(max_length=100)),
                ('state', models.CharField(max_length=100)),
                ('pincode', models.CharField(max_length=10)),
                ('latitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('longitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('is_default', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='addresses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'address',
                'verbose_name_plural': 'addresses',
                'ordering': ['-is_default', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='CustomerProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('preferred_cuisine', models.CharField(blank=True, help_text='Comma-separated list of preferred cuisines.', max_length=100)),
                ('dietary_preference', models.CharField(blank=True, choices=[('none', 'No Preference'), ('vegetarian', 'Vegetarian'), ('vegan', 'Vegan'), ('non_vegetarian', 'Non-Vegetarian'), ('eggetarian', 'Eggetarian')], default='none', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='customer_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'customer profile',
                'verbose_name_plural': 'customer profiles',
            },
        ),
    ]
