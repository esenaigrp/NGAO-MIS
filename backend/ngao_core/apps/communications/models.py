import uuid
from django.db import models
from django.contrib.auth import get_user_model
from ngao_core.apps.admin_structure.models import AdminUnit, Location
from django.conf import settings

User = get_user_model()


class Communication(models.Model):
    TYPE_CHOICES = [
        ("MSG", "Message"),
        ("ANN", "Announcement"),
        ("NOT", "Notification"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    body = models.TextField()
    type = models.CharField(max_length=3, choices=TYPE_CHOICES)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="sent_communications")
    recipients = models.ManyToManyField(User, blank=True, related_name="received_communications")
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    admin_unit = models.ForeignKey(AdminUnit, on_delete=models.SET_NULL, null=True, blank=True)
    read_by = models.ManyToManyField(User, blank=True, related_name="read_communications")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Communications"

    def __str__(self):
        return f"{self.title}"


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages"
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient}"


class Announcement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    body = models.TextField()
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="announcements"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    recipients = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name="announcement_recipients"
    )

    def __str__(self):
        return self.title

class Baraza(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    date = models.DateField()
    location = models.CharField(max_length=255)
    organizer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="organized_barazas"
    )
    attendees = models.ManyToManyField(
        User,
        blank=True,
        related_name="attended_barazas"
    )

    def __str__(self):
        return self.title
    
class USSDLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    request_text = models.TextField()
    response_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class SMSLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    recipients = models.JSONField()  # list of phone numbers
    message = models.TextField()
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

