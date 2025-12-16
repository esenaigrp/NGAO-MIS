from ngao_core.apps.accounts.permissions import IsCountyCommissioner
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets, generics 
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response as DRFResponse
from rest_framework.views import APIView
from ngao_core.apps.accounts.models import CustomUser
from ngao_core.apps.accounts.permissions import (HasRole, HierarchicalAccess, IsAuthenticatedOfficer, RolePermission)
from django.contrib.gis.geos import Point 
from ngao_core.apps.accounts.models import OfficerProfile
from .models import Incident, Response
from .permissions import IsReporterOrAbove
from .serializers import IncidentSerializer, ResponseSerializer


class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [
        IsAuthenticated,
        IsAuthenticatedOfficer,
        IsReporterOrAbove,
        permissions.IsAuthenticated,
        HierarchicalAccess,
        RolePermission,
    ]


    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["location", "status", "incident_type", "reported_by"]
    search_fields = ["title", "description"]
    ordering_fields = ["date_reported", "date_resolved"]
    ordering = ["-date_reported"]

    
    def perform_create(self, serializer):
        
        reporter = self.request.user
        
        try:
            profile = OfficerProfile.objects.get(user=reporter)
            reporter_coords = profile.location 
        except OfficerProfile.DoesNotExist:
           
            reporter_coords = Point(0.0, 0.0)
        
        serializer.save(
            reported_by=reporter,

            coordinates=serializer.validated_data.get('coordinates', reporter_coords)
        )

    @action(detail=False, methods=["get"])
    def my_open_incidents(self, request):
        qs = self.queryset.filter(status="reported", reported_by=request.user)
        serializer = self.get_serializer(qs, many=True)
        return DRFResponse(serializer.data)

    def get_queryset(self):
        queryset = Response.objects.all()
        incident_id = self.kwargs.get("incident_pk")

        if incident_id:
            queryset = queryset.filter(incident_id=incident_id)

        return queryset

    def perform_create(self, serializer):
        incident_id = self.kwargs.get("incident_pk")
        serializer.save(responder=self.request.user, incident_id=incident_id)

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


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

        incident = Incident.objects.create(
            title=data.get("title"),
            description=data.get("description"),
            reported_by=user,
            current_handler=village_elder,
        )

        serializer = IncidentSerializer(incident)
        return DRFResponse(serializer.data)


class DashboardStats(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_incidents = Incident.objects.count()
        open_incidents = Incident.objects.filter(status="reported").count()
        responses = Response.objects.count()
        return DRFResponse(
            {
                "total_incidents": total_incidents,
                "open_incidents": open_incidents,
                "responses": responses,
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
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def escalate_incident(request, incident_id):
    try:
        incident = Incident.objects.get(uid=incident_uid)
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
        return Response({"message": "Incident closed, no further escalation"})
    

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