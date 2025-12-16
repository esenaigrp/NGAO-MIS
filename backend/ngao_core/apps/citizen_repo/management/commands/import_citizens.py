# nga_core/apps/citizen_repo/management/commands/import_citizens.py
import csv
from django.core.management.base import BaseCommand
from ngao_core.apps.citizen_repo.models import Citizen
from django.db import IntegrityError

class Command(BaseCommand):
    help = 'Import citizens from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            required=True,
            help='Path to the CSV file to import',
        )

    def handle(self, *args, **options):
        file_path = options['file']

        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                try:
                    citizen, created = Citizen.objects.get_or_create(
                        id_number=row['id_number'],
                        defaults={
                            'first_name': row['first_name'],
                            'middle_name': row['middle_name'],
                            'last_name': row['last_name'],
                            'gender': row['gender'],
                            'date_of_birth': row['date_of_birth'],
                            'place_of_birth': row['place_of_birth'],
                            'father_id_number': row.get('father_id_number', None),
                            'mother_id_number': row.get('mother_id_number', None),
                        }
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"Created citizen {citizen.id_number}"))
                    else:
                        self.stdout.write(self.style.WARNING(f"Citizen {citizen.id_number} already exists"))
                except IntegrityError as e:
                    self.stdout.write(self.style.ERROR(f"Error importing {row['id_number']}: {str(e)}"))
                except KeyError as e:
                    self.stdout.write(self.style.ERROR(f"Missing column in CSV: {str(e)}"))
