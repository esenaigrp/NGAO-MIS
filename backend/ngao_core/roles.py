ROLE_PERMISSIONS = {
    "cs_interior": "ALL",
    "ps_interior": [
        "incidents.*",
        "officers.*",
        "admin_units.*",
        "reports.*",
    ],
    "regional_commissioner": [
        "incidents.view",
        "incidents.update",
        "incidents.escalate",
        "incidents.assign",
        "incidents.close",
        "officers.view",
        "officers.update",
        "reports.view",
        "reports.generate",
    ],
    "county_commissioner": [
        "incidents.view",
        "incidents.update",
        "incidents.escalate",
        "incidents.close",
        "officers.view",
        "reports.view",
    ],
    "deputy_county_commissioner": [
        "incidents.view",
        "incidents.update",
        "incidents.escalate",
    ],
    "assistant_county_commissioner": [
        "incidents.view",
        "incidents.update",
    ],
    "chief": [
        "incidents.create",
        "incidents.view",
        "incidents.update",
    ],
    "assistant_chief": [
        "incidents.create",
        "incidents.view",
    ],
    "police": [
        "incidents.view",
        "incidents.update",
        "incidents.close",
    ],
    "citizen": [
        "incidents.create",
    ],
}
