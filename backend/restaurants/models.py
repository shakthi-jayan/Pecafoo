"""
Restaurants — Models
======================
Restaurant, MenuCategory, and MenuItem models.
Supports operational hours, cuisine types, and approval workflow.
"""

import uuid
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Restaurant(models.Model):
    """
    Represents a restaurant on the platform.
    Owned by a user with the 'restaurant' role.
    Must be approved by admin before becoming visible.
    """

    class ApprovalStatus(models.TextChoices):
        PENDING = "pending", "Pending Approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        SUSPENDED = "suspended", "Suspended"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="restaurants",
    )

    
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    cuisine_type = models.CharField(
        max_length=200,
        blank=True,
        help_text="Comma-separated cuisine types, e.g. 'Indian, Chinese, Italian'.",
    )

    
    logo = models.ImageField(upload_to="restaurants/logos/", blank=True, null=True)
    cover_image = models.ImageField(
        upload_to="restaurants/covers/", blank=True, null=True
    )
    business_license = models.FileField(
        upload_to="restaurants/documents/licenses/", blank=True, null=True
    )
    food_safety_certificate = models.FileField(
        upload_to="restaurants/documents/food_safety/", blank=True, null=True
    )
    owner_id_proof = models.FileField(
        upload_to="restaurants/documents/owner_ids/", blank=True, null=True
    )

    
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    
    address = models.TextField()
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    is_open = models.BooleanField(
        default=False, help_text="Whether the restaurant is currently accepting orders."
    )
    average_delivery_time = models.PositiveIntegerField(
        default=30, help_text="Average delivery time in minutes."
    )
    minimum_order_amount = models.DecimalField(
        max_digits=8, decimal_places=2, default=0.00
    )
    delivery_fee = models.DecimalField(
        max_digits=6, decimal_places=2, default=0.00
    )

    
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    total_ratings = models.PositiveIntegerField(default=0)

    
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        db_index=True,
    )

    
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "restaurant"
        verbose_name_plural = "restaurants"
        ordering = ["-is_featured", "-average_rating"]
        indexes = [
            models.Index(fields=["approval_status", "is_active"], name="idx_rest_approval_active"),
            models.Index(fields=["owner"], name="idx_rest_owner"),
            models.Index(fields=["city", "is_open"], name="idx_rest_city_open"),
            models.Index(fields=["-is_featured", "-average_rating"], name="idx_rest_featured_rating"),
        ]

    def __str__(self):
        return self.name


class MenuCategory(models.Model):
    """
    Categories for organizing menu items (e.g. Starters, Main Course, Drinks).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.CASCADE, related_name="categories"
    )
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    image = models.ImageField(
        upload_to="restaurants/categories/", blank=True, null=True
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "menu category"
        verbose_name_plural = "menu categories"
        ordering = ["sort_order", "name"]
        unique_together = ["restaurant", "name"]

    def __str__(self):
        return f"{self.restaurant.name} — {self.name}"


class MenuItem(models.Model):
    """
    Individual food items in a restaurant's menu.
    """

    class FoodType(models.TextChoices):
        VEG = "veg", "Vegetarian"
        NON_VEG = "non_veg", "Non-Vegetarian"
        VEGAN = "vegan", "Vegan"
        EGG = "egg", "Contains Egg"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.CASCADE, related_name="menu_items"
    )
    category = models.ForeignKey(
        MenuCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="items",
    )

    
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="restaurants/items/", blank=True, null=True)
    food_type = models.CharField(
        max_length=10,
        choices=FoodType.choices,
        default=FoodType.VEG,
    )

    
    price = models.DecimalField(max_digits=8, decimal_places=2)
    discount_price = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        help_text="Discounted price (leave blank for no discount).",
    )

    
    is_available = models.BooleanField(default=True)
    is_bestseller = models.BooleanField(default=False)

    
    calories = models.PositiveIntegerField(null=True, blank=True)
    preparation_time = models.PositiveIntegerField(
        default=15, help_text="Preparation time in minutes."
    )

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "menu item"
        verbose_name_plural = "menu items"
        ordering = ["-is_bestseller", "name"]
        indexes = [
            models.Index(fields=["restaurant", "is_available"], name="idx_menu_rest_avail"),
            models.Index(fields=["is_available", "food_type"], name="idx_menu_avail_type"),
            models.Index(fields=["price"], name="idx_menu_price"),
        ]

    def __str__(self):
        return f"{self.name} — ₹{self.effective_price}"

    @property
    def effective_price(self):
        """Return discount price if available, otherwise regular price."""
        return self.discount_price if self.discount_price else self.price

    @property
    def has_discount(self):
        return self.discount_price is not None and self.discount_price < self.price
