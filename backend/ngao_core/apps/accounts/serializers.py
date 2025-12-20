from django.conf import settings
from ngao_core.apps.incidents.models import Incident
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User as DjangoUser
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers, exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from ngao_core.apps.accounts.models import (ContactPoint, CustomUser, OfficerProfile, Role)
from ngao_core.apps.admin_structure.models import AdminUnit
from .models import Device, DeviceApprovalRequest


User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active', 'is_staff')
        read_only_fields = ('is_staff', 'is_active', 'is_superuser', 'last_login', 'date_joined')

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description", "level"]


class AdminUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUnit
        fields = ["id", "name", "unit_type", "parent", "code"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "first_name", "last_name"]
    
    read_only_fields = ["id", "date_joined"]

class ContactPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactPoint
        fields = [
            "id",
            "user",
            "type",
            "value",
            "create_at",
            "is_primary",
            "officer",
            "phone_number",
            "email",
            ]
        
class OfficerProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user_email", read_only=True)
    role = RoleSerializer(read_only=True)
    contact_points = ContactPointSerializer(many=True, read_only=True)

    class Meta:
        model = OfficerProfile
        fields = (
            "id",
            "user_email",
            "role",
            "badge_number",
            "phone",
            "official_email",
            "location",
            "is_active",
            "contact_points",
            "created_at",
            "rank",
            "admin_unit",
            )

    # Redefining the related fields outside of the Meta class for clarity (Standard DRF practice)
    role_id = serializers.PrimaryKeyRelatedField(
        source="role", queryset=Role.objects.all(), write_only=True, required=False
    )
    admin_unit_id = serializers.PrimaryKeyRelatedField(
        source="admin_unit",
        queryset=AdminUnit.objects.all(),
        write_only=True,
        required=False,
    )
    
    # Second Meta definition removed, using the first one's fields structure.
    # The fields list at the end of the original OfficerProfileSerializer was confusing.


class IncidentSummarySerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source="location.name", read_only=True)
    reported_by = serializers.CharField(source="reported_by.email", read_only=True)
    
    class Meta:
        model = Incident
        fields = ("id",
                  "title",
                  "incident_type",
                  "status",
                  "location",
                  "location_name",
                  "date_reported",
                  "reported_by",
                  )
        
# ----------------------------------------------------------------------
# 🔑 LOGIN/TOKEN SERIALIZER (FIXED AND CONSOLIDATED)
# --------------------------------------------------------------------   
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        # --- CUSTOM AUTH WITH EMAIL ---
        credentials = {
            'email': attrs.get('email'),
            'password': attrs.get('password'),
        }

        user = authenticate(**credentials)

        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        # IMPORTANT: attach user so parent validate() works
        self.user = user

        # --- RUN DEFAULT SIMPLE-JWT VALIDATION ---
        data = super().validate(attrs)

        # --- ADD USER PAYLOAD ---
        data["user"] = {
             "id": self.user.user_id,
             "email": self.user.email,
             "first_name": self.user.first_name,
             "last_name": self.user.last_name,
             "role": self.user.role,
        }

        return data


        
    

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD  # login with email

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(email=email, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        data = super().validate(attrs)
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "first_name": getattr(user, "first_name", ""),
            "last_name": getattr(user, "last_name", ""),
        }
        return data
    
class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = "__all__"

class DeviceApprovalRequestSerializer(serializers.ModelSerializer):
    device = DeviceSerializer(read_only=True)

    class Meta:
        model = DeviceApprovalRequest
        fields = "__all__"

class DeviceApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ["user_id", "is_trusted", "allowed_lat", "allowed_lon", "allowed_radius_meters"]