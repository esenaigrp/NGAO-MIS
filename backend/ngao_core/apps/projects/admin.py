from django.contrib import admin
from .models import Project, Milestone

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_by')
    filter_horizontal = ('assigned_officers',)
    search_fields = ('title', 'description')

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'achieved', 'due_date')
    list_filter = ('achieved',)
    search_fields = ('title', 'project__title')
