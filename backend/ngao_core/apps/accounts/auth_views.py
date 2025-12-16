# accounts/auth_views.py

import random
from ngao_core.apps.accounts.models import OfficerProfile
from ngao_core.apps.accounts.services.sms_service import SMSService
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from ngao_core.apps.accounts.auth_serializers import CustomTokenObtainPairSerializer
from django.db import models


class OfficerLoginView(APIView):
    """
    Officer login using email and password.
    """

    def post(self, request):
        identifier = request.data.get("email")
        password = request.data.get("password")

    
        try:
            user = CustomUser.objects.get(email=identifier)
        except CustomUser.DoesNotExist:
                return Response({"error": "Invalid credentials"}, status=400)

        user = authenticate(username=user.email, password=password)

        if not user:
            return Response({"error": "Invalid credentials"}, status=400)

        # ➤ Create JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user_id": str(user.user_id),
                "email": user.email
            }
        ) 



class SendPasswordResetOTP(APIView):
    """
    Step 1: Officer enters phone number → SMS OTP is sent.
    """

    def post(self, request):
        phone = request.data.get("phone")

        try:
            officer = OfficerProfile.objects.get(phone=phone)
        except OfficerProfile.DoesNotExist:
            return Response({"error": "Phone not registered"}, status=404)

        # ➤ Generate OTP
        otp = str(random.randint(100000, 999999))
        officer.otp_code = otp
        officer.otp_created_at = timezone.now()
        officer.save()

        # ➤ Send SMS
        message = f"Your NGAO MIS password reset code is {otp}"
        SMSService.send_sms(phone, message)

        return Response({"message": "OTP sent"})
    
class VerifyOTPAndResetPassword(APIView):
    """
    POST:
    {
        "phone": "0712345678",
        "otp": "123456",
        "new_password": "mynewpass123"
    }
    """

    def post(self, request, *args, **kwargs):
        phone = request.data.get("phone")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        if not phone or not otp or not new_password:
            return Response(
                {"error": "phone, otp, and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = Officer.objects.get(phone=phone)
        except Officer.DoesNotExist:
            return Response(
                {"error": "User with this phone number does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate OTP
        if str(user.reset_otp) != str(otp):
            return Response(
                {"error": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check OTP expiration (optional)
        if hasattr(user, "otp_expiry") and user.otp_expiry:
            if timezone.now() > user.otp_expiry:
                return Response(
                    {"error": "OTP has expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Reset password securely
        user.set_password(new_password)

        # Clear OTP after successful reset
        user.reset_otp = None
        if hasattr(user, "otp_expiry"):
            user.otp_expiry = None

        user.save()

        return Response(
            {"message": "Password reset successful"},
            status=status.HTTP_200_OK
        )
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer