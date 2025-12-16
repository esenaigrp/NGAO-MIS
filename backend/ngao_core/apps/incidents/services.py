from .models import Incident
from .utils import can_handle, get_next_status

def advance_incident(incident_id: int, user):
    """
    Moves the incident to the next stage if the user has the right role.
    """
    incident = Incident.objects.get(uid=incident_id)
    user_role = user.role.lower()

    if not can_handle(user_role, incident.status):
        raise PermissionError(
            f"User with role {user_role} cannot handle incident in status {incident.status}"
        )

    incident.status = get_next_status(incident.status)
    incident.current_handler = user
    incident.save()
    # Optionally trigger next handler assignment
    if hasattr(incident, "alert_next_handler"):
        incident.alert_next_handler()
    return incident
