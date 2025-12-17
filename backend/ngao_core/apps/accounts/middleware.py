from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from .models import Device
from math import radians, cos, sin, asin, sqrt


    
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

class DeviceCheckMiddleware(MiddlewareMixin):
    def process_request(self, request):
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            device_id = request.headers.get("X-DEVICE-ID")
            latitude = request.headers.get("X-LAT")
            longitude = request.headers.get("X-LON")
            if device_id:
                try:
                    device = Device.objects.get(user=user, device_id=device_id)
                    if not device.is_trusted:
                        return JsonResponse({"detail": "Device not approved."}, status=403)
                    # geolock check
                    if device.allowed_lat and device.allowed_lon:
                        if not latitude or not longitude:
                            return JsonResponse({"detail": "Location required."}, status=403)
                        distance = haversine(
                            float(latitude), float(longitude),
                            device.allowed_lat, device.allowed_lon
                        )
                        if distance > device.allowed_radius_meters:
                            return JsonResponse({"detail": "Login outside allowed area."}, status=403)
                except Device.DoesNotExist:
                    return JsonResponse({"detail": "Device unknown."}, status=403)
                
                