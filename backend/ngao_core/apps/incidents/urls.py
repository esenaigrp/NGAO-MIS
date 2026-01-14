from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import IncidentViewSet, DashboardStats
from . import views

router = DefaultRouter()
router.register("incidents", IncidentViewSet, basename="incident")

urlpatterns = [
    path("", include(router.urls)),
    path("submit/", views.submit_incident, name="submit_incident"),
    path("escalate/<int:incident_id>/", views.escalate_incident, name="escalate_incident"),
]
