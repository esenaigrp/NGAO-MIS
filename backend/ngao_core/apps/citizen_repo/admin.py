from django.contrib import admin
from .models import Citizen

@admin.register(Citizen)
class CitizenAdmin(admin.ModelAdmin):
    list_display = (
        "id_number",
        "first_name",
        "last_name",
        "gender",
        "date_of_birth",
        "is_alive",
    )
    search_fields = (
        "id_number",
        "first_name",
        "last_name",
    )
    list_filter = ("gender", "is_alive")

