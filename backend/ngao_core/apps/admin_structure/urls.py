
from rest_framework.routers import DefaultRouter
from rest_framework import routers
from .views import AdminUnitViewSet
from django.urls import path, include


router = routers.DefaultRouter()
router.register(r"admin-units", AdminUnitViewSet, basename="admin-units")

urlpatterns = [
    path('', include(router.urls)),
]
