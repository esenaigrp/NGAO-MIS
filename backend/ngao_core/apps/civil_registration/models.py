import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings
from ngao_core.apps.citizen_repo.models import Citizen

User = settings.AUTH_USER_MODEL

# ---------- Registration Request ----------
class RegistrationRequest(models.Model):
    STATUS_CHOICES = (
        ("pending_verification", "Pending Chief Verification"),
        ("pending_nrb", "Pending NRB Registration"),
        ("completed", "Completed"),
    )

    reference_number = models.CharField(max_length=30, unique=True)
    registration_type = models.CharField(
        max_length=20,
        choices=(("birth","Birth"),("death","Death"),("marriage","Marriage"))
    )

    # Citizen info for registration (child/spouse/etc)
    citizen_first_name = models.CharField(max_length=100)
    citizen_middle_name = models.CharField(max_length=100, blank=True, null=True)
    citizen_last_name = models.CharField(max_length=100)
    dob = models.DateField()
    gender = models.CharField(max_length=1, choices=[("M","Male"),("F","Female")])

    # Parent verification for Birth or next-of-kin for other forms
    mother_id_number = models.CharField(max_length=20)
    father_id_number = models.CharField(max_length=20, blank=True, null=True)
    mother_verified = models.BooleanField(default=False)
    father_verified = models.BooleanField(default=False)

    initiated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="initiated_requests"
    )
    verified_by_chief = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="verified_requests"
    )
    chief_verification_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="pending_verification")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def verify_parents(self, mother_ok: bool, father_ok: bool = True, chief_user=None):
        self.mother_verified = mother_ok
        self.father_verified = father_ok
        self.verified_by_chief = chief_user
        self.chief_verification_date = timezone.now()

        if self.mother_verified and (not self.father_id_number or self.father_verified):
            self.status = "pending_nrb"

        self.save()

    def save(self, *args, **kwargs):
        if not self.reference_number:
            now_str = timezone.now().strftime("%Y%m%d%H%M%S")
            self.reference_number = f"REQ-{self.registration_type[:3].upper()}-{now_str}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference_number} - {self.citizen_first_name} {self.citizen_last_name}"


# ---------- Birth Registration ----------
class BirthRegistration(models.Model):
    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.OneToOneField(
        Citizen,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="birth_record"
    )
    mother = models.ForeignKey(
        Citizen,
        on_delete=models.PROTECT,
        related_name="births_as_mother"
    )
    father = models.ForeignKey(
        Citizen,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="births_as_father"
    )
    place_of_birth = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=[("M","Male"),("F","Female")])
    initiated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="births_initiated"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    reference_number = models.CharField(max_length=30, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.reference_number:
            now_str = timezone.now().strftime("%Y%m%d%H%M%S")
            self.reference_number = f"BIRTH-{now_str}"
        super().save(*args, **kwargs)

    def approve(self):
        self.status = "approved"
        self.approved_at = timezone.now()
        self.child.is_alive = True
        self.child.save()
        self.save()


# ---------- Death Registration ----------
class DeathRegistration(models.Model):
    STATUS_CHOICES = (
        ("submitted", "Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    citizen = models.ForeignKey(
        Citizen,
        on_delete=models.PROTECT,
        related_name="death_records"
    )
    date_of_death = models.DateField()
    place_of_death = models.CharField(max_length=255)
    cause_of_death = models.TextField(blank=True)
    initiated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    reference_number = models.CharField(max_length=30, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    approved_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.reference_number:
            now_str = timezone.now().strftime("%Y%m%d%H%M%S")
            self.reference_number = f"DEATH-{now_str}"
        super().save(*args, **kwargs)

    def approve(self):
        self.status = "approved"
        self.approved_at = timezone.now()
        self.citizen.is_alive = False
        self.citizen.date_of_death = self.date_of_death
        self.citizen.save()
        self.save()


# ---------- Marriage Registration ----------
class MarriageRegistration(models.Model):
    STATUS_CHOICES = (
        ("submitted", "Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    spouse_1 = models.ForeignKey(
        Citizen,
        on_delete=models.PROTECT,
        related_name="marriages_as_spouse1"
    )
    spouse_2 = models.ForeignKey(
        Citizen,
        on_delete=models.PROTECT,
        related_name="marriages_as_spouse2"
    )
    date_of_marriage = models.DateField()
    place_of_marriage = models.CharField(max_length=255)
    initiated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    reference_number = models.CharField(max_length=30, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    approved_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.reference_number:
            now_str = timezone.now().strftime("%Y%m%d%H%M%S")
            self.reference_number = f"MARR-{now_str}"
        super().save(*args, **kwargs)

    def approve(self):
        self.status = "approved"
        self.approved_at = timezone.now()
        self.save()
