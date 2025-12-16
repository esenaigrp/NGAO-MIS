from collections.abc import Iterator
from django.apps import AppConfig
from django.db.models.base import Model


class GeographyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ngao_core.apps.geography'
    verbose_name = "Geography"
    label = 'geography'

    

   