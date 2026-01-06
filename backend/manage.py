import os
import sys
from dotenv import load_dotenv

load_dotenv()

def main():
    """Run administrative tasks."""
    # Default to development settings
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ngao_core.settings.dev")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Make sure it's installed and your virtual environment is active."
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
