# nga0_core/apps/geography/management/commands/import_country.py
import os
import json
from django.core.management.base import BaseCommand
from ngao_core.apps.geography.models import Area 
from django.contrib.gis.geos import GEOSGeometry

class Command(BaseCommand):
    help = "Import Kenya country geometry from adm0.geojson"

    def handle(self, *args, **kwargs):
        # Path to GeoJSON file relative to this command
        geojson_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),  # management/commands
            "..", "..", "adm0.geojson"  # up to geography folder
        )
        geojson_path = os.path.abspath(geojson_path)
        if not os.path.exists(geojson_path):
            self.stdout.write(self.style.ERROR(f"GeoJSON file not found at {geojson_path}"))
            return

        self.stdout.write(self.style.SUCCESS(f"Using GeoJSON file: {geojson_path}"))

        # Load GeoJSON
        with open(geojson_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Inspect the first feature properties to see key names
        first_props = data["features"][0]["properties"]
        self.stdout.write(self.style.WARNING(f"Sample feature properties: {first_props}"))

        # Determine the correct key for the country name
        possible_keys = ["NAME_0", "ADMIN", "name", "COUNTRY"]
        key_name = next((k for k in possible_keys if k in first_props), None)
        if not key_name:
            self.stdout.write(self.style.ERROR("Could not find a suitable key for country name."))
            return  

        # Create or update country Area
        for feature in data["features"]:
            country_name = feature["properties"].get(key_name)
            if not country_name: 
                self.stdout.write(self.style.WARNING("Skipping feature with missing country name"))
                continue

            geom = GEOSGeometry(json.dumps(feature["geometry"]))
            
            obj, created = Area.objects.update_or_create(
                name=country_name,
                area_type="country",
                defaults={"code": "KE", "boundary": geom},
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created country: {country_name}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Updated country: {country_name}"))

        self.stdout.write(self.style.SUCCESS("Country import completed!"))
