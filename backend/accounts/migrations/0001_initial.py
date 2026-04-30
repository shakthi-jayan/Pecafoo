

import django.utils.timezone
import phonenumber_field.modelfields
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the user.', primary_key=True, serialize=False)),
                ('email', models.EmailField(db_index=True, help_text='Primary email address used for login.', max_length=254, unique=True)),
                ('phone_number', phonenumber_field.modelfields.PhoneNumberField(blank=True, help_text='Phone number in E.164 format, e.g. +919876543210.', max_length=128, null=True, region=None, unique=True)),
                ('first_name', models.CharField(blank=True, max_length=150)),
                ('last_name', models.CharField(blank=True, max_length=150)),
                ('role', models.CharField(choices=[('customer', 'Customer'), ('restaurant', 'Restaurant Owner'), ('delivery', 'Delivery Partner'), ('admin', 'Admin')], db_index=True, default='customer', help_text='Determines what the user can access in the platform.', max_length=20)),
                ('firebase_uid', models.CharField(blank=True, db_index=True, help_text='Firebase Auth UID for social login users.', max_length=128, null=True, unique=True)),
                ('avatar', models.ImageField(blank=True, help_text='User profile picture.', null=True, upload_to='avatars/')),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_verified', models.BooleanField(default=False, help_text='Whether the user has verified their email or phone.')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'ordering': ['-date_joined'],
            },
        ),
    ]
