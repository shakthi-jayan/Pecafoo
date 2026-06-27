# ============================================================
# Pecafoo Production Django Settings (Dokploy Ready)
# ============================================================

import os
from pathlib import Path
from datetime import timedelta
import environ
import cloudinary

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False)
)

environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# ============================================================
# CORE
# ============================================================

SECRET_KEY = env("SECRET_KEY")
DEBUG = env.bool("DEBUG", default=False)

ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS",
    default=[
        "api.pecafoo.com",
    ],
)

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

    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

    "config.middleware.RequestLoggingMiddleware",
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
        "ENGINE": env("DB_ENGINE", default="django.db.backends.postgresql"),
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT", default="5432"),
        "CONN_MAX_AGE": env.int("DB_CONN_MAX_AGE", default=600),
        "OPTIONS": {
            "connect_timeout": 10,
        },
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
# STATIC / MEDIA (Django 5 STORAGES)
# ============================================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# ============================================================
# CLOUDINARY
# ============================================================

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": env("CLOUDINARY_CLOUD_NAME", default=""),
    "API_KEY": env("CLOUDINARY_API_KEY", default=""),
    "API_SECRET": env("CLOUDINARY_API_SECRET", default=""),
}

cloudinary.config(
    cloud_name=env("CLOUDINARY_CLOUD_NAME", default=""),
    api_key=env("CLOUDINARY_API_KEY", default=""),
    api_secret=env("CLOUDINARY_API_SECRET", default=""),
    secure=True,
)

# ============================================================
# REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
    },
    "EXCEPTION_HANDLER": "config.api_exception_handler.custom_exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# ============================================================
# DRF SPECTACULAR (API Schema)
# ============================================================

SPECTACULAR_SETTINGS = {
    "TITLE": "Pecafoo API",
    "DESCRIPTION": "Pecafoo Food Delivery Platform — REST & WebSocket API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/",
}

# ============================================================
# JWT
# ============================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=env.int("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", default=60)
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=env.int("JWT_REFRESH_TOKEN_LIFETIME_DAYS", default=7)
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "SIGNING_KEY": env("JWT_SIGNING_KEY", default=SECRET_KEY),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ============================================================
# CORS
# ============================================================

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "https://pecafoo.com",
        "https://www.pecafoo.com",
        "https://restaurant.pecafoo.com",
        "https://delivery.pecafoo.com",
        "https://admin.pecafoo.com",
    ],
)

CORS_ALLOW_CREDENTIALS = True

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
# CSRF
# ============================================================

CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "https://api.pecafoo.com",
        "https://pecafoo.com",
        "https://www.pecafoo.com",
        "https://restaurant.pecafoo.com",
        "https://delivery.pecafoo.com",
        "https://admin.pecafoo.com",
    ],
)

CSRF_FAILURE_VIEW = "config.views.csrf_failure"

CSRF_COOKIE_DOMAIN = env("CSRF_COOKIE_DOMAIN", default=".pecafoo.com")

# ============================================================
# COOKIES
# ============================================================

SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", default=True)
CSRF_COOKIE_SECURE = env.bool("CSRF_COOKIE_SECURE", default=True)

SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False

# ============================================================
# PROXY / SSL (Traefik handles SSL termination)
# ============================================================

USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=False)
APPEND_SLASH = True

# ============================================================
# SECURITY
# ============================================================

X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True

SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS", default=False
)
SECURE_HSTS_PRELOAD = env.bool("SECURE_HSTS_PRELOAD", default=False)

SECURE_REFERRER_POLICY = env(
    "SECURE_REFERRER_POLICY", default="strict-origin-when-cross-origin"
)
SECURE_CROSS_ORIGIN_OPENER_POLICY = env(
    "SECURE_CROSS_ORIGIN_OPENER_POLICY", default="same-origin"
)

# ============================================================
# EMAIL
# ============================================================

EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.smtp.EmailBackend"
)

EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")

DEFAULT_FROM_EMAIL = env(
    "DEFAULT_FROM_EMAIL",
    default=f"Pecafoo <{env('EMAIL_HOST_USER', default='noreply@pecafoo.com')}>"
)

# ============================================================
# CACHE (Redis)
# ============================================================

CACHES = {
    "default": {
        "BACKEND": env(
            "CACHE_BACKEND",
            default="django_redis.cache.RedisCache",
        ),
        "LOCATION": env("CACHE_LOCATION", default="redis://redis:6379/3"),
        "TIMEOUT": env.int("CACHE_DEFAULT_TIMEOUT", default=300),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}

SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# ============================================================
# CHANNELS (WebSocket via Redis)
# ============================================================

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [env("REDIS_URL", default="redis://redis:6379/0")],
            "capacity": 1500,
            "expiry": 60,
        },
    },
}

# ============================================================
# CELERY
# ============================================================

CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://redis:6379/1")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default="redis://redis:6379/2")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 300
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

# ============================================================
# FIREBASE ADMIN SDK
# ============================================================

_firebase_private_key = env("FIREBASE_PRIVATE_KEY", default="")
if _firebase_private_key:
    _firebase_private_key = _firebase_private_key.replace("\\n", "\n")

FIREBASE_CONFIG = {
    "type": env("FIREBASE_TYPE", default="service_account"),
    "project_id": env("FIREBASE_PROJECT_ID_ADMIN", default=""),
    "private_key_id": env("FIREBASE_PRIVATE_KEY_ID", default=""),
    "private_key": _firebase_private_key,
    "client_email": env("FIREBASE_CLIENT_EMAIL", default=""),
    "client_id": env("FIREBASE_CLIENT_ID", default=""),
    "auth_uri": env("FIREBASE_AUTH_URI", default="https://accounts.google.com/o/oauth2/auth"),
    "token_uri": env("FIREBASE_TOKEN_URI", default="https://oauth2.googleapis.com/token"),
    "auth_provider_x509_cert_url": env(
        "FIREBASE_AUTH_PROVIDER_CERT_URL",
        default="https://www.googleapis.com/oauth2/v1/certs",
    ),
    "client_x509_cert_url": env("FIREBASE_CLIENT_CERT_URL", default=""),
    "universe_domain": env("FIREBASE_UNIVERSE_DOMAIN", default="googleapis.com"),
}

# ============================================================
# LOGGING
# ============================================================

LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name} {module}.{funcName}:{lineno} — {message}",
            "style": "{",
        },
        "simple": {
            "format": "[{asctime}] {levelname} — {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "file_app": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "app.log",
            "maxBytes": 10 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "verbose",
        },
        "file_error": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "error.log",
            "maxBytes": 10 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "verbose",
            "level": "ERROR",
        },
    },
    "root": {
        "handlers": ["console", "file_app", "file_error"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file_app", "file_error"],
            "level": "WARNING",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console", "file_error"],
            "level": "ERROR",
            "propagate": False,
        },
        "pecafoo": {
            "handlers": ["console", "file_app", "file_error"],
            "level": "INFO",
            "propagate": False,
        },
        "pecafoo.request": {
            "handlers": ["console", "file_app"],
            "level": "INFO",
            "propagate": False,
        },
        "accounts": {
            "handlers": ["console", "file_app", "file_error"],
            "level": "INFO",
            "propagate": False,
        },
        "celery": {
            "handlers": ["console", "file_app"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# ============================================================
# DEFAULT FIELD
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
