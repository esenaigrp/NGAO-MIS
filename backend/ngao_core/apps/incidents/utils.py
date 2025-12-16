# nga_core/apps/incidents/utils.py

ROLE_ORDER = {
    "citizen": 1,
    "village_elder": 2,
    "assistant_chief": 3,
    "chief": 4,
    "acc": 5,
    "dcc": 6,
    "cc": 7,
    "rc": 8,
    "ps_cs": 9,
}

STATUS_FLOW = {
    "submitted": "village_elder",
    "forwarded_by_elder": "assistant_chief",
    "classified": "chief",
    "approved": ["acc", "dcc"],
    "escalated": ["cc", "rc"],
    "reviewed": "ps_cs",
    "closed": None,
}


def can_handle(user_role: str, current_status: str) -> bool:
    """Check if the user's role can handle the incident at this status."""
    next_roles = STATUS_FLOW.get(current_status)
    if next_roles is None:
        return False
    if isinstance(next_roles, list):
        return user_role in next_roles
    return user_role == next_roles


def get_next_status(current_status: str) -> str:
    """Return the next status after current_status."""
    next_roles = STATUS_FLOW.get(current_status)
    if next_roles is None:
        return "closed"
    return (
        f"forwarded_by_{next_roles}"
        if isinstance(next_roles, str)
        else "approved_or_escalated"
    )
