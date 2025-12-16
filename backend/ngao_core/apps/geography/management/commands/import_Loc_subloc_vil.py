from django.core.management.base import BaseCommand
from ngao_core.apps.geography.models import Area

class Command(BaseCommand):
    help = "Pre-create Locations, Sub-Locations, and Villages (codes only, no geometry)"

    def handle(self, *args, **kwargs):
        created_count = 0

        # Example hierarchy structure
        # {Division Name: {Location Name: {Sub-Location Name: [Villages]}}}
        hierarchy = {
            "Kabarnet": {
                "LocationA": {
                    "SubLoc1": ["Village1", "Village2"],
                    "SubLoc2": ["Village3"]
                },
                "LocationB": {
                    "SubLoc3": ["Village4"]
                }
            },
            "Marigat": {
                "LocationC": {
                    "SubLoc4": ["Village5"]
                }
            }
            # Add more divisions
        }

        for division_name, locations in hierarchy.items():
            division = Area.objects.filter(area_type="division", name=division_name).first()
            if not division:
                self.stdout.write(self.style.WARNING(f"Division not found: {division_name}"))
                continue

            for loc_idx, (location_name, sublocs) in enumerate(locations.items(), start=1):
                loc_code = f"{division.code}-{str(loc_idx).zfill(3)}"
                location_obj, created = Area.objects.update_or_create(
                    name=location_name,
                    area_type="location",
                    parent=division,
                    defaults={"code": loc_code}
                )
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"Created Location: {location_name} ({loc_code})"))

                for subloc_idx, (subloc_name, villages) in enumerate(sublocs.items(), start=1):
                    subloc_code = f"{loc_code}-{str(subloc_idx).zfill(3)}"
                    subloc_obj, created = Area.objects.update_or_create(
                        name=subloc_name,
                        area_type="sub_location",
                        parent=location_obj,
                        defaults={"code": subloc_code}
                    )
                    if created:
                        created_count += 1
                        self.stdout.write(self.style.SUCCESS(f"Created Sub-Location: {subloc_name} ({subloc_code})"))

                    for village_idx, village_name in enumerate(villages, start=1):
                        village_code = f"{subloc_code}-{str(village_idx).zfill(3)}"
                        village_obj, created = Area.objects.update_or_create(
                            name=village_name,
                            area_type="village",
                            parent=subloc_obj,
                            defaults={"code": village_code}
                        )
                        if created:
                            created_count += 1
                            self.stdout.write(self.style.SUCCESS(f"Created Village: {village_name} ({village_code})"))

        self.stdout.write(self.style.SUCCESS(f"Import completed. Total created: {created_count}"))
