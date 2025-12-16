from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse 
from rest_framework import viewsets, permissions
from .models import Message, Announcement
from .serializers import MessageSerializer, AnnouncementSerializer
from apps.incidents.models import Incident 

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by("-sent_at")
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().order_by("-posted_at")
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

@csrf_exempt
def ussd_callback(request):
    session_id = request.POST.get("sessionId")
    phone_number = request.POST.get("phoneNumber")
    text = request.POST.get("text")  # e.g., "1*2*3"

    menu_level = text.split('*')

    if menu_level == ['']:
        response = "Welcome:\n1. Report Incident\n2. Check Status"
    elif menu_level[0] == '1' and len(menu_level) == 1:
        response = "Select Incident Type:\n1. Security\n2. Health\n3. Infrastructure"
    elif menu_level[0] == '1' and len(menu_level) == 2:
        response = "Describe your incident:"
    elif menu_level[0] == '1' and len(menu_level) == 3:
        # Save incident
        Incident.objects.create(
            reporter_phone=phone_number,
            type=menu_level[1],
            description=text.split('*')[2]
        )
        response = "Thank you! Your incident has been recorded."
    else:
        response = "Invalid choice."

    return HttpResponse(response, content_type='text/plain')