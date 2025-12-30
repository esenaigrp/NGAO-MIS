from rest_framework.views import APIView
from django.db.models import Q, Value, CharField
from django.db.models.functions import Concat
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Citizen, CitizenQueryLog
from .serializers import CitizenSerializer

class CitizenLookupView(APIView):
    """
    Lookup citizens by search query (name or ID number)
    Supports autocomplete functionality for birth registration forms
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get("query", "").strip()
        id_number = request.data.get("id_number", "").strip()
        last_name = request.data.get("last_name", "").strip()
        module = request.data.get("module", "general")
        limit = int(request.data.get("limit", 10))  # Default 10 results
        
        citizens = []
        found = False
        search_type = None

        # Case 1: Autocomplete search (query parameter)
        if query and len(query) >= 2:
            search_type = "autocomplete"
            
            # Split query into words for multi-word search
            query_words = query.split()
            
            # Build Q objects for searching
            q_objects = Q()
            
            # Single word search - search all name fields and ID
            if len(query_words) == 1:
                q_objects = (
                    Q(first_name__icontains=query) |
                    Q(middle_name__icontains=query) |
                    Q(last_name__icontains=query) |
                    Q(id_number__icontains=query)
                )
            
            # Multi-word search - match combinations of names
            else:
                # Create Q objects for each word
                for word in query_words:
                    q_objects |= (
                        Q(first_name__icontains=word) |
                        Q(middle_name__icontains=word) |
                        Q(last_name__icontains=word)
                    )
                
                # Also search for the full query in concatenated full name
                # This helps match "John Doe" better than individual words
                q_objects |= Q(
                    id__in=Citizen.objects.annotate(
                        full_name=Concat(
                            'first_name', Value(' '),
                            'middle_name', Value(' '),
                            'last_name',
                            output_field=CharField()
                        )
                    ).filter(full_name__icontains=query).values_list('id', flat=True)
                )
            
            # Execute query with optimizations
            citizens = Citizen.objects.filter(q_objects).select_related(
                'current_area'  # Optimize if you have related fields
            ).distinct()[:limit]
            
            found = citizens.exists()
        # Case 2: IPRS-style exact verification (id_number + last_name)
        elif id_number and last_name:
            search_type = "verification"
            citizen = Citizen.objects.filter(
                id_number=id_number,
                last_name__iexact=last_name,
            ).first()
            
            if citizen:
                citizens = [citizen]
                found = True

        # Case 3: Search by ID number only
        elif id_number:
            search_type = "id_only"
            citizen = Citizen.objects.filter(
                id_number=id_number
            ).first()
            
            if citizen:
                citizens = [citizen]
                found = True

        # 🔐 Audit log
        CitizenQueryLog.objects.create(
            user=request.user,
            id_number_queried=id_number if id_number else None,
            last_name_provided=last_name if last_name else None,
            module=module,
            was_found=found,
            ip_address=self._get_client_ip(request),
        )

        # Return appropriate response
        if not found:
            return Response(
                {
                    "detail": "No citizens found matching your search criteria",
                    "query": query,
                    "results": []
                },
                status=status.HTTP_200_OK,  # Changed to 200 for autocomplete
            )

        # Serialize results
        serializer = CitizenSerializer(citizens, many=True)
        
        return Response({
            "results": serializer.data,
            "count": len(citizens),
            "search_type": search_type,
            "query": query
        }, status=status.HTTP_200_OK)

    def _get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip