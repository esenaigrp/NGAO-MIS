from django.contrib import admin

from .models import Incident, Response


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("uid", "title", "incident_type", "reported_by", "date_reported")
    list_filter = ("incident_type", "date_reported")
    search_fields = ("title", "description", "reported_by__email")
    ordering = ("-date_reported",)


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ("id", "incident", "responder", "comment", "timestamp")
    list_filter = ("timestamp",)
    search_fields = ("incident__title", "responder__email", "comment")
    ordering = ("-timestamp",)
