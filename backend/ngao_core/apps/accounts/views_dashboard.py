# ngao_core/apps/accounts/views_dashboard.py
# -----------------------------------------
# Officer dashboard endpoints: profile, incidents, permissions
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ngao_core.apps.incidents.models import Incident

from .permissions import HasRole, IsAuthenticatedOfficer
from .serializers import (IncidentSummarySerializer, OfficerProfileSerializer,
                          RoleSerializer)


class OfficerProfileView(APIView):
    """
    GET /api/officer/profile/  -> returns the officer profile for the logged-in user
    """

    permission_classes = [IsAuthenticated, IsAuthenticatedOfficer]

    def get(self, request):
        profile = request.user.officer_profile
        serializer = OfficerProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)


class OfficerIncidentsList(generics.ListAPIView):
    """
    GET /api/officer/incidents/ -> list incidents relevant to the officer's admin unit
    """

    permission_classes = [IsAuthenticated, IsAuthenticatedOfficer]
    serializer_class = IncidentSummarySerializer
    pagination_class = None  # change to a paginator when needed

    def get_queryset(self):
        profile = self.request.user.officer_profile
        # Basic policy: incidents belonging to officer admin unit or its children
        if not profile.admin_unit:
            return Incident.objects.none()
        # Naive approach: return incidents whose location.admin_unit == profile.admin_unit
        # If you have hierarchical lookup or a DB function to get descendants, use it.
        return Incident.objects.filter(
            location__admin_unit=profile.admin_unit
        ).order_by("-date_reported")


class OfficerPermissionsView(APIView):
    """
    GET /api/officer/permissions/ -> list permission-like items for frontend to build UI
    """

    permission_classes = [IsAuthenticated, IsAuthenticatedOfficer]

    def get(self, request):
        role = getattr(request.user.officer_profile, "role", None)
        role_data = RoleSerializer(role).data if role else None
        # You can compute derived permissions, for now return role info
        return Response({"role": role_data})
