from rest_framework import permissions


class IsReporterOrAbove(permissions.BasePermission):
    """
    Only allow the reporter or higher hierarchy users to access/edit the incident.
    """

    def has_object_permission(self, request, view, obj):
        if request.user == obj.reported_by:
            return True

        # Example hierarchy check
        hierarchy = [
            "Citizen",
            "Village Elder",
            "Assistant Chief",
            "Chief",
            "ACC",
            "DCC",
            "CC",
            "RC",
            "PS",
            "CS",
        ]
        user_role_index = hierarchy.index(request.user.role)
        reporter_role_index = hierarchy.index(obj.reported_by.role)
        return user_role_index >= reporter_role_index
