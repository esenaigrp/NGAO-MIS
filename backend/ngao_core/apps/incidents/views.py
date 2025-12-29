from ngao_core.apps.accounts.permissions import IsCountyCommissioner
from django.db.models import Count, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response as DRFResponse
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework import status
from ngao_core.apps.accounts.models import CustomUser
from ngao_core.apps.accounts.permissions import (
    HasRole,
    HierarchicalAccess,
    IsAuthenticatedOfficer,
    RolePermission,
)
from django.contrib.gis.geos import Point
from ngao_core.apps.accounts.models import OfficerProfile
from ngao_core.apps.admin_structure.models import AdminUnit
from .models import Incident, Response
from .permissions import IsReporterOrAbove
from .serializers import IncidentSerializer, ResponseSerializer


class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated]
    # permission_classes = [
    #     IsAuthenticated,
    #     IsAuthenticatedOfficer,
    #     IsReporterOrAbove,
    #     permissions.IsAuthenticated,
    #     HierarchicalAccess,
    #     RolePermission,
    # ]

    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    
    def get_queryset(self):
        """
        Restrict ONLY the `list` action.
        Other actions remain intact.
        """
        qs = super().get_queryset()
        user = self.request.user

        # Only apply restriction when fetching ALL incidents
        if self.action == "list":
            if user.is_staff or user.is_superuser:
                return qs
            return qs.filter(reported_by=user)

        return qs
    
    

    def perform_create(self, serializer):
        user = self.request.user
        
        # Try to get officer coordinates
        coordinates = None
        try:
            profile = OfficerProfile.objects.get(user=user)
            coordinates = profile.location
        except OfficerProfile.DoesNotExist:
            coordinates = Point(0.0, 0.0)

        serializer.save(
            reported_by=user,
            coordinates=serializer.validated_data.get("coordinates", coordinates),
        )

    # -------------------------
    # Custom actions
    # -------------------------

    @action(detail=False, methods=["get"], url_path="my")
    def my_incidents(self, request):
        """
        Returns incidents reported by the current user.
        """
        qs = self.get_queryset().filter(
            current_handler=request.user,
            status="reported",
        )
        serializer = self.get_serializer(qs, many=True)
        return DRFResponse(serializer.data, status=status.HTTP_200_OK)

    # Dashboard stats
    @action(detail=False, methods=["get"], url_path="dashboard-stats")
    def dashboard_stats(self, request):
        user = request.user
        today = now().date()

        # -------------------------
        # Base queryset by role
        # -------------------------
        if user.is_staff or user.is_superuser:
            # Admin: see everything
            qs = Incident.objects.all()
            assigned_qs = Incident.objects.all()
        else:
            # Non-admin: only incidents assigned to them
            qs = Incident.objects.filter(current_handler=user)
            assigned_qs = qs

        # -------------------------
        # Core counts
        # -------------------------
        total_incidents = qs.count()
        open_incidents = qs.filter(status="reported").count()
        resolved_incidents = qs.filter(status="resolved").count()
        responses_count = Response.objects.count()

        # -------------------------
        # Detailed stats block
        # -------------------------
        stats = {
            "open": open_incidents,
            "urgent": qs.filter(status="urgent").count(),
            "resolved_today": qs.filter(
                status="resolved",
                date_resolved__date=today,
            ).count(),
        }

        # -------------------------
        # Assigned incidents list
        # -------------------------
        assigned_data = IncidentSerializer(
            assigned_qs,
            many=True,
            context={"request": request},
        ).data

        return DRFResponse(
            {
                "total_incidents": total_incidents,
                "open_incidents": open_incidents,
                "resolved_incidents": resolved_incidents,
                "responses": responses_count,
                "stats": stats,
                "assigned": assigned_data,
            }
        )


class ResponseViewSet(viewsets.ModelViewSet):
    queryset = Response.objects.all()
    serializer_class = ResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["incident", "responder", "acknowledged"]
    ordering_fields = ["timestamp"]
    ordering = ["-timestamp"]

    def perform_create(self, serializer):
        serializer.save(responder=self.request.user)

        @api_view(["POST"])
        @permission_classes([IsAuthenticated])
        def submit_incident(request):
            data = request.data
            user = request.user

        village_elder = CustomUser.objects.filter(
            role="village_elder", location=user.location
        ).first()
        
        admin_unit = AdminUnit.objects.filter(id=data.get("location")).first()

        incident = Incident.objects.create(
            title=data.get("title"),
            description=data.get("description"),
            incident_type=data.get("incident_type"),
            reporter_phone=data.get("reporter_phone"),
            location=admin_unit,
            reported_by=user,
            current_handler=village_elder,
        )

        serializer = IncidentSerializer(incident)
        return DRFResponse(serializer.data)


