from django.contrib import admin
from .models import (
    RegistrationRequest,
    BirthRegistration,
    DeathRegistration,
    MarriageRegistration
)

@admin.register(RegistrationRequest)
class RegistrationRequestAdmin(admin.ModelAdmin):
    list_display = ("reference_number", "registration_type", "status", "initiated_by", "verified_by_chief", "created_at")
    readonly_fields = ("reference_number", "status", "verified_by_chief", "chief_verification_date")


@admin.register(BirthRegistration)
class BirthRegistrationAdmin(admin.ModelAdmin):
    list_display = ("reference_number", "child", "mother", "father", "status", "initiated_by", "approved_at")
    readonly_fields = ("reference_number", "status", "approved_at")


@admin.register(DeathRegistration)
class DeathRegistrationAdmin(admin.ModelAdmin):
    list_display = ("reference_number", "citizen", "status", "initiated_by", "approved_at")
    readonly_fields = ("reference_number", "status", "approved_at")


@admin.register(MarriageRegistration)
class MarriageRegistrationAdmin(admin.ModelAdmin):
    list_display = ("reference_number", "spouse_1", "spouse_2", "status", "initiated_by", "approved_at")
    readonly_fields = ("reference_number", "status", "approved_at")
