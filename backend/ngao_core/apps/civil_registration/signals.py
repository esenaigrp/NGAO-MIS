# ngao_core/apps/civil_registration/signals.py
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from .models import Birth, Death, Marriage, Baraza
from ngao_core.utils.notifications import notify_user

# Birth
@receiver(post_save, sender=Birth)
def birth_workflow(sender, instance, created, **kwargs):
    if created:
        msg = f"Birth for {instance.child} registered successfully."
        notify_user(instance.parent, msg)
        notify_user(instance.registered_by, msg)

# Death
@receiver(post_save, sender=Death)
def death_workflow(sender, instance, created, **kwargs):
    if created:
        msg = f"Death for {instance.citizen} reported successfully."
        notify_user(instance.reported_by, msg)

# Marriage
@receiver(post_save, sender=Marriage)
def marriage_workflow(sender, instance, created, **kwargs):
    if created:
        msg = f"Marriage between {instance.spouse1} and {instance.spouse2} registered successfully."
        notify_user(instance.registered_by, msg)
        notify_user(instance.spouse1, msg)
        notify_user(instance.spouse2, msg)

# Baraza
@receiver(post_save, sender=Baraza)
def baraza_created(sender, instance, created, **kwargs):
    if created:
        msg = f"Baraza '{instance.title}' scheduled on {instance.date} at {instance.location}."
        notify_user(instance.organizer, msg)
        for attendee in instance.attendees.all():
            notify_user(attendee, msg)

@receiver(m2m_changed, sender=Baraza.attendees.through)
def baraza_attendees_changed(sender, instance, action, pk_set, **kwargs):
    if action in ["post_add", "post_remove"]:
        for pk in pk_set:
            try:
                citizen = instance.attendees.model.objects.get(pk=pk)
                msg = f"You have been {'added to' if action=='post_add' else 'removed from'} Baraza '{instance.title}'."
                notify_user(citizen, msg)
            except instance.attendees.model.DoesNotExist:
                continue
