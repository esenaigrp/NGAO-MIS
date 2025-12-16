from rest_framework import permissions

class IsAdminOrSender(permissions.BasePermission):
    """
    - Admin can manage all communications.
    - Sender can manage their own messages.
    - Others can only read.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.sender == request.user
