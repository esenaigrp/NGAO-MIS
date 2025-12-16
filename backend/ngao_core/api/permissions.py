from rest_framework.permissions import BasePermission

from ngao_core.utils.permissions import has_permission


class HasNGAPermission(BasePermission):
    required_permission = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return has_permission(request.user, self.required_permission)
