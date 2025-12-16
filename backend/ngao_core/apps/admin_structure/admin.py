from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import AdminUnit, Location


@admin.register(AdminUnit)
class AdminUnitAdmin(GISModelAdmin):
    list_display = ("name", "level", "code", "parent")
    list_filter = ("level",)
    search_fields = ("name", "code")
    ordering = ("level", "name")


@admin.register(Location)
class LocationAdmin(GISModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
