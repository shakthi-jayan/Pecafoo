# ============================================================
# Pecafoo Production Django Settings (Dokploy Ready)
# Updated with CORS fixes for admin app on port 3004/3005
# ============================================================

import os
from pathlib import Path
from datetime import timedelta
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False)
)

env_file = os.path.join(BASE_DIR, ".env")
if os.path.exists(env_file):
    environ.Env.read_env(env_file)

# ============================================================
# CORE
# ============================================================

SECRET_KEY = env("SECRET_KEY")
DEBUG = env.bool("DEBUG", default=False)

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "136.185.11.23",
    "machodev.com",
    "www.machodev.com",
    "api.machodev.com",
    "*",  # For development only - restrict in production
]

# ============================================================
# INSTALLED APPS
# ============================================================

INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "drf_spectacular",
    "cloudinary",
    "cloudinary_storage",
    "channels",
    "phonenumber_field",
    # apps
    "accounts",
    "customers",
    "restaurants",
    "delivery",
    "orders",
    "locations",
    "notifications",
    "analytics",
    "promotions",
]

# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # Keep this before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# ============================================================
# DATABASE
# ============================================================

DATABASES = {
    "default": {
        "ENGINE": env("DB_ENGINE"),
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT"),
    }
}

# ============================================================
# PASSWORDS
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "accounts.User"

# ============================================================
# LANGUAGE
# ============================================================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"

USE_I18N = True
USE_TZ = True

# ============================================================
# STATIC / MEDIA
# ============================================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ============================================================
# REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",  # Change as needed
    ),
}

# ============================================================
# JWT
# ============================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
}

# ============================================================
# CORS - FIXED FOR ADMIN APP PORTS
# ============================================================

CORS_ALLOWED_ORIGINS = [
    # Production domains
    "https://machodev.com",
    "https://www.machodev.com",
    # IP-based access
    "http://136.185.11.23",
    "http://136.185.11.23:3001",
    "http://136.185.11.23:3002",
    "http://136.185.11.23:3003",
    "http://136.185.11.23:3004",  # Admin app
    "http://136.185.11.23:3005",  # Alternative admin port
    # NIP.IO domains
    "http://api.136.185.11.23.nip.io:3005",
    # Local development
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:3004",
]

CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings for better compatibility
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# ============================================================
# CSRF - FIXED FOR ALL ORIGINS
# ============================================================

CSRF_TRUSTED_ORIGINS = [
    "https://machodev.com",
    "https://www.machodev.com",
    "http://136.185.11.23",
    "http://136.185.11.23:3001",
    "http://136.185.11.23:3002",
    "http://136.185.11.23:3003",
    "http://136.185.11.23:3004",
    "http://136.185.11.23:3005",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3004",
]

CSRF_USE_SESSIONS = False
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = False  # Set to True if using HTTPS

# ============================================================
# SESSION COOKIES
# ============================================================

SESSION_COOKIE_SECURE = False  # Set to True if using HTTPS
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_HTTPONLY = True

# ============================================================
# PROXY / SSL
# ============================================================

USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = False  # Handle SSL at proxy level

# ============================================================
# SECURITY HEADERS
# ============================================================

X_FRAME_OPTIONS = "DENY"
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Only enable these if using HTTPS
SECURE_HSTS_SECONDS = 0  # Set to 31536000 if using HTTPS
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# ============================================================
# EMAIL
# ============================================================

EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.smtp.EmailBackend"
)

EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")

# ============================================================
# CACHE (Redis)
# ============================================================

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": env("REDIS_URL", default="redis://pecafoo-redis-hgsvlk:6379/0"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# ============================================================
# CHANNEL LAYERS (Redis)
# ============================================================

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [env("REDIS_URL", default="redis://pecafoo-redis-hgsvlk:6379/0")],
        },
    }
}

# ============================================================
# DEFAULT FIELD
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ============================================================
# LOGGING (Optional - for debugging)
# ============================================================

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "corsheaders": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# ============================================================
# PRODUCTION SECURITY OVERRIDES (machodev.com)
# ============================================================
# These settings activate ONLY when ENABLE_PROD_SECURITY=True
# is set in the environment (e.g., via docker-compose).
# They do NOT disturb any existing settings above when disabled.
# ============================================================

if os.getenv("ENABLE_PROD_SECURITY", "").lower() == "true":
    # Override ALLOWED_HOSTS from env if provided
    _hosts = os.getenv("ALLOWED_HOSTS")
    if _hosts:
        ALLOWED_HOSTS = [h.strip() for h in _hosts.split(",") if h.strip()]

    # Override CSRF_TRUSTED_ORIGINS from env if provided
    _csrf = os.getenv("CSRF_TRUSTED_ORIGINS")
    if _csrf:
        CSRF_TRUSTED_ORIGINS = [o.strip() for o in _csrf.split(",") if o.strip()]

    # Override CORS_ALLOWED_ORIGINS from env if provided
    _cors = os.getenv("CORS_ALLOWED_ORIGINS")
    if _cors:
        CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors.split(",") if o.strip()]

    # HTTPS cookie security
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True

    # HSTS (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    # SSL redirect handled at Nginx level, so keep False here
    SECURE_SSL_REDIRECT = False

