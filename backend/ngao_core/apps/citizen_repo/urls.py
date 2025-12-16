from django.urls import path
from .views import CitizenLookupView

urlpatterns = [
    path("lookup/", CitizenLookupView.as_view(), name="citizen-lookup"),
]
