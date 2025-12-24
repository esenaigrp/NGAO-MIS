# In /ngao_core/apps/accounts/views.py

from rest_framework import viewsets, filters, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from .permissions import IsChiefOrAdmin

# Local Imports
from ngao_core.apps.admin_structure.models import AdminUnit
from ngao_core.apps.accounts.permissions import IsCountyCommissioner

from .models import ContactPoint, OfficerProfile, Role, CustomUser, Device, DeviceApprovalRequest
from .serializers import (
    AdminUnitSerializer, ContactPointSerializer,
    OfficerProfileSerializer, RoleSerializer,
    UserSerializer, CustomUserSerializer,
    EmailTokenObtainPairSerializer,
    DeviceSerializer, DeviceApprovalRequestSerializer
)

User = get_user_model()

# ----------------------------------------------------------------------
# JWT LOGIN VIEW
# ----------------------------------------------------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
     serializer_class = EmailTokenObtainPairSerializer
    
def post(self, request, *args, **kwargs):
    
        return super().post(request, *args, **kwargs)


# ----------------------------------------------------------------------
# VIEWSETS
# ----------------------------------------------------------------------
class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer


class ContactPointViewSet(viewsets.ModelViewSet):
    queryset = ContactPoint.objects.all()
    serializer_class = ContactPointSerializer
    permission_classes = [permissions.IsAuthenticated]


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by("hierarchy_level")
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


class AdminUnitViewSet(viewsets.ModelViewSet):
    queryset = AdminUnit.objects.all()
    serializer_class = AdminUnitSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "code"]


class OfficerProfileViewSet(viewsets.ModelViewSet):
    queryset = OfficerProfile.objects.select_related(
        "user", "role", "admin_unit"
    ).all()
    serializer_class = OfficerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="by-admin-unit/(?P<unit_uid>[^/.]+)")
    def by_admin_unit(self, request, unit_uid):
        qs = self.queryset.filter(admin_unit__uid=unit_uid)
        page = self.paginate_queryset(qs)
        if page:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(qs, many=True).data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


# ----------------------------------------------------------------------
# REMOVE LEGACY LOGIN ENDPOINTS (JWT handles all auth)
# ----------------------------------------------------------------------
# NO login_view()
# NO LoginView()
# NO EmailAuthToken
# NO Token-based login
# NO dummy serializer placeholders

# ----------------------------------------------------------------------
# Officer Registration (kept if needed)
# ----------------------------------------------------------------------
class OfficerRegister(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # TODO: Replace with real serializer later
        return Response({"message": "Registration endpoint pending implementation"})


class ActivateOfficer(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        # TODO: Replace with real implementation later
        return Response({"message": "Activation endpoint pending implementation"})
    
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    

class IncidentListView(APIView):
    permission_classes = [IsAuthenticated, IsChiefOrAdmin]

    def get(self, request):
        area = request.user.area
        incidents = Incident.objects.filter(area=area)

class RegisterDeviceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        device_id = request.data.get("device_number")
        device_name = request.data.get("device_name", "")
        user = request.user
        device, created = Device.objects.get_or_create(
            user=user,
            device_id=device_id,
            defaults={"device_name": device_name}
        )
        if created:
            DeviceApprovalRequest.objects.create(device=device, requested_by=user)
            return Response({"detail": "Device registered and awaiting supervisor approval."}, status=status.HTTP_201_CREATED)
        elif not device.is_trusted:
            return Response({"detail": "Device pending approval."}, status=status.HTTP_200_OK)
        return Response({"detail": "Device already trusted."}, status=status.HTTP_200_OK)

class ApproveDeviceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, device_id):
        try:
            device = Device.objects.get(device_id=device_id)
        except Device.DoesNotExist:
            return Response({"detail": "Device not found"}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.is_staff:
            return Response({"detail": "Only supervisors can approve devices"}, status=status.HTTP_403_FORBIDDEN)

        device.is_trusted = True
        device.approved_by = request.user
        device.approved_at = timezone.now()
        device.save()

        approval_request = DeviceApprovalRequest.objects.get(device=device)
        approval_request.status = "approved"
        approval_request.approved_by = request.user
        approval_request.approved_at = timezone.now()
        approval_request.save()

        return Response({"detail": "Device approved successfully."}, status=status.HTTP_200_OK)

class DeviceAdminViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceApprovalRequestSerializer
    permission_classes = [permissions.IsAdminUser]  # only supervisors/admins

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        device = self.get_object()
        serializer = self.get_serializer(device, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(is_trusted=True)
        return Response(serializer.data)