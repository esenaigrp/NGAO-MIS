import os
import json
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry
from ngao_core.apps.geography.models import Area

class Command(BaseCommand):
    help = "Import Sub-Locations from NGAO adm-sublocations.geojson with serialized codes"

    def handle(self, *args, **kwargs):

        geojson_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "..", "adm-sublocations.geojson"
        )
        geojson_path = os.path.abspath(geojson_path)

        if not os.path.exists(geojson_path):
            self.stdout.write(self.style.ERROR(f"adm-sublocations.geojson not found at {geojson_path}"))
            return

        created_count = 0
        skipped_count = 0

        for feature in json.load(open(geojson_path, "r", encoding="utf-8")).get("features", []):
            subloc_name = feature.get("properties", {}).get("NAME_5")
            location_name = feature.get("properties", {}).get("NAME_4")

            if not subloc_name or not location_name:
                self.stdout.write(self.style.WARNING("Skipping feature with missing sub-location or location"))
                skipped_count += 1
                continue

            parent_location = Area.objects.filter(
                area_type="location",
                name__iexact=location_name
            ).first()

            if not parent_location:
                self.stdout.write(self.style.WARNING(f"Location not found for sub-location {subloc_name}: {location_name}"))
                skipped_count += 1
                continue

            try:
                geom = GEOSGeometry(json.dumps(feature.get("geometry")))
                if geom.geom_type == 'Polygon':
                    geom = GEOSGeometry(json.dumps({
                        "type": "MultiPolygon",
                        "coordinates": [geom.coords]
                    }))
            except Exception:
                geom = None
                self.stdout.write(self.style.WARNING(f"No valid geometry for sub-location {subloc_name}"))

            existing = Area.objects.filter(parent=parent_location, area_type="sub_location")
            serial_number = existing.count() + 1
            code = f"{parent_location.code}-{serial_number:03d}"

            while Area.objects.filter(code=code).exists():
                serial_number += 1
                code = f"{parent_location.code}-{serial_number:03d}"

            obj, created = Area.objects.update_or_create(
                name=subloc_name,
                area_type="sub_location",
                parent=parent_location,
                defaults={"boundary": geom, "code": code}
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created Sub-Location: {subloc_name} ({code})"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Updated Sub-Location: {subloc_name} ({code})"))

        self.stdout.write(self.style.SUCCESS(f"Sub-Locations import completed! Created: {created_count}, Skipped: {skipped_count}"))
