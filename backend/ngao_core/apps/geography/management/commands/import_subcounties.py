import os
import json
from decimal import Decimal
from collections import defaultdict
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry, MultiPolygon
from django.db import transaction
from ngao_core.apps.geography.models import Area


class Command(BaseCommand):
    help = "Import Sub-Counties (adm2.geojson) with hierarchical NGAO codes"

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing sub-counties before import'
        )
        parser.add_argument(
            '--skip-boundaries',
            action='store_true',
            help='Skip importing boundary geometries (faster)'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        skip_boundaries = options['skip_boundaries']

        # -------------------------
        # Helper function
        # -------------------------
        def normalize(name):
            """Normalize name for matching"""
            if not name:
                return ""
            return (
                name.replace("-", "")
                .replace("'", "")
                .replace(" ", "")
                .lower()
            )

        # -------------------------
        # Clear if requested
        # -------------------------
        if options['clear']:
            count = Area.objects.filter(area_type="sub_county").count()
            Area.objects.filter(area_type="sub_county").delete()
            self.stdout.write(self.style.WARNING(f"Cleared {count} existing sub-counties\n"))

        # -------------------------
        # Load parent counties
        # -------------------------
        counties = {
            normalize(c.name): c
            for c in Area.objects.filter(area_type="county")
        }

        if not counties:
            self.stdout.write(
                self.style.ERROR("No counties found. Import counties first (level 1).")
            )
            return

        self.stdout.write(
            self.style.SUCCESS(f"Loaded {len(counties)} counties as parents\n")
        )

        # -------------------------
        # GeoJSON path
        # -------------------------
        geojson_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "..", "..", "adm2.geojson"
            )
        )

        if not os.path.exists(geojson_path):
            self.stdout.write(
                self.style.ERROR(f"adm2.geojson not found at {geojson_path}")
            )
            return

        self.stdout.write(self.style.SUCCESS(f"Using GeoJSON file: {geojson_path}"))

        with open(geojson_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        features = data.get("features", [])
        self.stdout.write(f"Found {len(features)} features to import\n")

        # Show sample properties
        if features:
            first_props = features[0]['properties']
            self.stdout.write(
                self.style.WARNING(
                    f"Sample properties: {json.dumps(first_props, indent=2)}\n"
                )
            )

        # -------------------------
        # Serial counters per County
        # -------------------------
        subcounty_counters = defaultdict(int)

        # -------------------------
        # Import Sub-Counties
        # -------------------------
        created_count = 0
        updated_count = 0
        error_count = 0

        for idx, feature in enumerate(features, 1):
            props = feature.get("properties", {})

            # Get sub-county name (NAME_2)
            subcounty_name = (
                props.get("NAME_2") or
                props.get("SUBCOUNTY") or
                props.get("NAME")
            )

            # Get parent county name (NAME_1)
            county_name = (
                props.get("NAME_1") or
                props.get("COUNTY")
            )

            if not subcounty_name or not county_name:
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipping feature {idx} with missing names"
                    )
                )
                error_count += 1
                continue

            # Find parent county
            county_key = normalize(county_name)
            county = counties.get(county_key)

            if not county:
                self.stdout.write(
                    self.style.WARNING(
                        f"County '{county_name}' not found for sub-county: {subcounty_name}"
                    )
                )
                error_count += 1
                continue

            # Increment serial for this county
            subcounty_counters[county.id] += 1
            serial = subcounty_counters[county.id]

            # Generate NGAO code: COUNTY_CODE-SERIAL
            subcounty_code = f"{county.code}-{serial:02}"

            # Process geometry
            boundary = None
            latitude = None
            longitude = None

            if not skip_boundaries and feature.get("geometry"):
                try:
                    geom = GEOSGeometry(json.dumps(feature["geometry"]))
                    
                    if geom.geom_type == 'Polygon':
                        boundary = MultiPolygon(geom)
                    elif geom.geom_type == 'MultiPolygon':
                        boundary = geom
                    
                    if boundary:
                        centroid = boundary.centroid
                        latitude = Decimal(str(centroid.y))
                        longitude = Decimal(str(centroid.x))

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f"Error processing geometry for {subcounty_name}: {str(e)}"
                        )
                    )

            # Create or update sub-county
            try:
                obj, created = Area.objects.update_or_create(
                    name=subcounty_name,
                    area_type="sub_county",
                    parent=county,
                    defaults={
                        "code": subcounty_code,
                        "boundary": boundary,
                        "latitude": latitude,
                        "longitude": longitude,
                    },
                )

                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Created: {subcounty_name} ({subcounty_code}) under {county.name}"
                        )
                    )
                else:
                    updated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Updated: {subcounty_name} ({subcounty_code})"
                        )
                    )

                # Progress update every 50 records
                if idx % 50 == 0:
                    self.stdout.write(f"Progress: {idx}/{len(features)}...")

            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f"Error saving {subcounty_name}: {str(e)}"
                    )
                )

        # -------------------------
        # Summary
        # -------------------------
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('IMPORT COMPLETED'))
        self.stdout.write('='*60)
        self.stdout.write(f"Created:  {created_count}")
        self.stdout.write(f"Updated:  {updated_count}")
        self.stdout.write(f"Errors:   {error_count}")
        self.stdout.write(f"Total:    {created_count + updated_count}")
        self.stdout.write('='*60)

        # Show total count in database
        total_subcounties = Area.objects.filter(area_type="sub_county").count()
        self.stdout.write(f"\nTotal sub-counties in database: {total_subcounties}\n")
