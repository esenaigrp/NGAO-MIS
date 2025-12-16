import os
import json
from collections import defaultdict
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry
from ngao_core.apps.geography.models import Area


class Command(BaseCommand):
    help = "Import NGAO Divisions (adm3.geojson) with full hierarchical NGAO codes"

    def handle(self, *args, **kwargs):

        # -------------------------
        # Helpers
        # -------------------------
        def normalize(name):
            if not name:
                return ""
            return (
                name.replace("-", "")
                .replace("'", "")
                .replace(" ", "")
                .lower()
            )

        # -------------------------
        # Load parents
        # -------------------------
        subcounties = {
            normalize(sc.name): sc
            for sc in Area.objects.filter(area_type="subcounty")
        }

        if not subcounties:
            self.stdout.write(self.style.ERROR("No sub-counties found. Import sub-counties first."))
            return

        # -------------------------
        # GeoJSON path
        # -------------------------
        geojson_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "..", "..", "adm3.geojson"
            )
        )

        if not os.path.exists(geojson_path):
            self.stdout.write(self.style.ERROR(f"adm3.geojson not found at {geojson_path}"))
            return

        self.stdout.write(self.style.SUCCESS(f"Using GeoJSON file: {geojson_path}"))

        with open(geojson_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # -------------------------
        # Serial counters per Sub-County
        # -------------------------
        division_counters = defaultdict(int)

        # -------------------------
        # Import Divisions
        # -------------------------
        for feature in data["features"]:
            props = feature.get("properties", {})

            division_name = (
                props.get("NAME_3")
                or props.get("DIVISION")
                or props.get("NAME")
            )

            subcounty_name = (
                props.get("NAME_2")
                or props.get("SUBCOUNTY")
            )

            if not division_name or not subcounty_name:
                self.stdout.write(self.style.WARNING("Skipping feature with missing names"))
                continue

            subcounty_key = normalize(subcounty_name)
            subcounty = subcounties.get(subcounty_key)

            if not subcounty:
                self.stdout.write(
                    self.style.WARNING(f"Sub-county not found for division: {division_name}")
                )
                continue

            # Increment serial for this sub-county
            division_counters[subcounty.id] += 1
            serial = division_counters[subcounty.id]

            # Full NGAO code
            division_code = f"{subcounty.code}-{serial:02}"

            geom = GEOSGeometry(json.dumps(feature["geometry"]))

            obj, created = Area.objects.update_or_create(
                name=division_name,
                area_type="division",
                parent=subcounty,
                defaults={
                    "code": division_code,
                    "boundary": geom,
                },
            )

            if created:
                self.stdout.write(self.style.SUCCESS(
                    f"Created division: {division_name} ({division_code})"
                ))
            else:
                self.stdout.write(self.style.SUCCESS(
                    f"Updated division: {division_name} ({division_code})"
                ))

        self.stdout.write(self.style.SUCCESS("Divisions import completed successfully!"))
