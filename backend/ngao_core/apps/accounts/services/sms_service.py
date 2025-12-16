# accounts/services/sms_service.py

import requests
from django.conf import settings


class SMSService:
    """
    Generic SMS sender — replace with real provider.
    """

    @staticmethod
    def send_sms(phone, message):
        print(f"SMS to {phone}: {message}")  # ➤ For now, just print (sandbox)
        return True

        # Example integration:
        # url = "https://api.africastalking.com/version1/messaging"
        # headers = {"apiKey": settings.AT_API_KEY}
        # data = {"username": settings.AT_USERNAME, "to": phone, "message": message}
        # requests.post(url, headers=headers, data=data)
