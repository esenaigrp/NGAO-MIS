from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission
from rest_framework.permissions import SAFE_METHODS
from ngao_core.apps.admin_structure.models import AdminUnit
from ngao_core.apps.admin_structure.serializers import AdminUnitSerializer
from rest_framework import viewsets
from .models import Location, AdminUnit
from .serializers import LocationSerializer, AdminUnitSerializer



class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


class IsAdminOrReadOnly(BasePermission):
    """
    Only admins can create/update/delete.   
    Others can only read.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class AdminUnitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for all hierarchical admin units:
    - Region
    - County
    - Sub-County
    - Division
    - Location
    - Sublocation
    """
    queryset = AdminUnit.objects.all()
    serializer_class = AdminUnitSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    @action(detail=False, methods=["get"])
    def hierarchy(self, request):
        """
        Returns full admin hierarchy tree.
        """
        units = AdminUnit.objects.all().order_by("level")
        serializer = self.get_serializer(units, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def children(self, request, pk=None):
        """
        Returns children of a specific AdminUnit.
        """
        parent = self.get_object()
        children = AdminUnit.objects.filter(parent=parent)
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)
