from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import AdminUnit, Location


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name", "latitude", "longitude", "admin_unit"]

class AdminUnitSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = AdminUnit
        geo_field = "geometry"  # This is the GeometryField in your model
        fields = (
            'id', 
            'name', 
            'code', 
            'parent', 
            # 'geometry', # Include geometry for GeoJSON output
            # 'centroid' # Optional: Include centroid field
        )
