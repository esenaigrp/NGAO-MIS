import os

from .base import *

# Determine which settings to load
ENVIRONMENT = os.getenv("DJANGO_ENV", "dev").lower()

if ENVIRONMENT == "prod":
    from .prod import *
else:
    from .dev import *
