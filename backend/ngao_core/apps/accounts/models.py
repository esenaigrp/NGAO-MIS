import uuid
from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
)
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

# -------------------------
# Validators
# -------------------------
PHONE_VALIDATOR = RegexValidator(
    regex=r"^\+?[0-9]{7,15}$",
    message="Phone number must be in format '+254...' and contain 7-15 digits.",
)

# -------------------------
# User Manager
# -------------------------
class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields["is_staff"]:
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields["is_superuser"]:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)

# -------------------------
# Role Model
# -------------------------
class Role(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    hierarchy_level = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("hierarchy_level", "name")

    def __str__(self):
        return self.name

# -------------------------
# Custom User Model
# -------------------------
class CustomUser(AbstractBaseUser, PermissionsMixin):

    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # Unique related_names to avoid clashes
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        help_text=_('The groups this user belongs to.'),
        related_name="custom_user_groups",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name="custom_user_permissions",
        related_query_name="custom_user_permission",
    )

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ("email",)

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return self.email

    @property
    def id(self):
        return self.user_id

# -------------------------
# Officer Profile
# -------------------------
class OfficerProfile(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="officer_profile",
    )

    phone = models.CharField(max_length=20, validators=[PHONE_VALIDATOR], unique=True)
    otp_code = models.CharField(max_length=6)
    otp_created_at = models.DateTimeField(default=timezone.now)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, related_name="officers")
    role_text = models.CharField(max_length=120)
    badge_number = models.CharField(max_length=50, unique=True)
    id_number = models.CharField(max_length=50, unique=True)
    office_email = models.EmailField()
    location = gis_models.PointField(default=Point(0.0, 0.0))
    admin_unit = models.ForeignKey(
        "admin_structure.AdminUnit",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="officers",
    )
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    reset_otp = models.CharField(max_length=6, null=True, blank=True)
    otp_expiry = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["badge_number"]),
            models.Index(fields=["id_number"]),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.role_text}"

# -------------------------
# Contact Point
# -------------------------
class ContactPoint(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="contact_points")
    type = models.CharField(
        max_length=20,
        choices=[("phone", "phone"), ("email", "email"), ("other", "other")],
        default="phone",
    )
    value = models.CharField(max_length=255)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "type", "value")

# -------------------------
# OTP Model
# -------------------------
class OTP(models.Model):
    phone = models.CharField(max_length=32, db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"OTP for {self.phone}: {self.code}"

# -------------------------
# Device Registration Model
# -------------------------
class Device(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="devices"
    )
    device_id = models.CharField(max_length=255, unique=True)
    device_name = models.CharField(max_length=100, blank=True)
    is_trusted = models.BooleanField(default=False)
    last_ip = models.GenericIPAddressField(blank=True, null=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_devices'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    allowed_lat = models.FloatField(null=True, blank=True)
    allowed_lon = models.FloatField(null=True, blank=True)
    allowed_radius_meters = models.FloatField(default=100)

    def __str__(self):
        return f"{self.device_name or self.device_id} ({'Trusted' if self.is_trusted else 'Pending'})"

class DeviceApprovalRequest(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("approved", "Approved"), ("denied", "Denied")],
        default="pending"
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='device_requests'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='device_approvals'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