class DashboardStats(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = now().date()

        # -------------------------
        # Base queryset by role
        # -------------------------
        if user.is_staff or user.is_superuser:
            # Admin: see everything
            qs = Incident.objects.all()
            assigned_qs = Incident.objects.all()
        else:
            # Non-admin: only incidents assigned to them
            qs = Incident.objects.filter(current_handler=user)
            assigned_qs = qs

        # -------------------------
        # Core counts
        # -------------------------
        total_incidents = qs.count()
        open_incidents = qs.filter(status="reported").count()
        resolved_incidents = qs.filter(status="resolved").count()
        responses_count = Response.objects.count()

        # -------------------------
        # Detailed stats block
        # -------------------------
        stats = {
            "open": open_incidents,
            "urgent": qs.filter(status="urgent").count(),
            "resolved_today": qs.filter(
                status="resolved",
                date_resolved__date=today,
            ).count(),
        }

        # -------------------------
        # Assigned incidents list
        # -------------------------
        assigned_data = IncidentSerializer(
            assigned_qs,
            many=True,
            context={"request": request},
        ).data

        return DRFResponse(
            {
                "total_incidents": total_incidents,
                "open_incidents": open_incidents,
                "resolved_incidents": resolved_incidents,
                "responses": responses_count,
                "stats": stats,
                "assigned": assigned_data,
            }
        )


class IncidentListView(generics.ListAPIView):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer


# Helper function to get next handler
ROLE_HIERARCHY = ["assistant_chief", "chief", "acc", "dcc", "cc", "rc", "ps_cs"]


def get_next_handler(incident):
    try:
        next_level = incident.escalation_level + 1
        role = ROLE_HIERARCHY[next_level]
        return CustomUser.objects.filter(
            role=role, location=incident.created_by.location
        ).first()
    except IndexError:
        return None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_incident(request):
    user = request.user
    data = request.data
    village_elder = CustomUser.objects.filter(
        role="village_elder", location=user.location
    ).first()

    incident = Incident.objects.create(
        title=data.get("title"),
        description=data.get("description"),
        created_by=user,
        current_handler=village_elder,
    )
    serializer = IncidentSerializer(incident)
    return DRFResponse(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def escalate_incident(request, incident_id):
    try:
        incident = Incident.objects.get(id=incident_id)
    except Incident.DoesNotExist:
        return Response({"error": "Incident not found"}, status=404)

    next_handler = get_next_handler(incident)
    if next_handler:
        incident.current_handler = next_handler
        incident.escalation_level += 1
        incident.status = "escalated"
        incident.save()
        return Response({"message": f"Incident escalated to {next_handler.role}"})
    else:
        incident.status = "closed"
        incident.current_handler = None
        incident.save()
        return DRFResponse({"message": "Incident closed, no further escalation"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_incident(request):
    """
    Create an incident and assign the first handler automatically.
    """
    user = request.user
    data = request.data

    # Assign the village_elder as first handler
    village_elder = CustomUser.objects.filter(
        role="village_elder", location=user.location
    ).first()

    incident = Incident.objects.create(
        title=data.get("title"),
        description=data.get("description"),
        reported_by=user,
        current_handler=village_elder,
    )

    serializer = IncidentSerializer(incident)
    return DRFResponse(serializer.data)


def get_next_handler(incident):
    """
    Determine the next handler in the escalation hierarchy.
    """
    try:
        next_level = incident.escalation_level + 1
        role = ROLE_HIERARCHY[next_level]
        return CustomUser.objects.filter(
            role=role, location=incident.reported_by.location
        ).first()
    except (IndexError, AttributeError):
        return None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def escalate_incident(request, incident_uid):
    """
    Escalate an incident to the next handler.
    """
    try:
        incident = Incident.objects.get(uid=incident_uid)
    except Incident.DoesNotExist:
        return DRFResponse({"error": "Incident not found"}, status=404)

    next_handler = get_next_handler(incident)
    if next_handler:
        incident.current_handler = next_handler
        incident.escalation_level = getattr(incident, "escalation_level", 0) + 1
        incident.status = "escalated"
        incident.save()
        return DRFResponse({"message": f"Incident escalated to {next_handler.role}"})
    else:
        incident.status = "closed"
        incident.current_handler = None
        incident.save()
        return DRFResponse({"message": "Incident closed, no further escalation"})
