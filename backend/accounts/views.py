"""
Accounts — API Views
======================
Handles registration, login (email/password), Firebase social login,
profile management, password change, and token refresh/logout.
"""

import logging
import random
import secrets

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.permissions import IsAdmin
from accounts.firebase_auth import verify_firebase_token
from accounts.serializers import (
    ChangePasswordSerializer,
    FirebaseAuthSerializer,
    LoginSerializer,
    PhoneOTPRequestSerializer,
    PhoneOTPVerifySerializer,
    RegisterSerializer,
    TokenResponseSerializer,
    ForgotPasswordRequestSerializer,
    ForgotPasswordResetSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


def _get_tokens_for_user(user) -> dict:
    """Generate JWT access and refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }





class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user with email and password.
    Returns JWT tokens and user data.
    """

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        tokens = _get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        return Response(
            {
                "message": "Registration successful.",
                "tokens": tokens,
                "user": user_data,
            },
            status=status.HTTP_201_CREATED,
        )





class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticate with email and password.
    Returns JWT tokens and user data.
    """

    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        tokens = _get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        return Response(
            {
                "message": "Login successful.",
                "tokens": tokens,
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )





class FirebaseAuthView(APIView):
    """
    POST /api/auth/firebase/
    Verify a Firebase ID token (from Google login etc.),
    create or retrieve the local user, and return JWT tokens.
    """

    permission_classes = [AllowAny]
    serializer_class = FirebaseAuthSerializer

    def post(self, request):
        serializer = FirebaseAuthSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        firebase_token = serializer.validated_data["firebase_token"]
        requested_role = serializer.validated_data.get("role", User.Role.CUSTOMER)

        
        decoded = verify_firebase_token(firebase_token)
        if decoded is None:
            return Response(
                {"error": "Invalid or expired Firebase token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        firebase_uid = decoded.get("uid")
        email = decoded.get("email", "")
        name = decoded.get("name", "")
        picture = decoded.get("picture", "")

        if not email:
            return Response(
                {"error": "Email not found in Firebase token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        name_parts = name.split(" ", 1) if name else ["", ""]
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        
        user = None
        is_new_user = False

        
        try:
            user = User.objects.get(firebase_uid=firebase_uid)
        except User.DoesNotExist:
            pass

        
        if user is None:
            try:
                user = User.objects.get(email=email)
                
                user.firebase_uid = firebase_uid
                user.save(update_fields=["firebase_uid"])
            except User.DoesNotExist:
                pass

        
        if user is None:
            user = User.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                firebase_uid=firebase_uid,
                role=requested_role,
                is_verified=True,  
            )
            is_new_user = True
            logger.info(f"New user created via Firebase: {email}")
        else:
            updated_fields = []
            if not user.firebase_uid:
                user.firebase_uid = firebase_uid
                updated_fields.append("firebase_uid")
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                updated_fields.append("first_name")
            if last_name and user.last_name != last_name:
                user.last_name = last_name
                updated_fields.append("last_name")
            firebase_phone = decoded.get("phone_number")
            if firebase_phone and not user.phone_number:
                user.phone_number = firebase_phone
                updated_fields.append("phone_number")
            if not user.is_verified:
                user.is_verified = True
                updated_fields.append("is_verified")
            if updated_fields:
                user.save(update_fields=updated_fields)

        tokens = _get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        return Response(
            {
                "message": "Authentication successful.",
                "is_new_user": is_new_user,
                "tokens": tokens,
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )


class PhoneOTPRequestView(APIView):
    """
    POST /api/auth/phone/request-otp/
    Generate a short-lived OTP for phone-based customer sign-in.
    In DEBUG, the OTP is returned in the response for local testing.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PhoneOTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"].strip()
        otp = f"{random.randint(100000, 999999)}"
        cache.set(f"phone_otp:{phone_number}", otp, timeout=300)

        response_data = {
            "message": "OTP generated successfully.",
            "phone_number": phone_number,
        }
        if settings.DEBUG:
            response_data["otp"] = otp

        return Response(response_data, status=status.HTTP_200_OK)


class PhoneOTPVerifyView(APIView):
    """
    POST /api/auth/phone/verify-otp/
    Verify phone OTP and create/login a customer account.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PhoneOTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]
        first_name = serializer.validated_data.get("first_name", "").strip()
        last_name = serializer.validated_data.get("last_name", "").strip()

        try:
            user = User.objects.get(phone_number=phone_number)
            is_new_user = False
        except User.DoesNotExist:
            digits_only = "".join(ch for ch in phone_number if ch.isdigit()) or "customer"
            synthetic_email = f"{digits_only}@phone.pecafoo.local"
            counter = 1
            while User.objects.filter(email=synthetic_email).exists():
                counter += 1
                synthetic_email = f"{digits_only}-{counter}@phone.pecafoo.local"

            user = User.objects.create_user(
                email=synthetic_email,
                phone_number=phone_number,
                first_name=first_name or "Pecafoo",
                last_name=last_name or "Customer",
                role=User.Role.CUSTOMER,
                is_verified=True,
                password=User.objects.make_random_password(),
            )
            is_new_user = True

        updated_fields = []
        if not user.is_verified:
            user.is_verified = True
            updated_fields.append("is_verified")
        if first_name and user.first_name != first_name:
            user.first_name = first_name
            updated_fields.append("first_name")
        if last_name and user.last_name != last_name:
            user.last_name = last_name
            updated_fields.append("last_name")
        if updated_fields:
            user.save(update_fields=updated_fields)

        cache.delete(f"phone_otp:{phone_number}")
        tokens = _get_tokens_for_user(user)

        return Response(
            {
                "message": "Phone verification successful.",
                "is_new_user": is_new_user,
                "tokens": tokens,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )





class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/profile/ — Get current user profile
    PATCH /api/auth/profile/ — Update profile fields
    """

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user





class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Change the password for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )





