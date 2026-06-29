"""
Accounts — Custom DRF Permission Classes
==========================================
Role-based permission classes for the food delivery platform.
Each view can specify which roles are allowed to access it.
"""

from rest_framework.permissions import BasePermission
from accounts.utils import get_active_roles

def get_current_role(request) -> str:
    if not request or not request.user or not request.user.is_authenticated:
        return ""
        
    current_role = getattr(request.user, "role", "")
    
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(auth_header.split(" ")[1])
            current_role = token.payload.get("primary_role", current_role)
        except Exception:
            pass
            
    return current_role


class IsCustomer(BasePermission):
    """Allow access only to users with the 'customer' role."""

    message = "Only customers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and get_current_role(request) == "customer"
        )


class IsRestaurantOwner(BasePermission):
    """Allow access only to users with the 'restaurant' role."""

    message = "Only restaurant owners can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and get_current_role(request) == "restaurant"
        )


class IsDeliveryPartner(BasePermission):
    """Allow access only to users with the 'delivery' role."""

    message = "Only delivery partners can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and get_current_role(request) == "delivery"
        )


class IsAdmin(BasePermission):
    """Allow access only to users with the 'admin' role."""

    message = "Only admins can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and get_current_role(request) == "admin"
        )


class IsAdminOrReadOnly(BasePermission):
    """
    Allow full access to admins, read-only access to others.
    Useful for public listings that only admins can modify.
    """

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return (
            request.user
            and request.user.is_authenticated
            and get_current_role(request) == "admin"
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: Allow access to the object owner or admin.
    The target object must have a `user` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated and get_current_role(request) == "admin":
            return True
        
        owner = getattr(obj, "user", None) or getattr(obj, "owner", None)
        return owner == request.user


class IsCustomerOrRestaurant(BasePermission):
    """Allow access to both customers and restaurant owners."""

    message = "Only customers and restaurant owners can perform this action."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        role = get_current_role(request)
        return role in ["customer", "restaurant"]
