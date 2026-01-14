from django.apps import AppConfig

class CommunicationsConfig(AppConfig):
    name = "ngao_core.apps.communications"

    def ready(self):
        import ngao_core.apps.communications.signals
