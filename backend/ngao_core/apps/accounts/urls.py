from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserViewSet,
    OfficerProfileViewSet,
    ContactPointViewSet,
    CurrentUserView, RegisterDeviceView, ApproveDeviceView, DeviceAdminViewSet
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="users")
router.register(r"officers", OfficerProfileViewSet, basename="officers")
router.register(r"contact-points", ContactPointViewSet, basename="contact-points")
router.register(r"devices", DeviceAdminViewSet, basename="device-admin")

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("devices/register/", RegisterDeviceView.as_view(), name="register-device"),
    path("devices/<str:device_id>/approve/", ApproveDeviceView.as_view(), name="approve-device"),
]

urlpatterns += router.urls
