from rest_framework import serializers
from ngao_core.apps.accounts.models import CustomUser
from ngao_core.apps.accounts.serializers import UserSerializer
from ngao_core.apps.admin_structure.serializers import AdminUnitSerializer
from ngao_core.apps.admin_structure.models import AdminUnit
from .models import Incident, Response

class ResponseSerializer(serializers.ModelSerializer):
    """Serializer for incident response objects."""
    incident = serializers.SlugRelatedField(
        queryset=Incident.objects.all(),
        slug_field='id'
    )
    responder = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Response
        fields = ["id", "incident", "responder", "comment", "timestamp"]


class IncidentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Incident model.
    """
    reported_by = UserSerializer(read_only=True)
    current_handler = UserSerializer(read_only=True)
    location = AdminUnitSerializer(read_only=True)
    responses = ResponseSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    reported_by_name = serializers.ReadOnlyField(source="reported_by.username")
    location_name = serializers.ReadOnlyField(source="location.name", default=None)

    class Meta:
        model = Incident
        fields = [
            "id",
            "title",
            "user",
            "description",
            "status",
            "incident_type",
            "coordinates",
            "date_reported",
            "reported_by",
            "current_handler",
            "reporter_phone",
            "location",
            "location_name",
            "reported_by_name",
            "responses",
            "reported_at",
        ]
        read_only_fields = ("id", "date_reported")

    def create(self, validated_data):
        incident = super().create(validated_data)
        # Assign first handler automatically if handlers exist
        if hasattr(incident, "alert_next_handler"):
            incident.alert_next_handler()
        return incident
