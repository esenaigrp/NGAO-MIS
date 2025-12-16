from rest_framework import serializers
from .models import NationalIDRegistrationRequest
from citizen_repo.models import Citizen


class NationalIDRegistrationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = NationalIDRegistrationRequest
        fields = "__all__"
        read_only_fields = ["reference_number", "status", "verified_by_chief", "verified_at"]

    def validate(self, data):
        # Ensure mother and applicant exist
        applicant = data.get("applicant")
        mother = data.get("mother")
        father = data.get("father", None)

        if not applicant:
            raise serializers.ValidationError("Applicant must be provided.")
        if not mother:
            raise serializers.ValidationError("Mother must be provided.")
        if father and father == mother:
            raise serializers.ValidationError("Father and mother cannot be the same person.")

        return data
