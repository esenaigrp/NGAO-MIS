# In /ngao_core/apps/accounts/utils.py

# Placeholder for SMS Service and Token Verification
from .models import CustomUser

def send_activation_sms(user):
     """Placeholder for sending SMS activation code to user."""
     # Implement actual SMS gateway logic here
     print(f"SMS: Sending activation code to {user.phone_number}")

def send_activation_email(user):
     
     print(f"EMAIL: Sending activation link to {user.email}")

def verify_token(token):
     try:
          user = CustomUser.objects.get(user_id=token)
          return user
     except CustomUser.DoesNotExist:
          raise Exception("Invalid or expired token.")