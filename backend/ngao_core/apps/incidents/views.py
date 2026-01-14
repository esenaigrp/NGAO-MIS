from ngao_core.apps.accounts.permissions import IsCountyCommissioner
from django.db.models import Count, Q
from calendar import month_abbr
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.exceptions import ValidationError
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
from .models import Incident, Response, Witness
from ngao_core.apps.geography.models import Area
from .permissions import IsReporterOrAbove
from .serializers import IncidentSerializer, ResponseSerializer
from ngao_core.apps.civil_registration.models import BirthRegistration, DeathRegistration, MarriageRegistration


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
        coordinates = None
        area_id = self.request.data.get("area")
        witnesses = self.request.data.get("witnesses", [])
        area = None

        if area_id:
            try:
                area = Area.objects.get(id=area_id)
            except Area.DoesNotExist:
                raise ValidationError({"area": "Selected area does not exist."})
            
        # ---------------------------------------
        # 1. Coordinates from Area boundary
        # ---------------------------------------
        if area and area.boundary:
            # MULTIPOLYGON → centroid POINT
            coordinates = area.boundary.centroid

        # ---------------------------------------
        # 2. Fallback: Officer profile area
        # ---------------------------------------
        if not coordinates:
            try:
                profile = OfficerProfile.objects.get(user=user)
                if profile.area:
                    coordinates = profile.area.boundary.centroid
            except OfficerProfile.DoesNotExist:
                pass

        incident = serializer.save(
            reported_by=user,
            area=area,
            coordinates=serializer.validated_data.get("coordinates", coordinates),
        )
        
            # ---------------------------------------
        # 5. Create Witnesses
        # ---------------------------------------
        for witness in witnesses:
            Witness.objects.create(
                incident=incident,
                name=witness.get("name"),
                email=witness.get("email", ""),
                phone=witness.get("phone", ""),
                id_number=witness.get("id_number", ""),
                statement=witness.get("statement", ""),
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
        current_month = today.month
        current_year = today.year

        # ------------------------------------------------
        # Base querysets (ROLE-BASED)
        # ------------------------------------------------
        if user.is_staff or user.is_superuser:
            incidents_qs = Incident.objects.all()
            births_qs = BirthRegistration.objects.all()
            deaths_qs = DeathRegistration.objects.all()
            marriages_qs = MarriageRegistration.objects.all()
        else:
            incidents_qs = Incident.objects.filter(current_handler=user)
            births_qs = BirthRegistration.objects.filter(initiated_by=user)
            deaths_qs = DeathRegistration.objects.filter(initiated_by=user)
            marriages_qs = MarriageRegistration.objects.filter(initiated_by=user)

        # ------------------------------------------------
        # INCIDENTS
        # ------------------------------------------------
        incidents_stats = {
            "open": incidents_qs.filter(status="reported").count(),
            "urgent": incidents_qs.filter(status="urgent").count(),
            "resolved_today": incidents_qs.filter(
                status="resolved",
                date_resolved__date=today
            ).count(),
        }

        incidents_list = IncidentSerializer(
            incidents_qs,
            many=True,
            context={"request": request},
        ).data

        incidents_by_type = (
            incidents_qs
            .values("incident_type")  # ensure field exists
            .annotate(value=Count("id"))
            .order_by()
        )

        incidents_by_type = [
            {"name": item["incident_type"], "value": item["value"]}
            for item in incidents_by_type
        ]

        incidents_trend_qs = (
            incidents_qs
            .annotate(month=TruncMonth("reported_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        incidents_trend = [
            {
                "month": month_abbr[item["month"].month],
                "count": item["count"],
            }
            for item in incidents_trend_qs
        ]

        # ------------------------------------------------
        # BIRTHS
        # ------------------------------------------------
        births_trend_qs = (
            births_qs
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        births = {
            "total": births_qs.count(),
            "thisMonth": births_qs.filter(
                created_at__year=current_year,
                created_at__month=current_month,
            ).count(),
            "trend": [
                {
                    "month": month_abbr[item["month"].month],
                    "count": item["count"],
                }
                for item in births_trend_qs
            ],
            "byGender": [
                {"name": "Male", "value": births_qs.filter(gender="M").count()},
                {"name": "Female", "value": births_qs.filter(gender="F").count()},
            ],
        }

        # ------------------------------------------------
        # DEATHS
        # ------------------------------------------------
        deaths_trend_qs = (
            deaths_qs
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        deaths = {
            "total": deaths_qs.count(),
            "thisMonth": deaths_qs.filter(
                created_at__year=current_year,
                created_at__month=current_month,
            ).count(),
            "trend": [
                {
                    "month": month_abbr[item["month"].month],
                    "count": item["count"],
                }
                for item in deaths_trend_qs
            ],
            "byAgeGroup": [
                {"name": "0-18", "value": deaths_qs.filter(age__lte=18).count()},
                {"name": "19-35", "value": deaths_qs.filter(age__range=(19, 35)).count()},
                {"name": "36-60", "value": deaths_qs.filter(age__range=(36, 60)).count()},
                {"name": "60+", "value": deaths_qs.filter(age__gt=60).count()},
            ],
        }

        # ------------------------------------------------
        # MARRIAGES
        # ------------------------------------------------
        marriages_trend_qs = (
            marriages_qs
            .annotate(month=TruncMonth("date_of_marriage"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        marriages = {
            "total": marriages_qs.count(),
            "thisMonth": marriages_qs.filter(
                date_of_marriage__year=current_year,
                date_of_marriage__month=current_month,
            ).count(),
            "trend": [
                {
                    "month": month_abbr[item["month"].month],
                    "count": item["count"],
                }
                for item in marriages_trend_qs
            ],
        }

        # ------------------------------------------------
        # FINAL RESPONSE (FRONTEND-READY)
        # ------------------------------------------------
        return DRFResponse({
            "incidents": {
                "stats": incidents_stats,
                "list": incidents_list,
                "byType": incidents_by_type,
                "trend": incidents_trend,
            },
            "births": births,
            "deaths": deaths,
            "marriages": marriages,
        })


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
