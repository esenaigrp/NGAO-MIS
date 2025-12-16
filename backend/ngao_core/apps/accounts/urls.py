from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserViewSet,
    OfficerProfileViewSet,
    ContactPointViewSet,
    CurrentUserView,
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="users")
router.register(r"officers", OfficerProfileViewSet, basename="officers")
router.register(r"contact-points", ContactPointViewSet, basename="contact-points")

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
]

urlpatterns += router.urls
