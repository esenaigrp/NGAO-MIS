# ngao_core/apps/dashboard/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# You can import models later when using real data
# from ngao_core.apps.incidents.models import Incident
# from ngao_core.apps.accounts.models import Officer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_overview(request):
    """
    Stub dashboard endpoint.
    Returns placeholder stats for frontend development.
    """
    data = {
        "stats": {
            "total_officers": 25,
            "active_officers": 20,
            "incidents_today": 7,
            "pending_civil_registrations": 4,
            "pending_national_ids": 3,
        },
        "incident_trends": {
            "labels": ["Jan", "Feb", "Mar", "Apr"],
            "data": [3, 5, 2, 7],
        },
        "message_trends": {
            "labels": ["Jan", "Feb", "Mar", "Apr"],
            "data": [1, 4, 3, 2],
        },
        "recent_activity": [],  # optional placeholder for activity feed
        "system_health": "ok",  # optional system status
    }
    return Response(data)
