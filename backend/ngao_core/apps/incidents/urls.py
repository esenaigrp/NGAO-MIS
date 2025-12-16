from django.urls import include, path
from rest_framework import routers
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from rest_framework_nested.routers import NestedSimpleRouter
from . import views
from .views import DashboardStats, IncidentViewSet, ResponseViewSet, IncidentListView

router = DefaultRouter()
router.register(r"incidents", IncidentViewSet, basename="incident")
router.register(r"responses", ResponseViewSet, basename="response")
router = routers.SimpleRouter()
router.register(r"incidents", IncidentViewSet, basename="incident")

# Create nested router for responses under incidents
incidents_router = NestedSimpleRouter(router, r"incidents", lookup="incident")
incidents_router.register(r"responses", ResponseViewSet, basename="incident-responses")

urlpatterns = router.urls + incidents_router.urls

urlpatterns = router.urls

urlpatterns = [
    path("", include(router.urls)),
    path('', IncidentListView.as_view(), name='incident-list'),
    path("submit/", views.submit_incident, name="submit_incident"),
    path("escalate/<int:incident_id>/", views.escalate_incident, name="escalate_incident"),
    path("dashboard-stats/", DashboardStats.as_view(), name="dashboard-stats"),
    path('', views.IncidentListView.as_view(), name='incident-list'),
]   
