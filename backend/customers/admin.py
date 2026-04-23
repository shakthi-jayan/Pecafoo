from django.contrib import admin
from customers.models import Address, CustomerProfile


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "dietary_preference", "created_at"]
    search_fields = ["user__email", "user__first_name"]
    list_filter = ["dietary_preference"]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["user", "address_type", "city", "is_default", "created_at"]
    search_fields = ["user__email", "full_address", "city"]
    list_filter = ["address_type", "is_default", "city"]
