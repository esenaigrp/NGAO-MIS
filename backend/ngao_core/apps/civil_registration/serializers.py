from rest_framework import serializers
from .models import (
    RegistrationRequest,
    BirthRegistration,
    DeathRegistration,
    MarriageRegistration
)
from ngao_core.apps.citizen_repo.models import Citizen
from ngao_core.apps.citizen_repo.serializers import CitizenSerializer
from ngao_core.apps.geography.serializers import AreaSerializer
from ngao_core.apps.accounts.serializers import UserSerializer


# ---------- Registration Request Serializer ----------
class RegistrationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = "__all__"
        read_only_fields = ["reference_number", "status", "verified_by_chief", "chief_verification_date"]

    def validate(self, data):
        # Ensure mother exists in Citizen repo
        mother_id = data.get("mother_id_number")
        father_id = data.get("father_id_number")

        try:
            mother = Citizen.objects.get(id_number=mother_id)
            data["mother"] = mother
        except Citizen.DoesNotExist:
            raise serializers.ValidationError(f"Mother with ID {mother_id} not found.")

        if father_id:
            try:
                father = Citizen.objects.get(id_number=father_id)
                data["father"] = father
            except Citizen.DoesNotExist:
                raise serializers.ValidationError(f"Father with ID {father_id} not found.")

        return data


# ---------- Birth Registration Serializer ----------
class BirthRegistrationSerializer(serializers.ModelSerializer):
    # Nested read serializers for displaying related data
    child = CitizenSerializer(read_only=True)
    mother = CitizenSerializer(read_only=True)
    father = CitizenSerializer(read_only=True)
    initiated_by = UserSerializer(read_only=True)
    area = AreaSerializer(read_only=True)
    
    class Meta:
        model = BirthRegistration
        fields = [
            'id', 
            'reference_number', 
            'status', 
            'child', 
            'mother', 
            'father', 
            'area', 
            'initiated_by',
            'child', 
            'mother', 
            'father',
            'area', 
            'initiated_by',
            'place_of_birth',
            'date_of_birth', 
            'gender',
            'approved_at',
            'created_at',
        ]


# ---------- Death Registration Serializer ----------
class DeathRegistrationSerializer(serializers.ModelSerializer):
    citizen = CitizenSerializer(read_only=True)
    initiated_by = UserSerializer(read_only=True)
    area = AreaSerializer(read_only=True)

    class Meta:
        model = DeathRegistration
        fields = [
            'id', 
            'status',
            'citizen', 
            'area', 
            'initiated_by',            
            'date_of_death', 
            'place_of_death', 
            'cause_of_death',
            'age', 
            'comments',
            'approved_at',
            'created_at', 
        ]
        read_only_fields = [
            "reference_number",
            "status",
            "approved_at",
            "created_at",
        ]



# ---------- Marriage Registration Serializer ----------
class MarriageRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarriageRegistration
        fields = "__all__"
        read_only_fields = ["reference_number", "status", "approved_at"]

    def validate(self, data):
        s1 = data.get("spouse_1")
        s2 = data.get("spouse_2")

        # Check if either spouse is already married (active marriage)
        if MarriageRegistration.objects.filter(
            (models.Q(spouse_1=s1) | models.Q(spouse_2=s1)) &
            (models.Q(status="submitted") | models.Q(status="approved"))
        ).exists():
            raise serializers.ValidationError(f"{s1} is already in a marriage registration.")

        if MarriageRegistration.objects.filter(
            (models.Q(spouse_1=s2) | models.Q(spouse_2=s2)) &
            (models.Q(status="submitted") | models.Q(status="approved"))
        ).exists():
            raise serializers.ValidationError(f"{s2} is already in a marriage registration.")

        return data
