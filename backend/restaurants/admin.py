from django.contrib import admin
from restaurants.models import MenuCategory, MenuItem, Restaurant


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = [
        "name", "owner", "city", "approval_status",
        "is_open", "average_rating", "is_featured",
    ]
    list_filter = ["approval_status", "is_open", "is_featured", "city"]
    search_fields = ["name", "owner__email", "city"]
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ["approval_status", "is_featured"]


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "restaurant", "sort_order", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "restaurant__name"]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = [
        "name", "restaurant", "category", "price",
        "food_type", "is_available", "is_bestseller",
    ]
    list_filter = ["food_type", "is_available", "is_bestseller"]
    search_fields = ["name", "restaurant__name"]