class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklist the provided refresh token to log the user out.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logout successful."},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"error": "Invalid refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UserListView(generics.ListAPIView):
    """
    GET /api/auth/users/
    List all users. Admin only.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return User.objects.all().order_by("-date_joined")





class ForgotPasswordRequestView(APIView):
    """
    POST /api/auth/forgot-password/
    Request a password reset OTP.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data["email"].strip().lower()
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            
            return Response(
                {"message": "If an account with that email exists, an OTP has been sent."},
                status=status.HTTP_200_OK
            )
            
        import secrets
        otp = str(secrets.randbelow(900000) + 100000)
        cache.set(f"password_reset_otp:{email}", otp, timeout=600)  
        
        
        
        
        from notifications.tasks import send_email_notification
        send_email_notification.delay(
            email, 
            "Pecafoo Password Reset OTP", 
            f"Your password reset OTP is {otp}. It expires in 10 minutes."
        )
        
        return Response(
            {"message": "If an account with that email exists, an OTP has been sent."},
            status=status.HTTP_200_OK
        )


class ForgotPasswordResetView(APIView):
    """
    POST /api/auth/reset-password/
    Verify OTP and reset password.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data["email"].strip().lower()
        new_password = serializer.validated_data["new_password"]
        
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid request."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        cache.delete(f"password_reset_otp:{email}")
        
        return Response(
            {"message": "Password has been reset successfully."},
            status=status.HTTP_200_OK
        )





class FCMTokenRegisterView(APIView):
    """
    POST /api/auth/fcm-token/
    Register or update the user's FCM token for push notifications.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        fcm_token = request.data.get("fcm_token", "").strip()
        if not fcm_token:
            return Response(
                {"error": "fcm_token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.fcm_token = fcm_token
        request.user.save(update_fields=["fcm_token"])
        return Response({"message": "FCM token registered."}, status=status.HTTP_200_OK)

    def delete(self, request):
        request.user.fcm_token = None
        request.user.save(update_fields=["fcm_token"])
        return Response({"message": "FCM token removed."}, status=status.HTTP_200_OK)





class EmailVerificationRequestView(APIView):
    """
    POST /api/auth/verify-email/request/
    Send an OTP to the user's email for verification.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_verified:
            return Response(
                {"message": "Email is already verified."},
                status=status.HTTP_200_OK,
            )

        otp = str(secrets.randbelow(900000) + 100000)
        cache.set(f"email_verify_otp:{user.email}", otp, timeout=600)

        from notifications.tasks import send_email_notification
        send_email_notification.delay(
            user.email,
            "Pecafoo Email Verification",
            f"Your email verification OTP is {otp}. It expires in 10 minutes.",
        )

        return Response(
            {"message": "Verification OTP sent to your email."},
            status=status.HTTP_200_OK,
        )


class EmailVerificationConfirmView(APIView):
    """
    POST /api/auth/verify-email/confirm/
    Verify the OTP sent to the user's email.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        otp = request.data.get("otp", "").strip()

        if not otp:
            return Response(
                {"error": "OTP is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cached_otp = cache.get(f"email_verify_otp:{user.email}")
        if not cached_otp:
            return Response(
                {"error": "OTP expired or not requested."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if str(cached_otp) != otp:
            return Response(
                {"error": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_verified = True
        user.save(update_fields=["is_verified"])
        cache.delete(f"email_verify_otp:{user.email}")

        return Response(
            {"message": "Email verified successfully."},
            status=status.HTTP_200_OK,
        )





class AccountDeletionView(APIView):
    """
    DELETE /api/auth/account/
    Permanently delete the user's account and associated data.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        password = request.data.get("password", "")
        if not password:
            return Response(
                {"error": "Password confirmation is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.check_password(password):
            return Response(
                {"error": "Incorrect password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        email = user.email
        logger.info(f"Account deletion requested by {email}")

        
        user.is_active = False
        user.fcm_token = None
        user.save(update_fields=["is_active", "fcm_token"])

        
        user.delete()

        return Response(
            {"message": "Account deleted successfully."},
            status=status.HTTP_200_OK,
        )

    def get(self, request):
        """GET /api/auth/account/ — Export user data (GDPR compliance)."""
        user = request.user
        user_data = UserSerializer(user).data

        
        from customers.models import Address
        addresses = Address.objects.filter(user=user).values(
            "address_type", "label", "full_address", "city", "state", "pincode"
        )

        
        from orders.models import Order
        orders = Order.objects.filter(customer=user).values(
            "order_number", "status", "total", "placed_at"
        )

        return Response({
            "user": user_data,
            "addresses": list(addresses),
            "orders": list(orders),
        })
