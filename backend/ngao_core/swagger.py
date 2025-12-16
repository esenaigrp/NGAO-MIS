# ngao_core/swagger.py

from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

# JWT header parameter for Swagger UI
jwt_header = openapi.Parameter(
    name='Authorization',
    in_=openapi.IN_HEADER,
    description='JWT token with "Bearer <token>"',
    type=openapi.TYPE_STRING,
)

# Schema view
schema_view = get_schema_view(
    openapi.Info(
        title="NGAO MIS API",
        default_version='v1',
        description="API documentation for NGAO MIS project",
        terms_of_service="https://www.esenai_ngao_mis.co.ke/terms/",
        contact=openapi.Contact(email="support@esenai.co.ke"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Optional: Add default security globally in settings.py instead
# SWAGGER_SETTINGS = {
#     'SECURITY_DEFINITIONS': {
#         'Bearer': {
#             'type': 'apiKey',
#             'in': 'header',
#             'name': 'Authorization',
#             'description': 'JWT Authorization header using the Bearer scheme. Example: "Bearer <token>"',
#         }
#     },
# }
