# ngao_core/apps/geography/views.py
from rest_framework import viewsets
from .models import Area
from .serializers import AreaSerializer
from rest_framework.views import APIView
from rest_framework.response import Response



class AreaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides nested geography data for Leaflet maps.
    """
    queryset = Area.objects.filter(parent__isnull=True)  # top-level countries
    serializer_class = AreaSerializer


class AreaGeoJSONView(APIView):
    """
    Returns all top-level areas with nested children in Leaflet-ready GeoJSON
    """
    def get(self, request):
        countries = Area.objects.filter(area_type="country").order_by("name")
        data = [country.to_geojson_recursive() for country in countries]
        return Response(data)


