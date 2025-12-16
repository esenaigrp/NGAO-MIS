# ngao_core/apps/accounts/token_claims.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


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
