# ngao_core/apps/projects/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Project, Milestone
from ngao_core.utils.notifications import notify_user

# Project status
@receiver(post_save, sender=Project)
def project_status_notification(sender, instance, created, **kwargs):
    if created:
        msg = f"Project '{instance.title}' registered successfully."
        notify_user(instance.created_by, msg)
        for officer in instance.assigned_officers.all():
            notify_user(officer, msg)
    else:
        if hasattr(instance, "_original_status") and instance._original_status != instance.status:
            msg = f"Project '{instance.title}' status changed: {instance._original_status} → {instance.status}"
            notify_user(instance.created_by, msg)
            for officer in instance.assigned_officers.all():
                notify_user(officer, msg)
        instance._original_status = instance.status

# Milestone achieved
@receiver(post_save, sender=Milestone)
def milestone_achieved_notification(sender, instance, created, **kwargs):
    if not created and instance.achieved:
        project = instance.project
        msg = f"Milestone '{instance.title}' for project '{project.title}' achieved."
        notify_user(project.created_by, msg)
        for officer in project.assigned_officers.all():
            notify_user(officer, msg)

# Track original status
@receiver(post_save, sender=Project)
def track_project_status(sender, instance, **kwargs):
    instance._original_status = instance.status
