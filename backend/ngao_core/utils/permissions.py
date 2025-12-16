def has_permission(user, perm):
    role = user.role

    # CS Interior → full access
    if ROLE_PERMISSIONS.get(role) == "ALL":
        return True

    allowed = ROLE_PERMISSIONS.get(role, [])

    # Support wildcards: incidents.*, officers.*, etc
    for p in allowed:
        if p.endswith(".*"):
            prefix = p.split(".*")[0]
            if perm.startswith(prefix):
                return True

        if p == perm:
            return True

    return False
