"""
WSGI config for ngao_core project.

It exposes the WSGI callable as a module-level variable named "application".
"""

import os
from dotenv import load_dotenv

load_dotenv()

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ngao_core.settings.dev")

application = get_wsgi_application()
