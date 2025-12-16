from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    RegistrationRequest,
    BirthRegistration,
    DeathRegistration,
    MarriageRegistration
)
from .serializers import (
    RegistrationRequestSerializer,
    BirthRegistrationSerializer,
    DeathRegistrationSerializer,
    MarriageRegistrationSerializer
)

# ---------- Registration Request ViewSet ----------
class RegistrationRequestViewSet(viewsets.ModelViewSet):
    queryset = RegistrationRequest.objects.all().order_by("-created_at")
    serializer_class = RegistrationRequestSerializer

    @action(detail=True, methods=["post"])
    def verify_parents(self, request, pk=None):
        reg_req = self.get_object()
        mother_ok = request.data.get("mother_verified", False)
        father_ok = request.data.get("father_verified", False)
        chief_user = request.user
        reg_req.verify_parents(mother_ok, father_ok, chief_user)
        return Response({"status": reg_req.status})


# ---------- Birth Registration ViewSet ----------
class BirthRegistrationViewSet(viewsets.ModelViewSet):
    queryset = BirthRegistration.objects.all().order_by("-created_at")
    serializer_class = BirthRegistrationSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        birth = self.get_object()
        birth.approve()
        return Response({"status": birth.status})


# ---------- Death Registration ViewSet ----------
class DeathRegistrationViewSet(viewsets.ModelViewSet):
    queryset = DeathRegistration.objects.all().order_by("-created_at")
    serializer_class = DeathRegistrationSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        death = self.get_object()
        death.approve()
        return Response({"status": death.status})


# ---------- Marriage Registration ViewSet ----------
class MarriageRegistrationViewSet(viewsets.ModelViewSet):
    queryset = MarriageRegistration.objects.all().order_by("-date_of_marriage")
    serializer_class = MarriageRegistrationSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        marriage = self.get_object()
        marriage.approve()
        return Response({"status": marriage.status})
