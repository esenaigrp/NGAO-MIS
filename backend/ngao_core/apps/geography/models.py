from django.contrib.gis.db import models
from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import MultiPolygon


User = settings.AUTH_USER_MODEL


class Area(models.Model):
    """
    Generic administrative unit.
    Used for Country, Region, County, etc.
    """

    AREA_TYPES = (
        ("country", "Country"),
        ("region", "Region"),
        ("county", "County"),
        ("sub_county", "Sub County"),
        ("division", "Division"),
        ("location", "Location"),
        ("sub_location", "Sub Location"),
        ("village", "Village"),
    )

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)
    area_type = models.CharField(max_length=20, choices=AREA_TYPES)

    parent = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="children"
    )

    chief = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="chief_areas"
    )

    assistant_chief = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assistant_chief_areas"
    )

    boundary = models.MultiPolygonField(
        srid=4326,
        null=True,
        blank=True,
        help_text="Administrative boundary (Leaflet-ready)"
    )

    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("parent", "name", "area_type")
        indexes = [
            models.Index(fields=["area_type"]),
            models.Index(fields=["latitude", "longitude"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_area_type_display()})"
    
    def to_geojson(self):
        """
        Returns a GeoJSON dict suitable for Leaflet.
        Includes the area itself and optionally its children.
        """
        geojson = {
            "type": "Feature",
            "properties": {
                "id": self.id,
                "name": self.name,
                "code": self.code,
                "area_type": self.area_type,
                "latitude": float(self.latitude) if self.latitude else None,
                "longitude": float(self.longitude) if self.longitude else None,
            },
            "geometry": None
        }

        if self.boundary:
            # Convert MultiPolygonField to GeoJSON
            geojson["geometry"] = GEOSGeometry(self.boundary).geojson

        return geojson
    
    def to_geojson_recursive(self):
        feature = self.to_geojson()
        children = self.children.all().order_by("name")
        if children.exists():
            feature["children"] = [child.to_geojson_recursive() for child in children]
        else:
            feature["children"] = []
        return feature