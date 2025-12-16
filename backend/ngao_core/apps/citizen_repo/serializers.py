from rest_framework import serializers
from .models import Citizen, CitizenQueryLog

class CitizenSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Citizen
        fields = [
            "id",
            "id_number",
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "gender",
            "date_of_birth",
            "place_of_birth",
            "father_id_number",
            "mother_id_number",
            "current_area",
            "is_alive",
            "date_of_death",
        ]

    def get_full_name(self, obj):
        parts = [obj.first_name]
        if obj.middle_name:
            parts.append(obj.middle_name)
        parts.append(obj.last_name)
        return " ".join(parts)


class CitizenQueryLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = CitizenQueryLog
        fields = [
            "id",
            "user_email",
            "id_number_queried",
            "last_name_provided",
            "module",
            "was_found",
            "timestamp",
            "ip_address",
        ]