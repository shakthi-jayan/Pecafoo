from django.contrib import admin
from orders.models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["item_name", "item_price", "quantity", "total_price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number", "customer", "restaurant", "status",
        "payment_status", "total", "placed_at",
    ]
    list_filter = ["status", "payment_status", "payment_method"]
    search_fields = ["order_number", "customer__email", "restaurant__name"]
    inlines = [OrderItemInline]
    readonly_fields = ["order_number", "placed_at"]
