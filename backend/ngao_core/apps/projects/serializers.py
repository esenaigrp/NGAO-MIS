from rest_framework import serializers
from .models import Project, Milestone
from django.conf import settings

User = settings.AUTH_USER_MODEL

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ["id", "title", "description", "due_date", "achieved"]

class ProjectSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)
    assigned_officers = serializers.SlugRelatedField(
        queryset=User.objects.all(), slug_field="user_id", many=True, required=False
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "budget",
            "location",
            "status",
            "created_by",
            "assigned_officers",
            "date_created",
            "date_updated",
            "milestones",
        ]
        read_only_fields = ["id", "created_by", "date_created", "date_updated"]
