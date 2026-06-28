"""
Accounts — Serializers
========================
Serializers for user registration, login, Firebase auth,
profile management, and token handling.
"""

from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from config.media_utils import SmartImageField
from accounts.phone_utils import normalize_phone_number

User = get_user_model()




class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for user data."""

    full_name = serializers.ReadOnlyField()
    avatar = SmartImageField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "avatar",
            "is_verified",
            "date_joined",
        ]
        read_only_fields = ["id", "email", "role", "date_joined"]




class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles email/password registration.
    Returns JWT tokens upon successful registration.
    Normalizes phone number to E.164 format before validation.
    """

    email = serializers.EmailField(
        help_text="Primary email address used for login."
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        help_text="Must be at least 8 characters.",
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        help_text="Must match the password field.",
    )
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        default=User.Role.CUSTOMER,
        help_text="User role: customer, restaurant, delivery, or admin.",
    )

    class Meta:
        model = User
        fields = [
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
            "role",
        ]

    def validate_email(self, value):
        """Return email in lowercase."""
        return value.lower()

    def validate_phone_number(self, value):
        """Normalize phone number."""
        if not value:
            return value
        from accounts.phone_utils import normalize_phone_number
        return normalize_phone_number(value)

    def validate(self, attrs):
        """Ensure passwords match and validate role and identity reuse."""
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )

        phone_number = attrs.get("phone_number")

        if phone_number and User.objects.filter(phone_number=phone_number).exists():
            raise serializers.ValidationError(
                {
                    "phone_number": "This mobile number is already linked to another account."
                }
            )

        requested_role = attrs.get("role", User.Role.CUSTOMER)
        request = self.context.get("request")
        admin_exists = User.objects.filter(role=User.Role.ADMIN).exists()
        is_bootstrap_admin = requested_role == User.Role.ADMIN and not admin_exists
        is_authorized_admin_creator = (
            requested_role == User.Role.ADMIN
            and request is not None
            and getattr(request.user, "is_authenticated", False)
            and request.user.role == User.Role.ADMIN
        )

        if requested_role == User.Role.ADMIN and not (is_bootstrap_admin or is_authorized_admin_creator):
            raise serializers.ValidationError(
                {"role": "Admin registration is restricted. An existing admin must create new admin accounts."}
            )
        return attrs

    def create(self, validated_data):
        """Create user and customer profile if applicable."""
        password = validated_data.pop("password")
        role = validated_data.get("role", User.Role.CUSTOMER)

        user = User.objects.create_user(password=password, **validated_data)
        if role == User.Role.ADMIN and not user.is_staff:
            user.is_staff = True
            user.is_verified = True
            user.save(update_fields=["is_staff", "is_verified"])

        if role == User.Role.CUSTOMER:
            from customers.models import CustomerProfile
            CustomerProfile.objects.create(user=user)

        return user




class LoginSerializer(serializers.Serializer):
    """
    Email + password login.
    Returns JWT access and refresh tokens.
    """

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )

    def validate(self, attrs):
        email = attrs.get("email", "").lower()
        password = attrs.get("password")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "No account found with this email."}
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                {"password": "Incorrect password."}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"email": "This account has been deactivated."}
            )

        attrs["user"] = user
        return attrs




class FirebaseAuthSerializer(serializers.Serializer):
    """
    Handles Firebase ID token verification for Google / social login.
    Creates a local user if one doesn't exist, then returns JWT tokens.
    Normalizes phone number if provided.
    """

    firebase_token = serializers.CharField(
        help_text="Firebase ID token from the frontend client."
    )
    phone_number = serializers.CharField(
        max_length=32,
        required=False,
        allow_blank=True,
        help_text="Optional phone number in any Indian format."
    )
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        default=User.Role.CUSTOMER,
        required=False,
        help_text="Role to assign if creating a new user.",
    )

    def validate_phone_number(self, value):
        """Normalize phone number if provided."""
        if not value:
            return None
        return normalize_phone_number(value)

    def validate_role(self, value):
        request = self.context.get("request")
        admin_exists = User.objects.filter(role=User.Role.ADMIN).exists()
        is_bootstrap_admin = value == User.Role.ADMIN and not admin_exists
        is_authorized_admin_creator = (
            value == User.Role.ADMIN
            and request is not None
            and getattr(request.user, "is_authenticated", False)
            and request.user.role == User.Role.ADMIN
        )
        if value == User.Role.ADMIN and not (is_bootstrap_admin or is_authorized_admin_creator):
            raise serializers.ValidationError("Admin social sign-in is restricted.")
        return value


class PhoneOTPRequestSerializer(serializers.Serializer):
    """Request OTP for phone-based authentication."""
    phone_number = serializers.CharField(max_length=32)

    def validate_phone_number(self, value):
        """Normalize phone number."""
        return normalize_phone_number(value)


class PhoneOTPVerifySerializer(serializers.Serializer):
    """Verify OTP and optionally create/get user."""
    phone_number = serializers.CharField(max_length=32)
    otp = serializers.CharField(min_length=4, max_length=6)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_phone_number(self, value):
        """Normalize phone number."""
        return normalize_phone_number(value)

    def validate(self, attrs):
        phone_number = attrs.get("phone_number", "").strip()
        otp = attrs.get("otp", "").strip()
        cached_otp = cache.get(f"phone_otp:{phone_number}")
        if not cached_otp:
            raise serializers.ValidationError({"otp": "OTP expired or not requested."})
        if str(cached_otp) != otp:
            raise serializers.ValidationError({"otp": "Invalid OTP."})
        attrs["phone_number"] = phone_number
        attrs["otp"] = otp
        return attrs




class TokenResponseSerializer(serializers.Serializer):
    """Serializer for JWT token response."""

    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()




class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Allows users to update their own profile fields."""

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "avatar",
        ]

    def validate_phone_number(self, value):
        """Normalize phone number if provided."""
        if not value:
            return value
        
        normalized = normalize_phone_number(value)
        
        # Check for duplicates, excluding the current user
        current_user = self.instance
        if current_user and User.objects.filter(
            phone_number=normalized
        ).exclude(id=current_user.id).exists():
            raise serializers.ValidationError(
                "This mobile number is already linked to an existing Pecafoo account. Please sign in instead."
            )
        return normalized




class ChangePasswordSerializer(serializers.Serializer):
    """Handles password change for authenticated users."""

    old_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    confirm_new_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError(
                {"confirm_new_password": "New passwords do not match."}
            )
        return attrs

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value




class ForgotPasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()


class ForgotPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=4, max_length=6)
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    confirm_new_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )

    def validate_email(self, value):
        return value.lower()

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError(
                {"confirm_new_password": "New passwords do not match."}
            )

        email = attrs.get("email", "").strip().lower()
        otp = attrs.get("otp", "").strip()
        
        cached_otp = cache.get(f"password_reset_otp:{email}")
        if not cached_otp:
            raise serializers.ValidationError({"otp": "OTP expired or not requested."})
        if str(cached_otp) != otp:
            raise serializers.ValidationError({"otp": "Invalid OTP."})
            
        return attrs
