from .base import *
import os
import dj_database_url

os.environ["GDAL_LIBRARY_PATH"]
os.environ["GEOS_LIBRARY_PATH"]

# # PROJ_LIB = "/opt/homebrew/share/proj"
PROJ_LIB = "~/Documents/projects/NGAO-MIS"

DEBUG = True

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            engine="django.contrib.gis.db.backends.postgis",
            conn_max_age=600,
            ssl_require=True,
        )
    }
else:
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
