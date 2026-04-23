"""
Customers — Models
====================
Customer profile and delivery address management.
"""

import uuid
from django.conf import settings
from django.db import models


class CustomerProfile(models.Model):
    """
    Extended profile for users with the 'customer' role.
    Created automatically when a customer registers or on first access.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )

    
    preferred_cuisine = models.CharField(
        max_length=100,
        blank=True,
        help_text="Comma-separated list of preferred cuisines.",
    )
    dietary_preference = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ("none", "No Preference"),
            ("vegetarian", "Vegetarian"),
            ("vegan", "Vegan"),
            ("non_vegetarian", "Non-Vegetarian"),
            ("eggetarian", "Eggetarian"),
        ],
        default="none",
    )

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "customer profile"
        verbose_name_plural = "customer profiles"

    def __str__(self):
        return f"Profile: {self.user.email}"


class Address(models.Model):
    """
    Delivery addresses for customers.
    A customer can have multiple addresses with one set as default.
    """

    class AddressType(models.TextChoices):
        HOME = "home", "Home"
        WORK = "work", "Work"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
    )

    
    address_type = models.CharField(
        max_length=10,
        choices=AddressType.choices,
        default=AddressType.HOME,
    )
    label = models.CharField(
        max_length=100,
        blank=True,
        help_text="Custom label like 'Mom's House'.",
    )
    full_address = models.TextField(help_text="Complete street address.")
    landmark = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    
    is_default = models.BooleanField(default=False)

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "address"
        verbose_name_plural = "addresses"
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.address_type}: {self.full_address[:50]}"

    def save(self, *args, **kwargs):
        """Ensure only one default address per user."""
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(
                is_default=False
            )
        super().save(*args, **kwargs)


class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist",
    )
    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="wishlisted_by",
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "restaurant")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.user.email} - {self.restaurant.name}"


class FoodWishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="food_wishlist",
    )
    menu_item = models.ForeignKey(
        "restaurants.MenuItem",
        on_delete=models.CASCADE,
        related_name="wishlisted_by",
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "menu_item")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.user.email} - {self.menu_item.name}"


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )
    items = models.JSONField(default=list, help_text="Cart items as JSON array")
    restaurant = models.JSONField(null=True, blank=True, help_text="Selected restaurant info")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        count = len(self.items) if self.items else 0
        return f"Cart for {self.user.email} ({count} items)"
