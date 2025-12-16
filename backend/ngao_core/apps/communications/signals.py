from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message, Announcement

def notify_user(user, message):
    """Send a notification to the user (SMS, email, or system alert)."""
    if not user:
        return
    print(f"Notify {user}: {message}")
    # Example: integrate with actual SMS/email service in production
    # send_mail(subject="Notification", message=message, from_email="noreply@ngao.mis", recipient_list=[user.email])

# ------------------------------
# Message notifications
# ------------------------------
@receiver(post_save, sender=Message)
def message_notification(sender, instance, created, **kwargs):
    if created:
        msg = f"New message from {instance.sender}: {instance.content}"  # Corrected field
        notify_user(instance.recipient, msg)

# ------------------------------
# Announcement notifications
# ------------------------------
@receiver(post_save, sender=Announcement)
def announcement_notification(sender, instance, created, **kwargs):
    if created:
        msg = f"New announcement: {instance.title}"
        for user in instance.recipients.all():
            notify_user(user, msg)  # Using the helper function instead of print
