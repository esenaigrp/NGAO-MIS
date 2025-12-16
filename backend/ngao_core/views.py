
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import render
from django.urls import reverse
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from ngao_core.apps.accounts.permissions import IsCountyCommissioner
from ngao_core.apps.incidents.models import Incident
from django.views.decorators.cache import never_cache
from ngao_core.apps.accounts.serializers import EmailTokenObtainPairSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view 


class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    permission_classes = [IsAuthenticated, IsCountyCommissioner]
    # serializer_class = IncidentSerializer  # ensure this exists

@never_cache
def root_view(request):
    context = {
        "title": "Home",
        "admin_url": reverse("admin:index"),

        # MUST MATCH ROUTER BASENAME
        "accounts_api": reverse("officer-list"),

        # MUST MATCH incidents basename in router
        "incidents_api": reverse("incident-list"),
    }
    return JsonResponse({"status": "NGAO MIS API is running"})

@api_view(['POST'])
def login_view(request):
    # Your login logic here
    return Response({"detail": "Login successful"})