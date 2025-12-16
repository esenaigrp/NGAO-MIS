# apps/communication/utils.py
from africastalking import initialize, SMS
from django.conf import settings

initialize(username=settings.AT_USERNAME, api_key=settings.AT_API_KEY)
sms = SMS

def broadcast_sms(message, phone_numbers):
    response = sms.send(message, phone_numbers)
    return response

def notify_chief(incident):
    area_chief = incident.area.chief
    if area_chief and area_chief.phone_number:
        message = f"New incident reported in your area: {incident.description}"
        broadcast_sms(message, [area_chief.phone_number])