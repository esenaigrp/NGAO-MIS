# nga_core/apps/incidents/apps.py
from django.apps import AppConfig


class IncidentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ngao_core.apps.incidents"

    def ready(self):
        import ngao_core.apps.incidents.signals
