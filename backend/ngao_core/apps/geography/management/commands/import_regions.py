# nga0_core/apps/geography/management/commands/import_regions.py
import os
import json
from django.core.management.base import BaseCommand
from ngao_core.apps.geography.models import Area
from django.contrib.gis.geos import GEOSGeometry

# NGAO Regions and their codes
REGION_CODES = {
    "Nairobi Region": "01",
    "Central Region": "02",
    "Rift Valley Region": "03",
    "Nyanza Region": "04",
    "Coast Region": "05",
    "Eastern Region": "06",
    "North Eastern Region": "07",
    "Western Region": "08",
}

# Counties per region
REGIONS = {
    "Nairobi Region": ["Nairobi County"],
    "Central Region": ["Kiambu County", "Murang'a County", "Nyeri County", "Kirinyaga County", "Nyandarua County"],
    "Coast Region": ["Mombasa County", "Kwale County", "Kilifi County", "Tana River County", "Lamu County", "Taita Taveta County"],
    "Eastern Region": ["Machakos County", "Embu County", "Kitui County", "Meru County", "Makueni County", "Tharaka Nithi County", "Isiolo County"],
    "Rift Valley Region": ["Uasin Gishu County", "Elgeyo Marakwet County", "Nandi County", "Nakuru County", "Baringo County", "Laikipia County",
                           "Trans Nzoia County", "West Pokot County", "Samburu County", "Narok County", "Kajiado County",
                           "Turkana County", "Bomet County", "Kericho County"],
    "Western Region": ["Kakamega County", "Vihiga County", "Bungoma County", "Busia County"],
    "Nyanza Region": ["Siaya County", "Kisumu County", "Homa Bay County", "Migori County", "Kisii County", "Nyamira County"],
    "North Eastern Region": ["Garissa County", "Wajir County", "Mandera County", "Marsabit County"]
}

# NGAO county codes (001–047)
COUNTY_CODES = {
    "Mombasa County": "001",
    "Kwale County": "002",
    "Kilifi County": "003",
    "Tana River County": "004",
    "Lamu County": "005",
    "Taita Taveta County": "006",
    "Garissa County": "007",
    "Wajir County": "008",
    "Mandera County": "009",
    "Marsabit County": "010",
    "Isiolo County": "011",
    "Meru County": "012",
    "Tharaka Nithi County": "013",
    "Embu County": "014",
    "Kitui County": "015",
    "Machakos County": "016",
    "Makueni County": "017",
    "Nyandarua County": "018",
    "Nyeri County": "019",
    "Kirinyaga County": "020",
    "Murang'a County": "021",
    "Kiambu County": "022",
    "Turkana County": "023",
    "West Pokot County": "024",
    "Samburu County": "025",
    "Trans Nzoia County": "026",
    "Uasin Gishu County": "027",
    "Elgeyo Marakwet County": "028",
    "Nandi County": "029",
    "Baringo County": "030",
    "Laikipia County": "031",
    "Nakuru County": "032",
    "Narok County": "033",
    "Kajiado County": "034",
    "Kericho County": "035",
    "Bomet County": "036",
    "Kakamega County": "037",
    "Vihiga County": "038",
    "Bungoma County": "039",
    "Busia County": "040",
    "Siaya County": "041",
    "Kisumu County": "042",
    "Homa Bay County": "043",
    "Migori County": "044",
    "Kisii County": "045",
    "Nyamira County": "046",
    "Nairobi County": "047"
}


class Command(BaseCommand):
    help = "Import NGAO regions and counties from adm1.geojson"

    def handle(self, *args, **kwargs):
        # Helper to normalize county names
        def normalize_county(name):
            return name.replace("-", "").replace(" ", "").replace("County", "").lower()

        # Helper to generate unique codes
        def generate_county_code(name):
            base_code = name[:3].upper().replace("'", "")
            code = base_code
            suffix = 1
            while Area.objects.filter(code=code).exists():
                code = f"{base_code[:2]}{suffix}"
                suffix += 1
            return code

        # Load Kenya country
        try:
            kenya = Area.objects.get(area_type="country", name="Kenya")
        except Area.DoesNotExist:
            self.stdout.write(self.style.ERROR("Kenya country not found. Import the country first."))
            return

        # Import regions
        for region_name, counties in REGIONS.items():
            region_obj, created = Area.objects.update_or_create(
                name=region_name,
                area_type="region",
                parent=kenya,
                defaults={"code": region_name[:3].upper()}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created region: {region_name}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Updated region: {region_name}"))

        # Path to counties GeoJSON (adm1)
        geojson_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "..", "adm1.geojson"
        )
        geojson_path = os.path.abspath(geojson_path)

        if not os.path.exists(geojson_path):
            self.stdout.write(self.style.ERROR(f"adm1.geojson not found at {geojson_path}"))
            return

        self.stdout.write(self.style.SUCCESS(f"Using GeoJSON file: {geojson_path}"))

        with open(geojson_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Import counties and assign to regions
        for feature in data["features"]:
            county_name = feature["properties"].get("NAME_1")
            if not county_name:
                self.stdout.write(self.style.WARNING("Skipping feature with missing county name"))
                continue

            normalized_county_name = normalize_county(county_name)
            parent_region = None

            for region_name, counties in REGIONS.items():
                normalized_counties = [normalize_county(c) for c in counties]
                if normalized_county_name in normalized_counties:
                    try:
                        parent_region = Area.objects.get(name=region_name, area_type="region")
                    except Area.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"Region {region_name} not found for county {county_name}"))
                        parent_region = None
                    break

            if not parent_region:
                self.stdout.write(self.style.WARNING(f"No region mapping found for county: {county_name}. Skipping."))
                continue

            geom = GEOSGeometry(json.dumps(feature["geometry"]))
            code = generate_county_code(county_name)

            obj, created = Area.objects.update_or_create(
                name=county_name,
                area_type="county",
                parent=parent_region,
                defaults={"boundary": geom, "code": code}
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created county: {county_name}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Updated county: {county_name}"))

        self.stdout.write(self.style.SUCCESS("Regions and counties import completed!"))
