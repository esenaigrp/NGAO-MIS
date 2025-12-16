# ngao_core/apps/communications/serializers.py

from rest_framework import serializers
from .models import Message, Announcement 
from ngao_core.apps.accounts.models import CustomUser

class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Messages between officers or staff.
    Displays sender and recipient names, while allowing sender to be automatically set.
    """
    sender_name = serializers.ReadOnlyField(source="sender.get_full_name")
    recipient_name = serializers.ReadOnlyField(source="recipient.get_full_name")
    
    class Meta:
        model = Message
        fields = [
            "id",
            "subject",
            "body",
            "sender",
            "sender_name",
            "recipient",
            "recipient_name",
            "sent_at",
            "acknowledged",
        ]
        read_only_fields = ["id", "sent_at", "acknowledged"]


class AnnouncementSerializer(serializers.ModelSerializer):
    """
    Serializer for public or internal announcements.
    Supports multiple recipients via a ManyToMany relationship.
    """
    posted_by_name = serializers.ReadOnlyField(source="posted_by.get_full_name")
    recipients_names = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "body",
            "posted_by",
            "posted_by_name",
            "posted_at",
            "active",
            "recipients",
            "recipients_names",
        ]
        read_only_fields = ["id", "posted_at"]

    def get_recipients_names(self, obj):
        return [user.get_full_name() for user in obj.recipients.all()]
