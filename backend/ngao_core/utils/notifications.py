# ngao_core/utils/notifications.py
from django.conf import settings

def notify_user(user, message, method="system"):
    """
    Central notification function for NGAO MIS.
    
    method options: 'system', 'email', 'sms'
    """
    if not user:
        return
    
    if method == "system":
        # Placeholder for system notification (frontend alert)
        print(f"[SYSTEM] Notify {user}: {message}")
    elif method == "email":
        # Implement email sending here
        # send_mail(subject="NGAO MIS Alert", message=message, from_email="noreply@ngao.mis", recipient_list=[user.email])
        print(f"[EMAIL] Notify {user}: {message}")
    elif method == "sms":
        # Implement SMS sending here
        # sms_service.send_sms(to=user.phone_number, message=message)
        print(f"[SMS] Notify {user}: {message}")
