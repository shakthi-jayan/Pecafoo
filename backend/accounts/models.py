"""
Accounts — Custom User Model
==============================
A role-based user model supporting customers, restaurant owners,
delivery partners, and admins. Uses email as the primary identifier.
"""

import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField

from accounts.managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model with role-based access control.
    Email is the unique identifier for authentication.
    """

    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        RESTAURANT = "restaurant", "Restaurant Owner"
        DELIVERY = "delivery", "Delivery Partner"
        ADMIN = "admin", "Admin"

    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the user.",
    )

    
    email = models.EmailField(
        unique=True,
        db_index=True,
        help_text="Primary email address used for login.",
    )
    phone_number = PhoneNumberField(
        blank=True,
        null=True,
        unique=True,
        help_text="Phone number in E.164 format, e.g. +919876543210.",
    )
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        db_index=True,
        help_text="Determines what the user can access in the platform.",
    )

    
    firebase_uid = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        unique=True,
        db_index=True,
        help_text="Firebase Auth UID for social login users.",
    )
    fcm_token = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Firebase Cloud Messaging token for push notifications.",
    )

    
    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
        help_text="User profile picture.",
    )

    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether the user has verified their email or phone.",
    )

    
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    
    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.email

