# ngao_core/apps/geography/serializers.py
from rest_framework import serializers
from .models import Area

class AreaSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Area
        fields = [
            "id",
            "name",
            "code",
            "area_type",
            "latitude",
            "longitude",
            "boundary",
            "children",
        ]

    def get_children(self, obj):
        children_qs = obj.children.all().order_by("name")
        if children_qs.exists():
            return AreaSerializer(children_qs, many=True, context=self.context).data
        return []

