# nga_core/apps/incidents/apps.py
from django.apps import AppConfig


class IncidentsConfig(AppConfig):
    name = "ngao_core.apps.incidents"

    def ready(self):
        import ngao_core.apps.incidents.signals
