from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NationalIDRegistrationRequestViewSet

router = DefaultRouter()
router.register(r"id-requests", NationalIDRegistrationRequestViewSet, basename="idrequest")

urlpatterns = [
    path("api/", include(router.urls)),
]
