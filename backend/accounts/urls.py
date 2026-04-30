"""
Accounts — URL Configuration
==============================
All auth-related endpoints live under /api/auth/
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    AccountDeletionView,
    ChangePasswordView,
    EmailVerificationConfirmView,
    EmailVerificationRequestView,
    FCMTokenRegisterView,
    FirebaseAuthView,
    ForgotPasswordRequestView,
    ForgotPasswordResetView,
    LoginView,
    LogoutView,
    PhoneOTPRequestView,
    PhoneOTPVerifyView,
    RegisterView,
    UserListView,
    UserProfileView,
)

app_name = "accounts"

urlpatterns = [
    
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),

    
    path("firebase/", FirebaseAuthView.as_view(), name="firebase-auth"),
    path("phone/request-otp/", PhoneOTPRequestView.as_view(), name="phone-request-otp"),
    path("phone/verify-otp/", PhoneOTPVerifyView.as_view(), name="phone-verify-otp"),

    
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),

    
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("forgot-password/", ForgotPasswordRequestView.as_view(), name="forgot-password"),
    path("reset-password/", ForgotPasswordResetView.as_view(), name="reset-password"),
    path("users/", UserListView.as_view(), name="user-list"),

    
    path("fcm-token/", FCMTokenRegisterView.as_view(), name="fcm-token"),

    
    path("verify-email/request/", EmailVerificationRequestView.as_view(), name="verify-email-request"),
    path("verify-email/confirm/", EmailVerificationConfirmView.as_view(), name="verify-email-confirm"),

    
    path("account/", AccountDeletionView.as_view(), name="account-deletion"),
]
