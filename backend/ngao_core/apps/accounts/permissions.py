from rest_framework import permissions
from rest_framework.permissions import BasePermission

from ngao_core.apps.accounts.models import OfficerProfile, Role

class IsChiefOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'chief', 'assistant']

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "Admin"


class IsCountyCommissioner(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "County Commissioner"


class IsRegionalCommissioner(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "Regional Commissioner"


class IsSubCountyCommissioner(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "Sub County Commissioner"


class IsCS(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "CS"


class IsPS(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "PS"


class IsACC(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.role
            and request.user.role.name == "Assistant County Commissioner"
        )


class RoleRequired(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in self.allowed_roles


class IsAssistantChief(RoleRequired):
    allowed_roles = ["assistant_chief"]


class IsChief(RoleRequired):
    allowed_roles = ["chief"]


class HasHierarchyAccess(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_authenticated
            and request.user.role
            and obj.officer.role.hierarchy_level >= request.user.role.hierarchy_level
        )


class RolePermission(permissions.BasePermission):
    """
    Generic role-based permission. URL viewset/actions should set `required_roles` attribute
    or define has_object_permission for object-level checks.
    """

    def _user_roles(self, user):
        # adapt to your model: user.role (string) or officer_profile.role.name
        try:
            return [user.role] if getattr(user, "role", None) else []
        except Exception:
            return []

    def has_permission(self, request, view):
        required = getattr(view, "required_roles", None)
        if required is None:
            return True
        user_roles = self._user_roles(request.user)
        # allow superuser
        if request.user.is_superuser:
            return True
        return any(r in user_roles for r in required)

    def has_object_permission(self, request, view, obj):
        # optional: check if the user is in the same admin_unit as the object
        # example: allow access if user.admin_unit == obj.admin_unit or user is superuser or in required roles
        if request.user.is_superuser:
            return True
        required = getattr(view, "required_roles", None)
        if required is None:
            return True
        user_roles = self._user_roles(request.user)
        return any(r in user_roles for r in required)


class HierarchyPermission(RolePermission):
    def has_object_permission(self, request, view, obj):
        # obj should have an admin_unit field or location -> admin unit mapping
        if request.user.is_superuser:
            return True
        user_unit = getattr(request.user, "admin_unit", None)
        if user_unit is None:
            return False
        # allow when obj.admin_unit is equal or descendant of user_unit
        target_unit = getattr(obj, "admin_unit", None) or getattr(obj, "location", None)
        # You'll need a helper to check if target_unit is within user_unit's tree:
        return is_within_admin_unit(
            user_unit, target_unit
        ) or super().has_object_permission(request, view, obj)


class IsAuthenticatedOfficer(BasePermission):
    """
    Simple check that the user is authenticated and has an officer profile.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and hasattr(user, "officer_profile"))


class HasRole(BasePermission):
    """
    Requires user to have one of the allowed roles: pass `allowed_roles` on the view
    e.g. permission_classes = [HasRole]; view.allowed_roles = ['CS', 'RC']
    """

    def has_permission(self, request, view):
        allowed = getattr(view, "allowed_roles", None)
        if not allowed:
            return True  # if not specified, allow
        profile = getattr(request.user, "officer_profile", None)
        if not profile or not profile.role:
            return False
        return profile.role.name in allowed or profile.role.level >= 0


class HierarchicalAccess(BasePermission):
    """
    Checks hierarchical admin unit permissions. Example: a County-level officer
    can access data inside their county and its children. The view should set
    `required_unit` to specify which admin_unit field to compare ('admin_unit' typically).
    """

    def has_object_permission(self, request, view, obj):
        profile = getattr(request.user, "officer_profile", None)
        if not profile or not profile.admin_unit:
            return False

        # Example policy: if object's admin_unit equal or child of officer admin_unit -> allow.
        # Assumes models have parent relationship and object's admin_unit is accessible.
        target_unit = getattr(obj, "admin_unit", None) or getattr(obj, "location", None)
        if target_unit is None:
            return False

        # Walk up parents on target to determine if profile.admin_unit is an ancestor
        current = target_unit
        while current is not None:
            if current == profile.admin_unit:
                return True
            current = getattr(current, "parent", None)
        return False
