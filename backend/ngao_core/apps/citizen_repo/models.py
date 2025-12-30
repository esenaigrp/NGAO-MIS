import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.db import models


class Citizen(models.Model):
    GENDER_CHOICES = (
        ("M", "Male"),
        ("F", "Female"),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_number = models.CharField(max_length=20, unique=True, db_index=True, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)

    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    date_of_birth = models.DateField()
    place_of_birth = models.CharField(max_length=255)

    father_id_number = models.CharField(max_length=20, blank=True, null=True)
    mother_id_number = models.CharField(max_length=20, blank=True, null=True)

    current_area = models.ForeignKey(
        "geography.Area",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="citizens"
    )

    is_alive = models.BooleanField(default=True)
    date_of_death = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id_number"]
        verbose_name = "Citizen"
        verbose_name_plural = "Citizens"

    def __str__(self):
        return f"{self.id_number} - {self.first_name} {self.last_name}"
    
class CitizenQueryLog(models.Model):
    MODULE_CHOICES = (
        ("birth", "Birth Registration"),
        ("death", "Death Registration"),
        ("marriage", "Marriage Registration"),
        ("general", "General Lookup"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="citizen_queries",
    )

    id_number_queried = models.CharField(max_length=20, null=True, blank=True)
    last_name_provided = models.CharField(max_length=100, null=True, blank=True)

    module = models.CharField(
        max_length=20,
        choices=MODULE_CHOICES,
        default="general",
    )

    was_found = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.id_number_queried} ({self.module}) - {'FOUND' if self.was_found else 'MISS'}"
