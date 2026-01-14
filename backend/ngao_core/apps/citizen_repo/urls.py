from django.urls import path
from .views import CitizenLookupView

urlpatterns = [
    path("lookup/", CitizenLookupView.as_view(), name="citizen-lookup"),
    
    #  # List all citizens (with pagination)
    # path("", CitizenListView.as_view(), name="citizen-list"),
    
    # # Create new citizen
    # path("create/", CitizenCreateView.as_view(), name="citizen-create"),
    
    # # Get, Update, Delete specific citizen
    # path("<int:citizen_id>/", CitizenDetailView.as_view(), name="citizen-detail"),
]
