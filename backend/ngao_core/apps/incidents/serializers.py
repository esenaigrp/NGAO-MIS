from rest_framework import serializers
from ngao_core.apps.accounts.models import CustomUser
from ngao_core.apps.admin_structure.models import AdminUnit
from .models import Incident, Response

class ResponseSerializer(serializers.ModelSerializer):
    """Serializer for incident response objects."""
    incident = serializers.SlugRelatedField(
        queryset=Incident.objects.all(),
        slug_field='uid'
    )
    responder = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Response
        fields = ["id", "incident", "responder", "comment", "timestamp"]


class IncidentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Incident model.
    """
    reported_by = serializers.SlugRelatedField(
        queryset=CustomUser.objects.all(),
        slug_field='user_id',
        allow_null=True,
        required=False,
    )
    location = serializers.SlugRelatedField(
        queryset=AdminUnit.objects.all(),
        slug_field='uid',
        allow_null=True,
        required=False,
    )

    responses = ResponseSerializer(many=True, read_only=True)
    reported_by_name = serializers.ReadOnlyField(source="reported_by.username")
    location_name = serializers.ReadOnlyField(source="location.name", default=None)

    class Meta:
        model = Incident
        fields = [
            "uid",
            "title",
            "description",
            "incident_type",
            "status",
            "coordinates",
            "date_reported",
            "location",
            "reported_by",
            "reported_by_name",
            "location_name",
            "responses",
        ]
        read_only_fields = ("uid", "date_reported")

    def create(self, validated_data):
        incident = super().create(validated_data)
        # Assign first handler automatically if handlers exist
        if hasattr(incident, "alert_next_handler"):
            incident.alert_next_handler()
        return incident
