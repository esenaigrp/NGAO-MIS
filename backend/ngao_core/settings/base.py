import os
import datetime
from pathlib import Path
from typing import List, Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BASE_DIR.parent

# --------------------------------------------------
# Core
# --------------------------------------------------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-dev-key")
DEBUG = False  # overridden in dev/prod

ALLOWED_HOSTS: List[str] = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost 127.0.0.1").split()

# --------------------------------------------------
# Applications
# --------------------------------------------------
INSTALLED_APPS: List[str] = [
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
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",

    # Local
    "ngao_core.apps.accounts",
    "ngao_core.apps.admin_structure",
    "ngao_core.apps.incidents",
    "ngao_core.apps.citizen_repo",
    "ngao_core.apps.civil_registration",
    "ngao_core.apps.projects",
    "ngao_core.apps.communications",
    "ngao_core.apps.geography",
    "ngao_core.apps.identity_registration",
]

# --------------------------------------------------
# Middleware
# --------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "ngao_core.apps.accounts.middleware.DeviceCheckMiddleware",
]

# --------------------------------------------------
# URLs / ASGI / WSGI
# --------------------------------------------------
ROOT_URLCONF = "ngao_core.urls"
WSGI_APPLICATION = "ngao_core.wsgi.application"
ASGI_APPLICATION = "ngao_core.asgi.application"

# --------------------------------------------------
# Templates
# --------------------------------------------------
FRONTEND_DIST_DIR = PROJECT_ROOT / "frontend/dashboard/dist"

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
            ],
        },
    }
]

# --------------------------------------------------
# Auth
# --------------------------------------------------
AUTH_USER_MODEL = "accounts.CustomUser"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------
# I18N
# --------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------
# Static / Media
# --------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [FRONTEND_DIST_DIR / "static"]

# This production code might break development mode, so we check whether we're in DEBUG mode
if not DEBUG:
    # Tell Django to copy static assets into a path called `staticfiles` (this is specific to Render)
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

    # Enable the WhiteNoise storage backend, which compresses static files to reduce disk use
    # and renames the files with unique names for each version to support long-term caching
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# --------------------------------------------------
# DRF & JWT
# --------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": datetime.timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", 60))),
    "REFRESH_TOKEN_LIFETIME": datetime.timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", 7))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# --------------------------------------------------
# CORS (safe default)
# --------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS: List[str] = []

# CSRF
CSRF_TRUSTED_ORIGINS = os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")

# # https and reverse proxy support
# SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "False") == "True"

# SECURE_PROXY_SSL_HEADER = tuple(os.getenv("SECURE_PROXY_SSL_HEADER", "").split(",")) or None

# # secure cookies
# CSRF_COOKIE_SECURE = os.getenv("CSRF_COOKIE_SECURE", "False") == "True"
# SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "False") == "True"

# # HTTP Strict Transport Security (HSTS)
# SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", 0))
# SECURE_HSTS_INCLUDE_SUBDOMAINS = (os.getenv("SECURE_HSTS_INCLUDE_SUBDOMAINS", "False") == "True")
# SECURE_HSTS_PRELOAD = (os.getenv("SECURE_HSTS_PRELOAD", "False") == "True")

# # security headers
# SECURE_CONTENT_TYPE_NOSNIFF = True
# SECURE_BROWSER_XSS_FILTER = True
# X_FRAME_OPTIONS = "DENY"

# --------------------------------------------------
# Logging
# --------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
