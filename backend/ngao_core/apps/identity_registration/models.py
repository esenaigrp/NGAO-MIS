import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings
from ngao_core.apps.citizen_repo.models import Citizen

User = settings.AUTH_USER_MODEL


class NationalIDRegistrationRequest(models.Model):
    STATUS_CHOICES = (
        ("initiated", "Initiated"),
        ("chief_verified", "Chief Verified"),
        ("submitted_to_nrb", "Submitted to NRB"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    applicant = models.ForeignKey(
        Citizen,
        on_delete=models.PROTECT,
        related_name="id_requests"
    )
    father = models.ForeignKey(
        Citizen,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="id_requests_as_father"
    )
    mother = models.ForeignKey(
        Citizen,
        on_delete=models.PROTECT,
        related_name="id_requests_as_mother"
    )
    initiated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="id_requests_initiated"
    )
    verified_by_chief = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="id_requests_verified"
    )
    reference_number = models.CharField(max_length=30, unique=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="initiated")
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    submitted_to_nrb_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.reference_number} - {self.applicant}"

    def verify_parents(self, mother_ok: bool, father_ok: bool = True, chief_user=None):
        """
        Method to handle Chief verification step. Only after verification does status move forward.
        """
        if not mother_ok:
            raise ValueError("Mother verification is required.")

        self.verified_by_chief = chief_user
        self.verified_at = timezone.now()
        if father_ok:
            self.status = "chief_verified"
        else:
            self.status = "rejected"
        self.save()

    def submit_to_nrb(self):
        """
        Move the registration to NRB submission stage
        """
        if self.status != "chief_verified":
            raise ValueError("Cannot submit to NRB before Chief verification.")
        self.status = "submitted_to_nrb"
        self.save()

    def complete_registration(self):
        """
        Mark registration as completed
        """
        if self.status != "submitted_to_nrb":
            raise ValueError("Cannot complete registration before submission to NRB.")
        self.status = "completed"
        self.save()

    def reject_registration(self, reason=None):
        self.status = "rejected"
        self.save()

    
