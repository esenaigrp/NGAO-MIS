from rest_framework import permissions

class IsAdminOrOfficer(permissions.BasePermission):
    """
    Custom permission:
    - Admin can CRUD all citizens.
    - Officer can read only citizens in their assigned location.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        return obj.location in request.user.officerprofile.assigned_locations.all()
