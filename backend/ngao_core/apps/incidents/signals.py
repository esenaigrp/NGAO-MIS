# ngao_core/apps/incidents/signals.py
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from .models import Incident
from ngao_core.utils.notifications import notify_user

@receiver(post_save, sender=Incident)
def incident_workflow_notification(sender, instance, created, **kwargs):
    if created:
        msg = f"Incident '{instance.title}' reported successfully."
        notify_user(instance.reported_by, msg)
    else:
        if hasattr(instance, "_original_status") and instance._original_status != instance.status:
            msg = f"Incident '{instance.title}' status changed: {instance._original_status} → {instance.status}"
            notify_user(instance.reported_by, msg)
            for handler in instance.handlers.all():
                notify_user(handler, msg)
        instance._original_status = instance.status
