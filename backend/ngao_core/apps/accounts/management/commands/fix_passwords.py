from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, identify_hasher

User = get_user_model()

class Command(BaseCommand):
    help = "Fix all existing user passwords to ensure they are properly hashed"

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        for user in users:
            try:
                # Try identifying hash to see if password is hashed
                identify_hasher(user.password)
                self.stdout.write(self.style.SUCCESS(f"{user.email} already hashed"))
            except ValueError:
                # Password is plain text, re-hash it
                raw_password = user.password
                user.password = make_password(raw_password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"{user.email} password re-hashed"))

        self.stdout.write(self.style.SUCCESS("All user passwords checked/fixed"))
