import os
import json
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry
from ngao_core.apps.geography.models import Area

class Command(BaseCommand):
    help = "Import Locations from NGAO adm4.geojson with serialized codes"

    def handle(self, *args, **kwargs):

        geojson_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "..", "adm-locations.geojson"
        )
        geojson_path = os.path.abspath(geojson_path)

        if not os.path.exists(geojson_path):
            self.stdout.write(self.style.ERROR(f"adm-locations.geojson not found at {geojson_path}"))
            return

        self.stdout.write(self.style.SUCCESS(f"Using GeoJSON file: {geojson_path}"))

        created_count = 0
        skipped_count = 0

        for feature in json.load(open(geojson_path, "r", encoding="utf-8")).get("features", []):
            location_name = feature.get("properties", {}).get("NAME_4")
            division_name = feature.get("properties", {}).get("NAME_3")

            if not location_name or not division_name:
                self.stdout.write(self.style.WARNING("Skipping feature with missing location or division"))
                skipped_count += 1
                continue

            parent_division = Area.objects.filter(
                area_type="division",
                name__iexact=division_name
            ).first()

            if not parent_division:
                self.stdout.write(self.style.WARNING(f"Division not found for location {location_name}: {division_name}"))
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
                self.stdout.write(self.style.WARNING(f"No valid geometry for location {location_name}"))

            existing = Area.objects.filter(parent=parent_division, area_type="location")
            serial_number = existing.count() + 1
            code = f"{parent_division.code}-{serial_number:03d}"

            while Area.objects.filter(code=code).exists():
                serial_number += 1
                code = f"{parent_division.code}-{serial_number:03d}"

            obj, created = Area.objects.update_or_create(
                name=location_name,
                area_type="location",
                parent=parent_division,
                defaults={"boundary": geom, "code": code}
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created Location: {location_name} ({code})"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Updated Location: {location_name} ({code})"))

        self.stdout.write(self.style.SUCCESS(f"Locations import completed! Created: {created_count}, Skipped: {skipped_count}"))
