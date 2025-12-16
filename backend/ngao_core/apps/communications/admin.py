from django.contrib import admin
from .models import Message, Announcement, Baraza

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'content', 'timestamp', 'read')  # use 'content' not 'body'
    list_filter = ('timestamp', 'read')
    search_fields = ('content', 'sender__first_name', 'recipient__first_name')

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'body', 'created_at', 'active')  # use correct fields from model
    list_filter = ('created_at', 'active')
    search_fields = ('title', 'body', 'creator__first_name')
    filter_horizontal = ('recipients',)
@admin.register(Baraza)
class BarazaAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location', 'organizer')
    filter_horizontal = ('attendees',)