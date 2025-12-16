# ngao_core/apps/geography/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AreaViewSet
from .views import AreaGeoJSONView


router = DefaultRouter()
router.register(r'areas', AreaViewSet, basename='areas')

urlpatterns = [
    path("", include(router.urls)),
     path("geojson/", AreaGeoJSONView.as_view(), name="areas-geojson"),
]
