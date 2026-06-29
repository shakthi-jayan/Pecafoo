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
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
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


class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)

        token["email"] = user.email
        token["primary_role"] = user.role
        
        return token

def _get_tokens_for_user(user, active_role: str = None) -> dict:
    """Generate JWT access and refresh tokens for a user."""
    refresh = CustomRefreshToken.for_user(user)
    if active_role:
        refresh["primary_role"] = active_role
        
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
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    from django.db import transaction
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        email = str(request.data.get("email", "")).lower().strip()
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if email and User.objects.filter(email=email).exists():
            return Response(
                {"code": "ACCOUNT_EXISTS", "message": "This email already belongs to an existing account."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        try:
            user = serializer.save()
        except Exception as e:
            logger.error(f"Registration failed for {email}: {e}", exc_info=True)
            return Response(
                {"error": "Registration failed due to a server error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        tokens = _get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        from accounts.utils import safe_log_auth
        safe_log_auth(request, action="REGISTER", user=user, status_code=201)

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
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        requested_role = request.data.get("role")
        
        from accounts.utils import get_owned_roles, safe_log_auth, generate_login_ticket
        owned_roles = get_owned_roles(user)
        
        if len(owned_roles) > 1:
            safe_log_auth(request, action="LOGIN_ROLE_SELECTION_REQUIRED", user=user, status_code=200)
            return Response(
                {
                    "needs_role_selection": True,
                    "login_ticket": generate_login_ticket(user),
                    "roles": owned_roles,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
            
        active_role = owned_roles[0]["id"] if owned_roles else user.role
        
        tokens = _get_tokens_for_user(user, active_role=active_role)
        user_data = UserSerializer(user).data
        
        safe_log_auth(request, action="LOGIN", user=user, status_code=200)

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
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    from django.db import transaction
    @transaction.atomic
    def post(self, request):
        serializer = FirebaseAuthSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        firebase_token = serializer.validated_data["firebase_token"]
        requested_role = serializer.validated_data.get("role", User.Role.CUSTOMER)

        logger.info("FirebaseAuthView: Verifying Firebase token...")
        decoded = verify_firebase_token(firebase_token)

        firebase_uid = decoded.get("uid")
        email = decoded.get("email", "")
        name = decoded.get("name", "")
        picture = decoded.get("picture", "")

        if not email:
            logger.warning(f"Firebase token missing email for UID: {firebase_uid}")
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
            logger.info(f"Existing Firebase user found: {email}")
        except User.DoesNotExist:
            pass

        if user is None:
            try:
                user = User.objects.get(email=email)
                user.firebase_uid = firebase_uid
                user.save(update_fields=["firebase_uid"])
                logger.info(f"Linked existing user to Firebase: {email}")
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
            logger.info(f"New user created via Firebase: {email} (role: {requested_role})")
            
            if requested_role == User.Role.CUSTOMER and not hasattr(user, "customer_profile"):
                from customers.models import CustomerProfile
                CustomerProfile.objects.create(user=user)
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
                logger.info(f"Updated Firebase user profile: {email}")

        from accounts.utils import get_owned_roles, safe_log_auth, generate_login_ticket
        owned_roles = get_owned_roles(user)
        
        if not is_new_user and len(owned_roles) > 1:
            safe_log_auth(request, action="FIREBASE_LOGIN_ROLE_SELECTION_REQUIRED", user=user, status_code=200)
            return Response(
                {
                    "needs_role_selection": True,
                    "login_ticket": generate_login_ticket(user),
                    "roles": owned_roles,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )

        active_role = owned_roles[0]["id"] if owned_roles else user.role
        
        tokens = _get_tokens_for_user(user, active_role=active_role)
        user_data = UserSerializer(user).data

        safe_log_auth(request, action="FIREBASE_AUTH", user=user, status_code=200)

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

        from accounts.utils import safe_log_auth
        safe_log_auth(request, action="OTP_REQUEST", status_code=200)

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

    from django.db import transaction
    @transaction.atomic
    def post(self, request):
        serializer = PhoneOTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]
        first_name = serializer.validated_data.get("first_name", "").strip()
        last_name = serializer.validated_data.get("last_name", "").strip()

        try:
            user = User.objects.get(phone_number=phone_number)
            is_new_user = False
            logger.info(f"Existing user found for phone: {phone_number}")
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
            logger.info(f"New phone user created: {synthetic_email}")
            
            if not hasattr(user, "customer_profile"):
                from customers.models import CustomerProfile
                CustomerProfile.objects.create(user=user)

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

        logger.info(f"Phone OTP verified: {phone_number}")

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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        from accounts.utils import get_owned_roles
        roles = get_owned_roles(instance)
        
        # Determine current_role from the JWT if possible
        auth_header = request.headers.get('Authorization')
        current_role = instance.role # Fallback
        if auth_header and auth_header.startswith('Bearer '):
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                token = AccessToken(auth_header.split(' ')[1])
                current_role = token.payload.get('primary_role', current_role)
            except:
                pass
                
        return Response({
            "user": serializer.data,
            "roles": roles,
            "current_role": current_role,
        })





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

        logger.info(f"Password changed for user: {user.email}")

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
            logger.info(f"User logged out: {request.user.email}")
            return Response(
                {"message": "Logout successful."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.warning(f"Invalid refresh token on logout: {e}")
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
            logger.info(f"Password reset requested for non-existent email: {email}")
            return Response(
                {"message": "If an account with that email exists, an OTP has been sent."},
                status=status.HTTP_200_OK
            )
            
        otp = str(secrets.randbelow(900000) + 100000)
        cache.set(f"password_reset_otp:{email}", otp, timeout=600)
        
        logger.info(f"Password reset OTP generated for: {email}")
        
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
            logger.info(f"Password reset successful for: {email}")
        except User.DoesNotExist:
            logger.warning(f"Password reset attempted for non-existent email: {email}")
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
        logger.info(f"FCM token registered for user: {request.user.email}")
        return Response({"message": "FCM token registered."}, status=status.HTTP_200_OK)

    def delete(self, request):
        request.user.fcm_token = None
        request.user.save(update_fields=["fcm_token"])
        logger.info(f"FCM token removed for user: {request.user.email}")
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

        logger.info(f"Email verification OTP sent to: {user.email}")

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
            logger.warning(f"Email verification OTP expired for: {user.email}")
            return Response(
                {"error": "OTP expired or not requested."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if str(cached_otp) != otp:
            logger.warning(f"Invalid OTP attempted for: {user.email}")
            return Response(
                {"error": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_verified = True
        user.save(update_fields=["is_verified"])
        cache.delete(f"email_verify_otp:{user.email}")

        from accounts.utils import safe_log_auth
        safe_log_auth(request, action="EMAIL_VERIFY_SUCCESS", user=user, status_code=200)

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
            logger.warning(f"Account deletion attempted with wrong password: {request.user.email}")
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

        logger.info(f"Account permanently deleted: {email}")

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

class AddRoleView(APIView):
    """
    POST /api/auth/add-role/
    Add a new role profile to an existing authenticated user.
    Requires password verification.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role_id = request.data.get("role")
        
        if not role_id:
            return Response(
                {"error": "Role is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        from accounts.utils import verify_identity
        if not verify_identity(request.user, request.data):
            return Response(
                {"error": "Identity verification failed. Please provide a valid password, OTP, or re-auth token."},
                status=status.HTTP_403_FORBIDDEN,
            )
            
        from accounts.utils import get_owned_roles, add_role_profile
        owned_roles = [r["id"] for r in get_owned_roles(request.user)]
        
        if role_id in owned_roles:
            return Response(
                {"error": f"You already have the {role_id} role."},
                status=status.HTTP_409_CONFLICT,
            )
            
        add_role_profile(request.user, role_id)
        
        tokens = _get_tokens_for_user(request.user, active_role=role_id)
        user_data = UserSerializer(request.user).data
        
        return Response(
            {
                "message": f"Successfully added {role_id} role.",
                "tokens": tokens,
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )


class SwitchRoleView(APIView):
    """
    POST /api/auth/switch-role/
    Issue a new JWT with the requested role as the primary active context.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role_id = request.data.get("role")
        
        if not role_id:
            return Response(
                {"error": "Role is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        from accounts.utils import get_owned_roles
        owned_roles = [r["id"] for r in get_owned_roles(request.user)]
        
        if role_id not in owned_roles:
            return Response(
                {"error": f"You do not have the {role_id} role."},
                status=status.HTTP_403_FORBIDDEN,
            )
            
        tokens = _get_tokens_for_user(request.user, active_role=role_id)
        
        return Response(
            {
                "message": "Role switched successfully.",
                "tokens": tokens,
            },
            status=status.HTTP_200_OK,
        )

class UserRolesView(APIView):
    """
    GET /api/auth/roles/
    Retrieve the list of owned roles and the current active role.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from accounts.utils import get_owned_roles
        roles = get_owned_roles(request.user)
        
        auth_header = request.headers.get('Authorization')
        current_role = request.user.role # Fallback
        if auth_header and auth_header.startswith('Bearer '):
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                token = AccessToken(auth_header.split(' ')[1])
                current_role = token.payload.get('primary_role', current_role)
            except:
                pass
                
        return Response({
            "current_role": current_role,
            "roles": roles,
        })

class CompleteLoginView(APIView):
    """
    POST /api/auth/complete-login/
    Complete a login session using a short-lived login_ticket.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        ticket = request.data.get("login_ticket")
        role_id = request.data.get("role")
        
        if not ticket or not role_id:
            return Response(
                {"error": "Both login_ticket and role are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        from accounts.utils import verify_login_ticket, get_owned_roles, safe_log_auth
        user = verify_login_ticket(ticket)
        if not user:
            return Response(
                {"error": "Invalid or expired login_ticket."},
                status=status.HTTP_403_FORBIDDEN,
            )
            
        owned_roles = [r["id"] for r in get_owned_roles(user)]
        
        if role_id not in owned_roles:
            return Response(
                {"error": f"You do not have the {role_id} role."},
                status=status.HTTP_403_FORBIDDEN,
            )
            
        tokens = _get_tokens_for_user(user, active_role=role_id)
        user_data = UserSerializer(user).data
        
        safe_log_auth(request, action="COMPLETE_LOGIN", user=user, status_code=200)
        
        return Response(
            {
                "message": "Login completed successfully.",
                "tokens": tokens,
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )

class PartnerOnboardView(APIView):
    """
    POST /api/auth/partner/onboard/
    Onboard a user to a partner role (e.g. delivery, restaurant).
    Accepts either an authenticated session OR a login_ticket.
    Requires password confirmation.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        role_id = request.data.get("role")
        
        if not role_id:
            return Response(
                {"error": "Role is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        user = request.user
        
        # If not authenticated, require a valid login_ticket
        if not user.is_authenticated:
            ticket = request.data.get("login_ticket")
            if not ticket:
                return Response(
                    {"error": "Authentication required. Please log in or provide a login_ticket."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            
            from accounts.utils import verify_login_ticket
            user = verify_login_ticket(ticket)
            if not user:
                return Response(
                    {"error": "Invalid or expired login_ticket."},
                    status=status.HTTP_403_FORBIDDEN,
                )
                
        # We always verify identity (e.g., password) for onboarding
        from accounts.utils import verify_identity
        if not verify_identity(user, request.data):
            return Response(
                {"error": "Identity verification failed. Please confirm your password."},
                status=status.HTTP_403_FORBIDDEN,
            )
            
        from accounts.utils import get_owned_roles, add_role_profile
        owned_roles = [r["id"] for r in get_owned_roles(user)]
        
        if role_id not in owned_roles:
            add_role_profile(user, role_id)
            
        tokens = _get_tokens_for_user(user, active_role=role_id)
        from accounts.serializers import UserSerializer
        user_data = UserSerializer(user).data
        
        from accounts.utils import safe_log_auth
        safe_log_auth(request, action=f"PARTNER_ONBOARD_{role_id.upper()}", user=user, status_code=200)
        
        return Response(
            {
                "message": f"Successfully onboarded as {role_id}.",
                "tokens": tokens,
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )
