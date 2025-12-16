from rest_framework import serializers
from .models import Project
from django.utils import timezone

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"

    def validate_end_date(self, value):
        start_date = self.initial_data.get("start_date")
        if start_date and value < start_date:
            raise serializers.ValidationError("End date cannot be earlier than start date.")
        return value

    def validate_start_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Start date cannot be in the past.")
        return value
