from django.core.management.base import BaseCommand
from django.db import transaction
from ngao_core.apps.geography.models import Area

class Command(BaseCommand):
    help = "Normalize NGAO division codes to KE-XX-YYY-ZZZ-AAA format"

    @transaction.atomic
    def handle(self, *args, **kwargs):

        subcounties = (
            Area.objects
            .filter(area_type="subcounty")
            .select_related("parent")
        )

        for subcounty in subcounties:
            if not subcounty.code or not subcounty.code.startswith("KE-"):
                self.stdout.write(
                    self.style.WARNING(f"Skipping sub-county without valid code: {subcounty.name}")
                )
                continue

            divisions = (
                Area.objects
                .filter(area_type="division", parent=subcounty)
                .order_by("name")
            )

            if not divisions.exists():
                continue

            for index, division in enumerate(divisions, start=1):
                serial = str(index).zfill(3)
                new_code = f"{subcounty.code}-{serial}"

                if division.code != new_code:
                    division.code = new_code
                    division.save(update_fields=["code"])

                self.stdout.write(
                    self.style.SUCCESS(f"{division.name} → {new_code}")
                )

        self.stdout.write(
            self.style.SUCCESS("Division normalization completed successfully")
        )
