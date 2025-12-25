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
from django.db import transaction
from .serializers import UserSerializer
from .permissions import IsChiefOrAdmin

# Local Imports
from ngao_core.apps.admin_structure.models import AdminUnit
from ngao_core.apps.accounts.permissions import IsCountyCommissioner

from .models import (
    ContactPoint,
    OfficerProfile,
    Role,
    CustomUser,
    Device,
    DeviceApprovalRequest,
)
from .serializers import (
    AdminUnitSerializer,
    ContactPointSerializer,
    OfficerProfileSerializer,
    RoleSerializer,
    UserSerializer,
    CustomUserSerializer,
    EmailTokenObtainPairSerializer,
    DeviceSerializer,
    DeviceApprovalRequestSerializer,
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
    queryset = OfficerProfile.objects.select_related("user", "admin_unit").all()
    serializer_class = OfficerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Create a new officer with associated user account
        """
        try:
            user_data = request.data.get("user", {})

            # Validate required fields
            if not all(
                [
                    user_data.get("first_name"),
                    user_data.get("last_name"),
                    user_data.get("email"),
                ]
            ):
                return Response(
                    {"error": "first_name, last_name, and email are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if user with this email already exists
            if CustomUser.objects.filter(email=user_data["email"]).exists():
                return Response(
                    {"error": "User with this email already exists"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get or create Officer role
            officer_role, _ = Role.objects.get_or_create(
                name="Officer", defaults={"description": "Officer role"}
            )

            # Create user
            user = CustomUser.objects.create_user(
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                role=officer_role,
            )

            # Create officer profile
            # Create officer profile - pass user ID directly
            officer = OfficerProfile.objects.create(
                user=user,
                phone=request.data.get("phone"),
                role_text=request.data.get("role_text"),
                badge_number=request.data.get("badge_number"),
                id_number=request.data.get("id_number"),
                office_email=request.data.get("office_email"),
                admin_unit_id=request.data.get("admin_unit"),
                is_active=request.data.get("is_active", True),
                notes=request.data.get("notes", ""),
            )

            # Serialize the created officer
            serializer = self.get_serializer(officer)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """
        Update officer profile and associated user
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        try:
            user_data = request.data.get("user", {})

            # Update user information if provided
            if user_data:
                user = instance.user
                user.first_name = user_data.get("first_name", user.first_name)
                user.last_name = user_data.get("last_name", user.last_name)

                # Check email uniqueness if changing
                new_email = user_data.get("email")
                if new_email and new_email != user.email:
                    if (
                        CustomUser.objects.filter(email=new_email)
                        .exclude(id=user.id)
                        .exists()
                    ):
                        return Response(
                            {"error": "User with this email already exists"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    user.email = new_email
                    user.username = new_email

                user.save()

            # Update officer profile
            officer_data = {
                "phone": request.data.get("phone", instance.phone),
                "role_text": request.data.get("role_text", instance.role_text),
                "badge_number": request.data.get("badge_number", instance.badge_number),
                "id_number": request.data.get("id_number", instance.id_number),
                "office_email": request.data.get("office_email", instance.office_email),
                "admin_unit": request.data.get("admin_unit", instance.admin_unit_id),
                "is_active": request.data.get("is_active", instance.is_active),
                "notes": request.data.get("notes", instance.notes),
            }

            serializer = self.get_serializer(
                instance, data=officer_data, partial=partial
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update officer profile
        """
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete officer profile and optionally the associated user
        """
        instance = self.get_object()
        user = instance.user

        # Delete officer profile
        instance.delete()

        # Optionally delete the user as well
        # You can make this configurable based on request parameter
        delete_user = request.query_params.get("delete_user", "true").lower() == "true"
        if delete_user:
            user.delete()

        return Response(
            {"message": "Officer deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )

    def list(self, request, *args, **kwargs):
        """
        List all officers with pagination
        """
        queryset = self.filter_queryset(self.get_queryset())

        # Add filtering options
        admin_unit = request.query_params.get("admin_unit")
        is_active = request.query_params.get("is_active")
        search = request.query_params.get("search")

        if admin_unit:
            queryset = queryset.filter(admin_unit_id=admin_unit)

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        if search:
            queryset = (
                queryset.filter(user__first_name__icontains=search)
                | queryset.filter(user__last_name__icontains=search)
                | queryset.filter(user__email__icontains=search)
                | queryset.filter(badge_number__icontains=search)
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single officer by ID
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="by-admin-unit/(?P<unit_id>[^/.]+)")
    def by_admin_unit(self, request, unit_id):
        """
        Get officers filtered by admin unit
        """
        qs = self.queryset.filter(admin_unit_id=unit_id)
        page = self.paginate_queryset(qs)
        if page:
            return self.get_paginated_response(
                self.get_serializer(page, many=True).data
            )
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=True, methods=["post"], url_path="toggle-status")
    def toggle_status(self, request, pk=None):
        """
        Toggle officer active status
        """
        officer = self.get_object()
        officer.is_active = not officer.is_active
        officer.save()

        serializer = self.get_serializer(officer)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """
        Get officer statistics
        """
        total = self.queryset.count()
        active = self.queryset.filter(is_active=True).count()
        inactive = total - active

        by_unit = {}
        for unit in AdminUnit.objects.all():
            count = self.queryset.filter(admin_unit=unit).count()
            by_unit[unit.name] = count

        return Response(
            {
                "total": total,
                "active": active,
                "inactive": inactive,
                "by_admin_unit": by_unit,
            }
        )


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
            user=user, device_id=device_id, defaults={"device_name": device_name}
        )
        if created:
            DeviceApprovalRequest.objects.create(device=device, requested_by=user)
            return Response(
                {"detail": "Device registered and awaiting supervisor approval."},
                status=status.HTTP_201_CREATED,
            )
        elif not device.is_trusted:
            return Response(
                {"detail": "Device pending approval."}, status=status.HTTP_200_OK
            )
        return Response(
            {"detail": "Device already trusted."}, status=status.HTTP_200_OK
        )


class ApproveDeviceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, device_id):
        try:
            device = Device.objects.get(device_id=device_id)
        except Device.DoesNotExist:
            return Response(
                {"detail": "Device not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if not request.user.is_staff:
            return Response(
                {"detail": "Only supervisors can approve devices"},
                status=status.HTTP_403_FORBIDDEN,
            )

        device.is_trusted = True
        device.approved_by = request.user
        device.approved_at = timezone.now()
        device.save()

        approval_request = DeviceApprovalRequest.objects.get(device=device)
        approval_request.status = "approved"
        approval_request.approved_by = request.user
        approval_request.approved_at = timezone.now()
        approval_request.save()

        return Response(
            {"detail": "Device approved successfully."}, status=status.HTTP_200_OK
        )


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
