import os
from .base import *


# GEOS_LIBRARY_PATH = "/opt/homebrew/opt/geos/lib/libgeos_c.dylib"
# GDAL_LIBRARY_PATH = "/opt/homebrew/opt/gdal/lib/libgdal.dylib"

GDAL_LIBRARY_PATH="/usr/lib/x86_64-linux-gnu/libgdal.so"
GEOS_LIBRARY_PATH="/usr/lib/x86_64-linux-gnu/libgeos_c.so"

os.environ["GDAL_LIBRARY_PATH"] = GDAL_LIBRARY_PATH
os.environ["GEOS_LIBRARY_PATH"] = GEOS_LIBRARY_PATH

# PROJ_LIB = "/opt/homebrew/share/proj"
PROJ_LIB = "~/Documents/projects/NGAO-MIS"


DEBUG = True

# Development database
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": os.getenv("POSTGRES_DB", "ngao_mis"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "postgres"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}


# CORS: allow everything in dev
CORS_ALLOW_ALL_ORIGINS = True

# Logging level for development
LOGGING["root"]["level"] = "DEBUG"