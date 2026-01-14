from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Area
from .serializers import AreaSerializer


class AreaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides nested geography data for Leaflet maps.
    
    Filter by area_type: /api/areas/?area_type=county
    Filter by parent: /api/areas/?parent=<uuid>
    Filter by code: /api/areas/?code=KE-001
    """
    serializer_class = AreaSerializer

    def get_queryset(self):
        queryset = Area.objects.all()
        
        # Filter by area_type
        area_type = self.request.query_params.get('area_type', None)
        if area_type:
            queryset = queryset.filter(area_type=area_type)
        
        # Filter by parent (use 'root' for top-level)
        parent = self.request.query_params.get('parent', None)
        if parent == 'root' or parent == 'null':
            queryset = queryset.filter(parent__isnull=True)
        elif parent:
            queryset = queryset.filter(parent_id=parent)
        
        # Filter by code
        code = self.request.query_params.get('code', None)
        if code:
            queryset = queryset.filter(code=code)
        
        # Filter by name (case-insensitive partial match)
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        return queryset.order_by('name')

    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        """
        Get all direct children of an area.
        /api/areas/<uuid>/children/
        """
        area = self.get_object()
        children = area.children.all().order_by('name')
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def hierarchy(self, request, pk=None):
        """
        Get the full hierarchy path from root to this area.
        /api/areas/<uuid>/hierarchy/
        """
        area = self.get_object()
        hierarchy = []
        current = area
        
        while current:
            hierarchy.insert(0, {
                'id': str(current.id),
                'name': current.name,
                'code': current.code,
                'area_type': current.area_type,
            })
            current = current.parent
        
        return Response(hierarchy)


class AreaGeoJSONView(APIView):
    """
    Returns areas in Leaflet-ready GeoJSON format.
    
    Query params:
    - area_type: Filter by type (country, region, county, etc.)
    - parent: Filter by parent UUID (use 'root' for top-level)
    - code: Filter by area code
    - recursive: Include children recursively (true/false)
    - id: Get specific area by UUID
    
    Examples:
    /api/geography/geojson/?area_type=country
    /api/geography/geojson/?parent=root
    /api/geography/geojson/?area_type=county&parent=<region-uuid>
    /api/geography/geojson/?id=<uuid>&recursive=true
    """
    def get(self, request):
        # Get specific area by ID
        area_id = request.query_params.get('id', None)
        if area_id:
            area = get_object_or_404(Area, id=area_id)
            recursive = request.query_params.get('recursive', 'false').lower() == 'true'
            
            if recursive:
                data = area.to_geojson_recursive()
            else:
                data = area.to_geojson()
            
            return Response(data)
        
        # Build queryset based on filters
        queryset = Area.objects.all()
        
        area_type = request.query_params.get('area_type', None)
        if area_type:
            queryset = queryset.filter(area_type=area_type)
        
        parent = request.query_params.get('parent', None)
        if parent == 'root' or parent == 'null':
            queryset = queryset.filter(parent__isnull=True)
        elif parent:
            queryset = queryset.filter(parent_id=parent)
        
        code = request.query_params.get('code', None)
        if code:
            queryset = queryset.filter(code=code)
        
        # Default to countries if no filters provided
        if not any([area_type, parent, code]):
            queryset = queryset.filter(area_type="country")
        
        queryset = queryset.order_by("name")
        
        # Check if recursive output is requested
        recursive = request.query_params.get('recursive', 'false').lower() == 'true'
        
        if recursive:
            data = [area.to_geojson_recursive() for area in queryset]
        else:
            data = [area.to_geojson() for area in queryset]
        
        return Response(data)


class AreaTypeListView(APIView):
    """
    Returns all available area types.
    /api/geography/area-types/
    """
    def get(self, request):
        area_types = [
            {'value': choice[0], 'label': choice[1]}
            for choice in Area.AREA_TYPES
        ]
        return Response(area_types)


class AreaByTypeView(APIView):
    """
    Convenience endpoint to get all areas of a specific type.
    /api/geography/by-type/<area_type>/
    
    Examples:
    /api/geography/by-type/country/
    /api/geography/by-type/county/?parent=<region-uuid>
    """
    def get(self, request, area_type):
        # Validate area_type
        valid_types = [choice[0] for choice in Area.AREA_TYPES]
        if area_type not in valid_types:
            return Response(
                {'error': f'Invalid area_type. Valid types: {", ".join(valid_types)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = Area.objects.filter(area_type=area_type)
        
        # Optional parent filter
        parent = request.query_params.get('parent', None)
        if parent:
            queryset = queryset.filter(parent_id=parent)
        
        queryset = queryset.order_by('name')
        
        # Return as GeoJSON or regular JSON
        format_type = request.query_params.get('format', 'json')
        
        if format_type == 'geojson':
            recursive = request.query_params.get('recursive', 'false').lower() == 'true'
            if recursive:
                data = [area.to_geojson_recursive() for area in queryset]
            else:
                data = [area.to_geojson() for area in queryset]
        else:
            serializer = AreaSerializer(queryset, many=True)
            data = serializer.data
        
        return Response(data)