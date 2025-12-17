# ngao_core/apps/accounts/token_claims.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # add custom claims
        try:
            profile = user.officer_profile
            token["role"] = profile.role.name if profile.role else None
            token["admin_unit_uid"] = (
                profile.admin_unit.uid.hex if profile.admin_unit else None
            )
        except Exception:
            token["role"] = None
            token["admin_unit_uid"] = None
        return token
    
    def get_tokens_for_user(user, device_id=None):
        refresh = RefreshToken.for_user(user)
        if device_id:
            refresh["device_id"] = device_id
            return {
                "refresh": str(refresh),
                "access": str(refresh.access_token)
    }
