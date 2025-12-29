# backend/ngao_core/urls.py

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.views.generic import TemplateView

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

# Swagger
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# ViewSets
from ngao_core.apps.accounts.views import (
    UserViewSet,
    OfficerProfileViewSet,
    ContactPointViewSet,
)
from ngao_core.apps.admin_structure.views import (
    AdminUnitViewSet,
    LocationViewSet,
)
from ngao_core.apps.incidents.views import (
    IncidentViewSet,
    ResponseViewSet,
)

# ---------------------------------------------------------
# Swagger Schema
# ---------------------------------------------------------
schema_view = get_schema_view(
    openapi.Info(
        title="NGAO MIS API",
        default_version="v1",
        description="API documentation for NGAO MIS",
    ),
    public=True,
)

# ---------------------------------------------------------
# DRF Router (API ONLY)
# ---------------------------------------------------------
router = DefaultRouter()

# ACCOUNTS
router.register(r"users", UserViewSet, basename="user")
router.register(r"officers", OfficerProfileViewSet, basename="officer")
router.register(r"contacts", ContactPointViewSet, basename="contact")

# ADMIN STRUCTURE
router.register(r"admin-units", AdminUnitViewSet, basename="unit")
router.register(r"locations", LocationViewSet, basename="location")

# INCIDENTS
router.register(r"incidents", IncidentViewSet, basename="incident")
router.register(r"responses", ResponseViewSet, basename="response")

# ---------------------------------------------------------
# URL Patterns
# ---------------------------------------------------------
urlpatterns = [

    # --------------------
    # Admin
    # --------------------
    path("admin/", admin.site.urls),

    # --------------------
    # API
    # --------------------
    path("api/", include(router.urls)),

    # Accounts / Auth (JWT, login, me, etc.)
    path("api/accounts/", include("ngao_core.apps.accounts.urls")),

    # Other apps
    path("api/admin-units/", include("ngao_core.apps.admin_structure.urls")),
    path("api/dashboard/", include("ngao_core.apps.dashboard.urls")),
    path("api/incidents/", include("ngao_core.apps.incidents.urls")),
    path("api/geography/", include("ngao_core.apps.geography.urls")),

    path("api/citizens/", include("ngao_core.apps.citizen_repo.urls")),
    path("api/dashboard/", include("ngao_core.apps.dashboard.urls")),

    path("api/registrations/", include("ngao_core.apps.civil_registration.urls")),
    
    path("api/geography/", include("ngao_core.apps.geography.urls")),

    # JWT helpers (optional if not already inside accounts)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # --------------------
    # Swagger
    # --------------------
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="swagger-ui"),
]

# ---------------------------------------------------------
# React Frontend Fallback (MUST BE LAST)
# ---------------------------------------------------------
urlpatterns += [
  re_path(r'^(?!api|admin|swagger|static).*', TemplateView.as_view(template_name='index.html')),
]

# ---------------------------------------------------------
# Static files (dev only)
# ---------------------------------------------------------
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
