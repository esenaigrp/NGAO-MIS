import sys
from django.core.management.base import BaseCommand
from ngao_core.apps.geography.models import Area

class Command(BaseCommand):
    help = "Normalize sub-county codes based on parent county codes"

    def handle(self, *args, **kwargs):
        sub_counties = Area.objects.filter(area_type="sub_county")
        updated_count = 0
        skipped_count = 0

        for sub in sub_counties:
            parent_county = sub.parent
            if not parent_county or not parent_county.code:
                self.stdout.write(self.style.WARNING(
                    f"Skipping {sub.name}: parent county missing or has no code"
                ))
                skipped_count += 1
                continue

            # Generate sub-county index based on siblings
            siblings = Area.objects.filter(
                area_type="sub_county",
                parent=parent_county
            ).order_by("name")

            index = list(siblings).index(sub) + 1
            sub_code = f"{parent_county.code}-{str(index).zfill(2)}"

            if sub.code != sub_code:
                sub.code = sub_code
                sub.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f"Updated {sub.name} -> {sub_code}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"Sub-county normalization completed. Updated: {updated_count}, Skipped: {skipped_count}"
        ))
