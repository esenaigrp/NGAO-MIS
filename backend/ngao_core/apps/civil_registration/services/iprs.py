import requests

IPRS_API_URL = "https://iprs.example.com/api/citizens"

def fetch_citizen_details(id_number: str, last_name: str = None):
    payload = {"id_number": id_number}
    if last_name:
        payload["last_name"] = last_name

    try:
        
        response = requests.get(IPRS_API_URL, params=payload, timeout=10)
        if response.status_code == 200:
            return response.json()
        return None
    except requests.RequestException:
        return None
