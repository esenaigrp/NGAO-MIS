import datetime
import os
from pathlib import Path
from typing import (
    List,
    Dict,
    Any,
)  # Added for better type hinting (optional, but good practice)


BASE_DIR = Path(__file__).resolve().parent.parent.parent

# --- General ---
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "change-me-in-production")
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"
ALLOWED_HOSTS: List[str] = os.getenv(
    "DJANGO_ALLOWED_HOSTS", "localhost 127.0.0.1"
).split()

# --- Applications ---
INSTALLED_APPS: List[str] = [  # Use List[str] for clearer typing
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.gis",
    # Third-party
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    # Local apps
    "ngao_core.apps.accounts",
    "ngao_core.apps.admin_structure",
    # 'ngao_core.apps.audit',
    # 'ngao_core.apps.geospatial',
    "ngao_core.apps.incidents",
    # 'ngao_core.apps.messaging',
    # 'ngao_core.apps.reports',
    "ngao_core.apps.citizen_repo",
    "ngao_core.apps.civil_registration",
    "ngao_core.apps.projects",
    "ngao_core.apps.communications",
    "ngao_core.apps.geography.apps.GeographyConfig",
    "ngao_core.apps.identity_registration",
]

# --- GIS Libraries (Removed hardcoded assignments for better deployment) ---
# It's best to remove the hardcoded assignments if you rely purely on environment variables
# as setting them here can override system defaults.
# If you NEED these for local Mac development, uncomment them, but be aware of deployment issues.
# GEOS_LIBRARY_PATH = os.getenv("GEOS_LIBRARY_PATH", None)
# GDAL_LIBRARY_PATH = os.getenv("GDAL_LIBRARY_PATH", None)

# --- Middleware ---
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "ngao_core.apps.accounts.middleware.DeviceCheckMiddleware",
]

# --- URLs & Templates ---
ROOT_URLCONF = "ngao_core.urls"
WSGI_APPLICATION = "ngao_core.wsgi.application"
ASGI_APPLICATION = "ngao_core.asgi.application"

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

FRONTEND_DIST_DIR = PROJECT_ROOT / "frontend" / "dashboard" / "dist"

TEMPLATES: List[Dict[str, Any]] = [
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
            ]
        },
    }
]

# --- Authentication ---
AUTH_USER_MODEL = "accounts.CustomUser"

# --- Password validation (Structurally correct, but added type hint) ---
AUTH_PASSWORD_VALIDATORS: List[Dict[str, Any]] = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- Internationalization ---
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_L10N = True
USE_TZ = True

# --- Static & Media (Added Staticfiles DIRS for React/Vite assets) ---
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
# Add your built frontend assets here. Assuming Vite output is to 'dist'.
STATICFILES_DIRS = [
    BASE_DIR / "frontend/dashboard/dist/static",
]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# --- REST Framework ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
}

# --- Simple JWT (Structurally correct, but added type hint and corrected USER_ID_FIELD) ---
SIMPLE_JWT: Dict[str, Any] = {
    "ACCESS_TOKEN_LIFETIME": datetime.timedelta(
        minutes=int(os.getenv("JWT_ACCESS_MINUTES", 60))
    ),
    "REFRESH_TOKEN_LIFETIME": datetime.timedelta(
        days=int(os.getenv("JWT_REFRESH_DAYS", 7))
    ),
    "ROTATE_REFRESH_TOKENS": True,  # Recommended for security
    "BLACKLIST_AFTER_ROTATION": True,  # Requires 'rest_framework_simplejwt.token_blacklist' in INSTALLED_APPS
    "AUTH_HEADER_TYPES": ("Bearer",),
    # Changed to 'id' as it's the Django default PK name.
    # Change back to 'user_id' only if your CustomUser model explicitly uses user_id as its PK field.
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}


# --- CORS (Using Vite default dev server host and port) ---
CORS_ALLOWED_ORIGINS: List[str] = [
    "http://localhost:5173",  # Vite's default port
    "http://127.0.0.1:5173",  # Vite's default port
]
# For production, you will add your HTTPS domain(s) here instead of relying on CORS_ALLOW_ALL_ORIGINS.
CORS_ALLOW_ALL_ORIGINS = (
    False  # A good pattern: allow all only in debug, use list otherwise
)

CORS_ALLOW_CREDENTIALS = True

# --- Logging (Structurally correct, but added type hint) ---
LOGGING: Dict[str, Any] = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

# --- Default primary key field ---
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
