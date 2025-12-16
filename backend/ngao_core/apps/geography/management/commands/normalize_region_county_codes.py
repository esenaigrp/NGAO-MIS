from django.core.management.base import BaseCommand
from django.db import transaction
from ngao_core.apps.geography.models import Area
from ngao_core.apps.geography.constants.kenya_admin_codes import (
    REGION_CODES,
    COUNTY_CODES,
)

def normalize(name: str) -> str:
    return (
        name.lower()
        .replace("county", "")
        .replace("-", "")
        .replace(" ", "")
        .replace("'", "")
    )

class Command(BaseCommand):
    help = "Normalize NGAO region and county codes (KE-XX-YYY)"

    @transaction.atomic
    def handle(self, *args, **kwargs):
        try:
            kenya = Area.objects.get(area_type="country", name="Kenya")
        except Area.DoesNotExist:
            self.stdout.write(self.style.ERROR("Kenya country not found"))
            return

        # ---------- REGIONS ----------
        for region_name, region_code in REGION_CODES.items():
            try:
                region = Area.objects.get(
                    area_type="region",
                    parent=kenya,
                    name=region_name
                )
            except Area.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Missing region: {region_name}"))
                continue

            region.code = f"KE-{region_code}"
            region.save(update_fields=["code"])
            self.stdout.write(self.style.SUCCESS(f"Region normalized: {region.code}"))

        # ---------- COUNTIES ----------
        counties_in_db = Area.objects.filter(area_type="county")

        county_lookup = {
            normalize(c.name): c
            for c in counties_in_db
        }

        for official_name, county_code in COUNTY_CODES.items():
            key = normalize(official_name)

            county = county_lookup.get(key)
            if not county:
                self.stdout.write(
                    self.style.WARNING(f"County not matched: {official_name}")
                )
                continue

            region = county.parent
            if not region or not region.code:
                self.stdout.write(
                    self.style.ERROR(f"County without valid region: {county.name}")
                )
                continue

            county.code = f"{region.code}-{county_code}"
            county.save(update_fields=["code"])

            self.stdout.write(
                self.style.SUCCESS(f"County normalized: {county.name} → {county.code}")
            )

        self.stdout.write(
            self.style.SUCCESS("Region & County normalization completed successfully")
        )
