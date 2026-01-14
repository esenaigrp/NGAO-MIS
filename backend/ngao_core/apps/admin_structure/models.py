# ngao_core/apps/admin_structure/models.py

import uuid

from django.contrib.gis.db import models as geomodels
from django.contrib.gis.geos import GEOSGeometry, Point
from django.contrib.gis.db.models.functions import Centroid

from django.contrib.postgres.indexes import BrinIndex
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.db import models

from ngao_core.apps.accounts.models import CustomUser


# =========================================================
# ADMIN UNIT HIERARCHY
# =========================================================
class UnitLevel(models.TextChoices):
    CS = "CS", _("Cabinet Secretary")
    PS = "PS", _("Principal Secretary")
    RC = "RC", _("Region")
    CC = "CC", _("County")
    DCC = "DCC", _("Sub-County")
    ACC = "ACC", _("Division")
    CHIEF = "CHIEF", _("Location")
    ASST_CHIEF = "ASST_CHIEF", _("Sub-Location")
    WARD = "WARD", _("Ward")
    LOCATION = "LOCATION", _("Location")
    SUB_LOCATION = "SUB_LOCATION", _("Sub-location")


level = models.CharField(
    max_length=24, choices=UnitLevel.choices, default=UnitLevel.LOCATION
)

parent = models.ForeignKey(
    "self",
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name="children",
)

# Main polygon for mapping
geometry = geomodels.GeometryField(
    null=True,
    blank=True,
    srid=4326,
    help_text="GeoJSON polygon/multipolygon for administrative boundary",
)

# Auto-calculated centroid point
centroid = geomodels.PointField(
    null=True,
    blank=True,
    srid=4326,
    help_text="Automatically generated centroid of the geometry",
)
id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
notes = models.TextField(blank=True, null=True)
created_at = models.DateTimeField(default=timezone.now)


class Meta:
    verbose_name = "Administrative Unit"
    verbose_name_plural = "Administrative Units"
    ordering = ("level", "name")
    indexes = [
        models.Index(fields=["code"]),
        BrinIndex(fields=["created_at"]),
    ]


def __str__(self):
    return f"{self.name} ({self.get_level_display()})"


# -----------------------------
# VALIDATION LOGIC
# -----------------------------
def clean(self):
    # Ensure polygon is valid GeoJSON
    if self.geometry:
        try:
            if isinstance(self.geometry, str):
                self.geometry = GEOSGeometry(self.geometry)

            if not self.geometry.valid:
                raise ValidationError("Geometry is not a valid polygon.")
        except Exception as e:
            raise ValidationError(f"Invalid geometry: {e}")


# ----------------------------------------------
# SAVE HOOK – auto compute centroid from polygon
# ----------------------------------------------
def save(self, *args, **kwargs):
    if self.geometry:
        try:
            # Compute centroid as GEOSGeometry object
            centroid_geom = self.geometry.centroid

            # Convert to actual Point for frontend mapping
            self.centroid = Point(
                centroid_geom.x, centroid_geom.y, srid=self.geometry.srid
            )
        except Exception:
            pass

    super().save(*args, **kwargs)


class AdminUnit(models.Model):
    """
    Administrative Unit forming the NGAO hierarchy.
    Supports PostGIS geometry for mapping.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=255,
        help_text="Official name of unit (e.g., Nairobi County)",
    )

    code = models.CharField(
        max_length=64,
        unique=True,
        blank=True,
        null=True,
        help_text="Optional unit code (e.g., KE-47-001)",
    )

    level = models.CharField(
        max_length=24,
        choices=UnitLevel.choices,
        default=UnitLevel.LOCATION,
    )

    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="children",
        help_text="Parent administrative unit.",
    )

    # Geometry can be Point, Polygon or MultiPolygon
    geometry = geomodels.GeometryField(
        null=True,
        blank=True,
        srid=4326,
        help_text="Polygon or point for administrative boundary/location.",
    )

    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Administrative Unit"
        verbose_name_plural = "Administrative Units"
        ordering = ("level", "name")
        indexes = [
            models.Index(fields=["code"]),
            BrinIndex(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.name}"


# =========================================================
# SIMPLE LOCATION MODEL (IF STILL NEEDED)
# =========================================================
class Location(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    geometry = geomodels.PolygonField(
        blank=True,
        null=True,
        help_text="Optional polygon for the administrative boundary",
        srid=4326,
    )

    def __str__(self):
        return self.name
