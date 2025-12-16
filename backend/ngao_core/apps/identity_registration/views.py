from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import NationalIDRegistrationRequest
from .serializers import NationalIDRegistrationRequestSerializer


class NationalIDRegistrationRequestViewSet(viewsets.ModelViewSet):
    queryset = NationalIDRegistrationRequest.objects.all().order_by("-created_at")
    serializer_class = NationalIDRegistrationRequestSerializer

    @action(detail=True, methods=["post"])
    def verify_parents(self, request, pk=None):
        reg_request = self.get_object()
        mother_ok = request.data.get("mother_verified", False)
        father_ok = request.data.get("father_verified", True)
        try:
            reg_request.verify_parents(mother_ok, father_ok, request.user)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"status": reg_request.status})

    @action(detail=True, methods=["post"])
    def submit_to_nrb(self, request, pk=None):
        reg_request = self.get_object()
        try:
            reg_request.submit_to_nrb()
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"status": reg_request.status})

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        reg_request = self.get_object()
        try:
            reg_request.complete_registration()
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"status": reg_request.status})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        reg_request = self.get_object()
        reg_request.reject_registration()
        return Response({"status": reg_request.status})
