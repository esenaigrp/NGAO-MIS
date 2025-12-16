from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Citizen, CitizenQueryLog
from .serializers import CitizenSerializer

class CitizenLookupView(APIView):
    """
    Lookup citizen by ID Number + Last Name
    (Exactly how IPRS-style verification works)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id_number = request.data.get("id_number")
        last_name = request.data.get("last_name", "")
        module = request.data.get("module", "general")

        citizen = None
        found = False

        if id_number:
            citizen = Citizen.objects.filter(
                id_number=id_number,
                last_name__iexact=last_name,
            ).first()

            found = citizen is not None

        # 🔐 Audit log
        CitizenQueryLog.objects.create(
            user=request.user,
            id_number_queried=id_number,
            last_name_provided=last_name,
            module=module,
            was_found=found,
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        if not found:
            return Response(
                {"detail": "Citizen not found"},
                status=404,
            )

        return Response(CitizenSerializer(citizen).data)
