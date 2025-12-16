from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegistrationRequestViewSet,
    BirthRegistrationViewSet,
    DeathRegistrationViewSet,
    MarriageRegistrationViewSet
)

router = DefaultRouter()
router.register("requests", RegistrationRequestViewSet, basename="registrationrequest")
router.register("births", BirthRegistrationViewSet, basename="birthregistration")
router.register("deaths", DeathRegistrationViewSet, basename="deathregistration")
router.register("marriages", MarriageRegistrationViewSet, basename="marriageregistration")

urlpatterns = [
    path("", include(router.urls)),
]
