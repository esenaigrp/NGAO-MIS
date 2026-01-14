import os
import json
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry
from ngao_core.apps.geography.models import Area

class Command(BaseCommand):
    help = "Import Villages from NGAO adm-villages.geojson with serialized codes"

    def handle(self, *args, **kwargs):

        geojson_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "..", "adm-villages.geojson"
        )
        geojson_path = os.path.abspath(geojson_path)

        if not os.path.exists(geojson_path):
            self.stdout.write(self.style.ERROR(f"adm-villages.geojson not found at {geojson_path}"))
            return

        self.stdout.write(self.style.SUCCESS(f"Using GeoJSON file: {geojson_path}"))

        created_count = 0
        skipped_count = 0

        for feature in json.load(open(geojson_path, "r", encoding="utf-8")).get("features", []):
            village_name = feature.get("properties", {}).get("NAME_6")
            subloc_name = feature.get("properties", {}).get("NAME_5")

            if not village_name or not subloc_name:
                self.stdout.write(self.style.WARNING("Skipping feature with missing village or sub-location"))
                skipped_count += 1
                continue

            parent_subloc = Area.objects.filter(
                area_type="sub_location",
                name__iexact=subloc_name
            ).first()

            if not parent_subloc:
                self.stdout.write(self.style.WARNING(f"Sub-Location not found for village {village_name}: {subloc_name}"))
                skipped_count += 1
                continue

            try:
                geom = GEOSGeometry(json.dumps(feature.get("geometry")))
            except Exception:
                geom = None

            existing = Area.objects.filter(parent=parent_subloc, area_type="village")
            serial_number = existing.count() + 1
            code = f"{parent_subloc.code}-{serial_number:03d}"

            while Area.objects.filter(code=code).exists():
                serial_number += 1
                code = f"{parent_subloc.code}-{serial_number:03d}"

            obj, created = Area.objects.update_or_create(
                name=village_name,
                area_type="village",
                parent=parent_subloc,
                defaults={"boundary": geom, "code": code}
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created Village: {village_name} ({code})"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Updated Village: {village_name} ({code})"))

        self.stdout.write(self.style.SUCCESS(f"Villages import completed! Created: {created_count}, Skipped: {skipped_count}"))
