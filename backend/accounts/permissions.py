"""
Accounts — Custom DRF Permission Classes
==========================================
Role-based permission classes for the food delivery platform.
Each view can specify which roles are allowed to access it.
"""

from rest_framework.permissions import BasePermission
from accounts.utils import get_active_roles


class IsCustomer(BasePermission):
    """Allow access only to users with the 'customer' role."""

    message = "Only customers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and "customer" in get_active_roles(request.user)
        )


class IsRestaurantOwner(BasePermission):
    """Allow access only to users with the 'restaurant' role."""

    message = "Only restaurant owners can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and "restaurant" in get_active_roles(request.user)
        )


class IsDeliveryPartner(BasePermission):
    """Allow access only to users with the 'delivery' role."""

    message = "Only delivery partners can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and "delivery" in get_active_roles(request.user)
        )


class IsAdmin(BasePermission):
    """Allow access only to users with the 'admin' role."""

    message = "Only admins can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and "admin" in get_active_roles(request.user)
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
            and "admin" in get_active_roles(request.user)
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: Allow access to the object owner or admin.
    The target object must have a `user` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated and "admin" in get_active_roles(request.user):
            return True
        
        owner = getattr(obj, "user", None) or getattr(obj, "owner", None)
        return owner == request.user


class IsCustomerOrRestaurant(BasePermission):
    """Allow access to both customers and restaurant owners."""

    message = "Only customers and restaurant owners can perform this action."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        roles = get_active_roles(request.user)
        return "customer" in roles or "restaurant" in roles
