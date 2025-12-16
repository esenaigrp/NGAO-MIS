from django.contrib import admin
from .models import NationalIDRegistrationRequest

@admin.register(NationalIDRegistrationRequest)
class NationalIDRegistrationRequestAdmin(admin.ModelAdmin):
    list_display = (
        "reference_number",
        "applicant",
        "father",
        "mother",
        "status",
        "initiated_by",
        "verified_by_chief",
        "created_at",
        "verified_at",
        "submitted_to_nrb_at",
        "completed_at"
    )
    list_filter = ("status", "created_at")
    search_fields = ("reference_number", "applicant__first_name", "applicant__last_name", "applicant__id_number")
    readonly_fields = ("reference_number", "initiated_by", "verified_by_chief",
                       "created_at", "verified_at", "submitted_to_nrb_at", "completed_at")