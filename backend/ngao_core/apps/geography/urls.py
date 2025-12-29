from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AreaViewSet,
    AreaGeoJSONView,
    AreaTypeListView,
    AreaByTypeView
)

router = DefaultRouter()
router.register(r'areas', AreaViewSet, basename='areas')

urlpatterns = [
    path("", include(router.urls)),
    path("geojson/", AreaGeoJSONView.as_view(), name="areas-geojson"),
    path("area-types/", AreaTypeListView.as_view(), name="area-types"),
    path("by-type/<str:area_type>/", AreaByTypeView.as_view(), name="areas-by-type"),
]