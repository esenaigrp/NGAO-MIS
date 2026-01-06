from .base import *
import os


os.environ["GDAL_LIBRARY_PATH"]
os.environ["GEOS_LIBRARY_PATH"]

# # PROJ_LIB = "/opt/homebrew/share/proj"
PROJ_LIB = "~/Documents/projects/NGAO-MIS"

DEBUG = True

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": os.getenv("POSTGRES_DB"),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

CORS_ALLOW_ALL_ORIGINS = True

LOGGING["root"]["level"] = "DEBUG"
