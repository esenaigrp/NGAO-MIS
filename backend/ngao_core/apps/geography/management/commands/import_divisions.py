import os
import json
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry
from ngao_core.apps.geography.models import Area

class Command(BaseCommand):
    help = "Import NGAO divisions from adm3.geojson with serialized codes"

    def handle(self, *args, **kwargs):

        # Helper to normalize names
        def normalize_name(name):
            return name.replace("-", "").replace(" ", "").replace("'", "").lower()

        # Path to adm3.geojson
        geojson_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "..", "adm3.geojson"
        )
        geojson_path = os.path.abspath(geojson_path)

        if not os.path.exists(geojson_path):
            self.stdout.write(self.style.ERROR(f"adm3.geojson not found at {geojson_path}"))
            return

        self.stdout.write(self.style.SUCCESS(f"Using GeoJSON file: {geojson_path}"))

        with open(geojson_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        created_count = 0
        skipped_count = 0

        for feature in data.get("features", []):
            division_name = feature.get("properties", {}).get("NAME_3")
            subcounty_name = feature.get("properties", {}).get("NAME_2")

            if not division_name or not subcounty_name:
                self.stdout.write(self.style.WARNING(
                    "Skipping feature with missing division or sub-county name"
                ))
                skipped_count += 1
                continue

            # Handle possible duplicate sub-counties
            subcounties = Area.objects.filter(
                area_type="sub_county",
                name__iexact=subcounty_name
            )

            if subcounties.count() == 0:
                self.stdout.write(self.style.WARNING(
                    f"Sub-county not found for division {division_name}: {subcounty_name}"
                ))
                skipped_count += 1
                continue
            elif subcounties.count() > 1:
                parent_subcounty = subcounties.first()
                self.stdout.write(self.style.WARNING(
                    f"Multiple sub-counties found for division {division_name}: {subcounty_name}. Using {parent_subcounty.name}."
                ))
            else:
                parent_subcounty = subcounties.first()

            # Handle geometry
            try:
                geom = GEOSGeometry(json.dumps(feature.get("geometry")))
            except Exception:
                geom = None
                self.stdout.write(self.style.WARNING(f"No valid geometry for division {division_name}"))

            # Generate serialized code for division under sub-county
            existing_divisions = Area.objects.filter(parent=parent_subcounty, area_type="division")
            serial_number = existing_divisions.count() + 1
            code = f"{parent_subcounty.code}-{serial_number:03d}"  # e.g., SUB-001

            # Ensure unique code
            while Area.objects.filter(code=code).exists():
                serial_number += 1
                code = f"{parent_subcounty.code}-{serial_number:03d}"

            obj, created = Area.objects.update_or_create(
                name=division_name,
                area_type="division",
                parent=parent_subcounty,
                defaults={"boundary": geom, "code": code}
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created division: {division_name} with code {code}"))
                created_count += 1
            else:
                self.stdout.write(self.style.SUCCESS(f"Updated division: {division_name} with code {code}"))

        self.stdout.write(self.style.SUCCESS(
            f"Divisions import completed! Created: {created_count}, Skipped: {skipped_count}"
        ))
