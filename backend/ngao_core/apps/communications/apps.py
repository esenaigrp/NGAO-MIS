from django.apps import AppConfig

class CommunicationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ngao_core.apps.communications"

    def ready(self):
        import ngao_core.apps.communications.signals
