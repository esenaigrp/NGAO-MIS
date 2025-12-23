import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent


CORS_ALLOW_CREDENTIALS = True

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

FRONTEND_DIST_DIR = PROJECT_ROOT / "frontend" / "dashboard" / "dist"

# ----------------------
# Security
# ----------------------
SECRET_KEY = "7288cfeda26f94b1a59089b9adf90343"
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# ----------------------
# Installed Apps
# ----------------------
INSTALLED_APPS = [
    # Default Django apps...
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",

    # Your apps
    "ngao_core.apps.accounts",
    "ngao_core.apps.incidents",
    'ngao_core.apps.geography',
    'ngao_core.apps.civil_registration',
    'ngao_core.apps.citizen_repo',
    'ngao_core.apps.identity_registration',
]

# ----------------------
# Middleware
# ----------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # Must be first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "ngao_core.apps.accounts.middleware.DeviceCheckMiddleware",
]

# ----------------------
# Templates
# ----------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [FRONTEND_DIST_DIR],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ----------------------
# Database (example)
# ----------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "ngao_db",
        "USER": "ngao_user",
        "PASSWORD": "Ngao@2025",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_ALL_ORIGINS = False


# ----------------------
# REST Framework & JWT
# ----------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ----------------------
# Static & Media
# ----------------------
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
STATICFILES_DIRS = [BASE_DIR / "frontend/dashboard/dist/static",]
MEDIA_ROOT = BASE_DIR / "media"

# ----------------------
# Default primary key
# ----------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- Authentication ---
AUTH_USER_MODEL = "accounts.CustomUser"
