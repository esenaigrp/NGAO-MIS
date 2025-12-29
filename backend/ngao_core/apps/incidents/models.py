import uuid
from ngao_core.apps.geography.models import Area
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point
from django.db import models, transaction
from ngao_core.apps.accounts.models import CustomUser
from ngao_core.apps.admin_structure.models import AdminUnit

User = CustomUser


class Incident(models.Model):
    STATUS_CHOICES = [
        ("reported", _("Reported")),
        ("dispatched", _("Dispatched")),
        ("on_scene", _("On Scene")),
        ("resolved", _("Resolved")),
        ("closed", _("Closed")),
    ]

    TYPE_CHOICES = [
        ("fire", _("Fire Incident")),
        ("accident", _("Traffic Accident")),
        ("crime", _("Crime/Security")),
        ("medical", _("Medical Emergency")),
        ("other", _("Other")),
    ]

    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Core fields
    reporter_phone = models.CharField(max_length=20)
    title = models.CharField(max_length=255, verbose_name=_("Title of Incident"))
    description = models.TextField(verbose_name=_("Detailed Description"))
    incident_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default="other")
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True, related_name="incidents", verbose_name=_("Geographic Area"),)
    reported_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="reported")

    # Workflow fields
    handlers = models.ManyToManyField(CustomUser, blank=True, related_name="assigned_incidents", verbose_name=_("Handlers"),)
    current_handler = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.SET_NULL, related_name="current_incidents", verbose_name=_("Current Handler"),)

    # Location & GIS
    location = models.ForeignKey(AdminUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name="incidents", verbose_name=_("Administrative Location Unit"),)
    coordinates = gis_models.PointField(default=Point(0.0, 0.0), verbose_name=_("Geospatial Coordinates"))
    date_reported = models.DateTimeField(auto_now_add=True, verbose_name=_("Date Reported"))
    date_resolved = models.DateTimeField(null=True, blank=True, verbose_name=_("Date Resolved"))

    # Reporting user
    reported_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="incidents_reported", verbose_name=_("Reported By User"),)

    class Meta:
        verbose_name = _("Incident")
        verbose_name_plural = _("Incidents")
        ordering = ["-date_reported"]
        indexes = [
            models.Index(fields=["incident_type"]),
            models.Index(fields=["status"]),
        ]

    @staticmethod
    def assign_area(phone_number):
        from ngao_core.apps.citizens.models import Citizen

        citizen = Citizen.objects.filter(phone_number=phone_number).first()
        return citizen.area if citizen else None

    def __str__(self):
        return f"{self.title} ({self.status})"

    def alert_next_handler(self):
        """
        Assign the next handler if the incident is active.
        Stops workflow if resolved/closed.
        """
        if self.status in ["resolved", "closed"]:
            return

        handler_list = list(self.handlers.all())
        if not handler_list:
            return  # No handlers assigned

        if self.current_handler is None:
            self.current_handler = handler_list[0]
        else:
            try:
                current_index = handler_list.index(self.current_handler)
                next_index = (current_index + 1) % len(handler_list)
                self.current_handler = handler_list[next_index]
            except ValueError:
                self.current_handler = handler_list[0]

        with transaction.atomic():
            self.save()
            self.notify_current_handler()

    def notify_current_handler(self):
        """
        Placeholder notification.
        Replace with email/SMS/push in production.
        """
        if self.current_handler:
            print(
                f"[Notification] {self.current_handler.first_name} assigned to incident '{self.title}'"
            )


class Response(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident = models.ForeignKey(
        Incident, on_delete=models.CASCADE, related_name="responses"
    )
    responder = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="responses"
    )
    comment = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response by {self.responder} on {self.timestamp}"

    def save(self, *args, **kwargs):
        """
        Trigger next handler assignment automatically when response is added,
        only if incident is still active.
        """
        super().save(*args, **kwargs)
        if self.incident.status not in ["resolved", "closed"]:
            self.incident.alert_next_handler()
