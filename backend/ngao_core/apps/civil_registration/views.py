from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.db import transaction
from datetime import datetime
from django.utils import timezone

from .models import (
    RegistrationRequest,
    BirthRegistration,
    DeathRegistration,
    MarriageRegistration,
)
from .serializers import (
    RegistrationRequestSerializer,
    BirthRegistrationSerializer,
    DeathRegistrationSerializer,
    MarriageRegistrationSerializer,
)

from ngao_core.apps.citizen_repo.models import Citizen


# ---------- Registration Request ViewSet ----------
class RegistrationRequestViewSet(viewsets.ModelViewSet):
    queryset = RegistrationRequest.objects.all().order_by("-created_at")
    serializer_class = RegistrationRequestSerializer

    @action(detail=True, methods=["post"])
    def verify_parents(self, request, pk=None):
        reg_req = self.get_object()
        mother_ok = request.data.get("mother_verified", False)
        father_ok = request.data.get("father_verified", False)
        chief_user = request.user
        reg_req.verify_parents(mother_ok, father_ok, chief_user)
        return Response({"status": reg_req.status})


# ---------- Birth Registration ViewSet ----------
class BirthRegistrationViewSet(viewsets.ModelViewSet):
    queryset = (
        BirthRegistration.objects.select_related(
            "child", "mother", "father", "initiated_by", "area"
        )
        .all()
        .order_by("-created_at")
    )
    serializer_class = BirthRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter based on user permissions and area"""
        user = self.request.user
        queryset = super().get_queryset()

        # Filter by status if provided
        status_filter = self.request.query_params.get("status", None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by area if user has area restrictions
        if hasattr(user, "area") and user.area:
            queryset = queryset.filter(area=user.area)

        return queryset

    def get_or_create_citizen(self, citizen_id=None, citizen_manual=None):
        """
        Get existing citizen by ID or create new one from manual data.
        Returns (citizen, created) tuple.
        Checks for duplicates by id_number.
        """
        if citizen_id:
            # Use existing citizen
            try:
                citizen = Citizen.objects.get(id=citizen_id)
                return citizen, False
            except Citizen.DoesNotExist:
                raise ValueError(f"Citizen with ID {citizen_id} not found")
        
        elif citizen_manual:
            # Validate manual data
            required_fields = ['first_name', 'last_name']
            missing_fields = [field for field in required_fields if not citizen_manual.get(field)]
            if missing_fields:
                raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
            
            id_number = citizen_manual.get("id_number")

            existing_citizen = None
            if id_number:
                existing_citizen = Citizen.objects.filter(
                    id_number=id_number
                ).first()
            
            if existing_citizen:
                # Citizen already exists with this ID number
                return existing_citizen, False
                        
            # Create new citizen
            citizen = Citizen.objects.create(
                first_name=citizen_manual['first_name'],
                middle_name=citizen_manual.get('middle_name', ''),
                last_name=citizen_manual['last_name'],
                id_number=citizen_manual['id_number'],
                date_of_birth=citizen_manual['date_of_birth'],
                gender=citizen_manual['gender'],
                is_alive=True
            )
            return citizen, True
        
        else:
            raise ValueError("Either citizen_id or citizen_manual must be provided")

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create birth registration with automatic citizen creation if needed"""
        try:
            # Extract data from request
            child_id = request.data.get('child')
            child_manual = request.data.get('child_manual')
            mother_id = request.data.get('mother')
            mother_manual = request.data.get('mother_manual')
            father_id = request.data.get('father')
            father_manual = request.data.get('father_manual')
            
            # Validate at least one option is provided for required fields
            if not child_id and not child_manual:
                return Response(
                    {'error': 'Either child ID or child manual data is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not mother_id and not mother_manual:
                return Response(
                    {'error': 'Either mother ID or mother manual data is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create child
            child, child_created = self.get_or_create_citizen(child_id, child_manual)
            
            # Check for duplicate birth registration for this child
            existing = BirthRegistration.objects.filter(
                child=child
            ).exclude(status='rejected').first()
            
            if existing:
                return Response({
                    'error': 'duplicate_registration',
                    'message': f'This child is already registered (Reference: {existing.reference_number}). A child cannot be registered more than once.',
                    'existing_registration': {
                        'reference_number': existing.reference_number,
                        'date_of_birth': existing.date_of_birth.isoformat() if existing.date_of_birth else None,
                        'status': existing.status,
                        'child_id': str(child.id),
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create mother
            mother, mother_created = self.get_or_create_citizen(mother_id, mother_manual)
            
            # Get or create father (optional)
            father = None
            if father_id or father_manual:
                father, father_created = self.get_or_create_citizen(father_id, father_manual)
            
            # Prepare birth registration data
            birth_data = {
                'child': child.id,
                'mother': mother.id,
                'father': father.id if father else None,
                'place_of_birth': request.data.get('place_of_birth'),
                'date_of_birth': request.data.get('date_of_birth'),
                'gender': request.data.get('gender', 'M'),
                'area': request.data.get('area'),
            }
            
            # Update child's date of birth if it was just created or not set
            if child_created or not child.date_of_birth:
                child.date_of_birth = birth_data['date_of_birth']
                child.gender = birth_data['gender']
                child.save()
            
            # Create birth registration
            serializer = self.get_serializer(data=birth_data)
            serializer.is_valid(raise_exception=True)
            serializer.save(initiated_by=request.user)
            
            response_data = serializer.data
            response_data['citizens_created'] = {
                'child': child_created,
                'mother': mother_created,
                'father': father_created if father else False
            }
            
            headers = self.get_success_headers(response_data)
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Update birth registration with duplicate check"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        try:
            # Extract data from request
            child_id = request.data.get('child')
            child_manual = request.data.get('child_manual')
            mother_id = request.data.get('mother')
            mother_manual = request.data.get('mother_manual')
            father_id = request.data.get('father')
            father_manual = request.data.get('father_manual')
            
            # Get or create citizens if provided
            if child_id or child_manual:
                child, _ = self.get_or_create_citizen(child_id, child_manual)
                
                # Check for duplicate if child is being changed
                if str(instance.child.id) != str(child.id):
                    existing = BirthRegistration.objects.filter(
                        child=child
                    ).exclude(
                        Q(id=instance.id) | Q(status='rejected')
                    ).first()
                    
                    if existing:
                        return Response({
                            'error': 'duplicate_registration',
                            'message': f'This child is already registered (Reference: {existing.reference_number}).'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                request.data['child'] = child.id
            
            if mother_id or mother_manual:
                mother, _ = self.get_or_create_citizen(mother_id, mother_manual)
                request.data['mother'] = mother.id
            
            if father_id or father_manual:
                father, _ = self.get_or_create_citizen(father_id, father_manual)
                request.data['father'] = father.id
            
            # Update birth registration
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["post"])
    def check_duplicate(self, request):
        """Check if a child is already registered before submission"""
        child_id = request.data.get("child_id")
        child_id_number = request.data.get("child_id_number")

        if not child_id and not child_id_number:
            return Response(
                {"error": "Either child_id or child_id_number is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find child by ID or ID number
        if child_id:
            try:
                child = Citizen.objects.get(id=child_id)
            except Citizen.DoesNotExist:
                return Response(
                    {"is_duplicate": False, "message": "Child not found in system"}
                )
        else:
            child = Citizen.objects.filter(id_number=child_id_number).first()
            if not child:
                return Response(
                    {"is_duplicate": False, "message": "Child not found in system"}
                )

        existing = (
            BirthRegistration.objects.filter(child=child)
            .exclude(status="rejected")
            .first()
        )

        if existing:
            return Response(
                {
                    "is_duplicate": True,
                    "message": "This child is already registered",
                    "existing_registration": {
                        "reference_number": existing.reference_number,
                        "child_name": existing.child.get_full_name(),
                        "date_of_birth": existing.date_of_birth,
                        "status": existing.status,
                        "mother": (
                            existing.mother.get_full_name() if existing.mother else None
                        ),
                        "father": (
                            existing.father.get_full_name() if existing.father else None
                        ),
                    },
                }
            )

        return Response(
            {"is_duplicate": False, "message": "Child is not registered yet"}
        )

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """Submit draft for approval"""
        birth = self.get_object()

        if birth.status != "draft":
            return Response(
                {"error": "Only draft registrations can be submitted"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate required fields before submission
        errors = {}
        if not birth.child:
            errors["child"] = "Child is required"
        if not birth.mother:
            errors["mother"] = "Mother is required"
        if not birth.date_of_birth:
            errors["date_of_birth"] = "Date of birth is required"
        if not birth.place_of_birth:
            errors["place_of_birth"] = "Place of birth is required"

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Check duplicate again before submission
        existing = (
            BirthRegistration.objects.filter(child=birth.child)
            .exclude(Q(id=birth.id) | Q(status="rejected"))
            .first()
        )

        if existing:
            return Response(
                {
                    "error": "Duplicate registration detected",
                    "existing_registration": existing.reference_number,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        birth.status = "submitted"
        birth.submitted_at = timezone.now()
        birth.save()

        return Response(
            {
                "status": birth.status,
                "message": "Birth registration submitted successfully",
            }
        )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve birth registration"""
        birth = self.get_object()

        if birth.status != "submitted":
            return Response(
                {"error": "Only submitted registrations can be approved"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user has permission to approve
        if not request.user.has_perm("civil.approve_birthregistration"):
            return Response(
                {"error": "You do not have permission to approve registrations"},
                status=status.HTTP_403_FORBIDDEN,
            )

        birth.approve()

        return Response(
            {
                "status": birth.status,
                "message": "Birth registration approved successfully",
                "reference_number": birth.reference_number,
            }
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Reject birth registration"""
        birth = self.get_object()
        reason = request.data.get("reason", "")

        if birth.status not in ["submitted", "draft"]:
            return Response(
                {"error": "Only draft or submitted registrations can be rejected"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.has_perm("civil.reject_birthregistration"):
            return Response(
                {"error": "You do not have permission to reject registrations"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not reason:
            return Response(
                {"error": "Rejection reason is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        birth.status = "rejected"
        birth.rejection_reason = reason
        birth.rejected_by = request.user
        birth.rejected_at = timenow.now()
        birth.save()

        return Response(
            {
                "status": birth.status,
                "message": "Birth registration rejected",
                "reason": reason,
            }
        )

    @action(detail=True, methods=["post"])
    def verify_parents(self, request, pk=None):
        """Verify mother and/or father"""
        birth = self.get_object()
        mother_verified = request.data.get("mother_verified", False)
        father_verified = request.data.get("father_verified", False)

        birth.mother_verified = mother_verified
        birth.father_verified = father_verified

        # Track who verified
        birth.verified_by = request.user
        birth.verified_at = timezone.now()
        birth.save()

        return Response(
            {
                "mother_verified": birth.mother_verified,
                "father_verified": birth.father_verified,
                "message": "Parent verification updated successfully",
            }
        )

    @action(detail=True, methods=["get"])
    def generate_certificate(self, request, pk=None):
        """Generate birth certificate (only for approved registrations)"""
        birth = self.get_object()

        if birth.status != "approved":
            return Response(
                {"error": "Only approved registrations can generate certificates"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # TODO: Implement actual certificate generation logic
        # This could generate a PDF, update certificate number, etc.

        return Response(
            {
                "message": "Certificate generation initiated",
                "reference_number": birth.reference_number,
                "child_name": birth.child.get_full_name(),
                "date_of_birth": birth.date_of_birth,
            }
        )

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get birth registration statistics"""
        queryset = self.get_queryset()

        stats = {
            "total": queryset.count(),
            "draft": queryset.filter(status="draft").count(),
            "submitted": queryset.filter(status="submitted").count(),
            "approved": queryset.filter(status="approved").count(),
            "rejected": queryset.filter(status="rejected").count(),
            "mother_verified": queryset.filter(mother_verified=True).count(),
            "father_verified": queryset.filter(father_verified=True).count(),
        }

        return Response(stats)

    @action(detail=False, methods=["post"])
    def bulk_approve(self, request):
        """Bulk approve multiple registrations"""
        ids = request.data.get("ids", [])

        if not ids:
            return Response(
                {"error": "No registration IDs provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.has_perm("civil.approve_birthregistration"):
            return Response(
                {"error": "You do not have permission to approve registrations"},
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            births = BirthRegistration.objects.filter(id__in=ids, status="submitted")

            for birth in births:
                birth.approve()

        return Response(
            {
                "message": f"{births.count()} registrations approved successfully",
                "approved_count": births.count(),
            }
        )

    def destroy(self, request, *args, **kwargs):
        """Only allow deletion of draft registrations"""
        instance = self.get_object()

        if instance.status != "draft":
            return Response(
                {"error": "Only draft registrations can be deleted"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)

# ---------- Death Registration ViewSet ----------
class DeathRegistrationViewSet(viewsets.ModelViewSet):
    queryset = (
        DeathRegistration.objects.select_related(
            "citizen", "initiated_by", "area"
        )
        .all()
        .order_by("-created_at")
    )
    serializer_class = DeathRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter based on user permissions and area"""
        user = self.request.user
        queryset = super().get_queryset()

        # Filter by status if provided
        status_filter = self.request.query_params.get("status", None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by area if user has area restrictions
        if hasattr(user, "area") and user.area:
            queryset = queryset.filter(area=user.area)

        return queryset

    def get_or_create_citizen(self, citizen_id=None, citizen_manual=None):
        """
        Get existing citizen by ID or create new one from manual data.
        Returns (citizen, created) tuple.
        Checks for duplicates by id_number.
        """
        if citizen_id:
            # Use existing citizen
            try:
                citizen = Citizen.objects.get(id=citizen_id)
                return citizen, False
            except Citizen.DoesNotExist:
                raise ValueError(f"Citizen with ID {citizen_id} not found")
        
        elif citizen_manual:
            # Validate manual data
            required_fields = ['first_name', 'last_name']
            missing_fields = [field for field in required_fields if not citizen_manual.get(field)]
            if missing_fields:
                raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
            
            # Check for duplicate by id_number if provided
            id_number = citizen_manual.get('id_number')
            if id_number:
                existing_citizen = Citizen.objects.filter(
                    id_number=id_number
                ).first()
                
                if existing_citizen:
                    # Citizen already exists with this ID number
                    return existing_citizen, False
            
            # Create new citizen (for death registration, may not have ID number)
            citizen = Citizen.objects.create(
                first_name=citizen_manual['first_name'],
                middle_name=citizen_manual.get('middle_name', ''),
                last_name=citizen_manual['last_name'],
                id_number=citizen_manual.get('id_number', ''),
                date_of_birth=citizen_manual.get('date_of_birth'),
                gender=citizen_manual.get('gender', 'M'),
                is_alive=False  # Set to False for death registration
            )
            return citizen, True
        
        else:
            raise ValueError("Either citizen_id or citizen_manual must be provided")

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create death registration with automatic citizen creation if needed"""
        try:
            # Extract data from request
            citizen_id = request.data.get('citizen')
            citizen_manual = request.data.get('citizen_manual')
            
            # Validate at least one option is provided
            if not citizen_id and not citizen_manual:
                return Response(
                    {'error': 'Either citizen ID or citizen manual data is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create citizen
            citizen, citizen_created = self.get_or_create_citizen(citizen_id, citizen_manual)
            
            # Check for duplicate death registration for this citizen
            existing = DeathRegistration.objects.filter(
                citizen=citizen
            ).exclude(status='rejected').first()
            
            if existing:
                return Response({
                    'error': 'duplicate_registration',
                    'message': f'This citizen is already registered as deceased (Reference: {existing.reference_number}).',
                    'existing_registration': {
                        'reference_number': existing.reference_number,
                        'date_of_death': existing.date_of_death.isoformat() if existing.date_of_death else None,
                        'status': existing.status,
                        'citizen_id': str(citizen.id),
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Prepare death registration data
            death_data = {
                'citizen': citizen.id,
                'date_of_death': request.data.get('date_of_death'),
                'place_of_death': request.data.get('place_of_death'),
                'cause_of_death': request.data.get('cause_of_death'),
                'age': request.data.get('age'),
                'comments': request.data.get('comments', ''),
                'area': request.data.get('area'),
                'status': request.data.get('status', 'draft'),
            }
            
            # Create death registration
            serializer = self.get_serializer(data=death_data)
            serializer.is_valid(raise_exception=True)
            serializer.save(initiated_by=request.user)
            
            response_data = serializer.data
            response_data['citizen_created'] = citizen_created
            
            headers = self.get_success_headers(response_data)
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Update death registration with duplicate check"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        try:
            # Extract data from request
            citizen_id = request.data.get('citizen')
            citizen_manual = request.data.get('citizen_manual')
            
            # Get or create citizen if provided
            if citizen_id or citizen_manual:
                citizen, _ = self.get_or_create_citizen(citizen_id, citizen_manual)
                
                # Check for duplicate if citizen is being changed
                if str(instance.citizen.id) != str(citizen.id):
                    existing = DeathRegistration.objects.filter(
                        citizen=citizen
                    ).exclude(
                        Q(id=instance.id) | Q(status='rejected')
                    ).first()
                    
                    if existing:
                        return Response({
                            'error': 'duplicate_registration',
                            'message': f'This citizen is already registered as deceased (Reference: {existing.reference_number}).'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                request.data['citizen'] = citizen.id
            
            # Update death registration
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["post"])
    def check_duplicate(self, request):
        """Check if a citizen is already registered as deceased"""
        citizen_id = request.data.get("citizen_id")
        citizen_id_number = request.data.get("citizen_id_number")

        if not citizen_id and not citizen_id_number:
            return Response(
                {"error": "Either citizen_id or citizen_id_number is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find citizen by ID or ID number
        if citizen_id:
            try:
                citizen = Citizen.objects.get(id=citizen_id)
            except Citizen.DoesNotExist:
                return Response(
                    {"is_duplicate": False, "message": "Citizen not found in system"}
                )
        else:
            citizen = Citizen.objects.filter(id_number=citizen_id_number).first()
            if not citizen:
                return Response(
                    {"is_duplicate": False, "message": "Citizen not found in system"}
                )

        existing = (
            DeathRegistration.objects.filter(citizen=citizen)
            .exclude(status="rejected")
            .first()
        )

        if existing:
            return Response(
                {
                    "is_duplicate": True,
                    "message": "This citizen is already registered as deceased",
                    "existing_registration": {
                        "reference_number": existing.reference_number,
                        "citizen_name": existing.citizen.get_full_name(),
                        "date_of_death": existing.date_of_death,
                        "place_of_death": existing.place_of_death,
                        "status": existing.status,
                    },
                }
            )

        return Response(
            {"is_duplicate": False, "message": "Citizen is not registered as deceased"}
        )

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """Submit draft for approval"""
        death = self.get_object()

        if death.status != "draft":
            return Response(
                {"error": "Only draft registrations can be submitted"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate required fields
        errors = {}
        if not death.citizen:
            errors["citizen"] = "Citizen is required"
        if not death.date_of_death:
            errors["date_of_death"] = "Date of death is required"
        if not death.place_of_death:
            errors["place_of_death"] = "Place of death is required"
        if not death.cause_of_death:
            errors["cause_of_death"] = "Cause of death is required"

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        death.status = "submitted"
        death.submitted_at = timezone.now()
        death.save()

        return Response(
            {
                "status": death.status,
                "message": "Death registration submitted successfully",
            }
        )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve death registration"""
        death = self.get_object()

        if death.status != "submitted":
            return Response(
                {"error": "Only submitted registrations can be approved"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.has_perm("civil.approve_deathregistration"):
            return Response(
                {"error": "You do not have permission to approve registrations"},
                status=status.HTTP_403_FORBIDDEN,
            )

        death.approve()
        death.approved_by = request.user
        death.approved_at = timezone.now()
        death.save()

        return Response(
            {
                "status": death.status,
                "message": "Death registration approved successfully",
                "reference_number": death.reference_number,
            }
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Reject death registration"""
        death = self.get_object()
        reason = request.data.get("reason", "")

        if death.status not in ["submitted", "draft"]:
            return Response(
                {"error": "Only draft or submitted registrations can be rejected"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.has_perm("civil.reject_deathregistration"):
            return Response(
                {"error": "You do not have permission to reject registrations"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not reason:
            return Response(
                {"error": "Rejection reason is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        death.status = "rejected"
        death.save()

        return Response(
            {
                "status": death.status,
                "message": "Death registration rejected",
                "reason": reason,
            }
        )

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get death registration statistics"""
        queryset = self.get_queryset()

        stats = {
            "total": queryset.count(),
            "draft": queryset.filter(status="draft").count(),
            "submitted": queryset.filter(status="submitted").count(),
            "approved": queryset.filter(status="approved").count(),
            "rejected": queryset.filter(status="rejected").count(),
        }

        return Response(stats)

    @action(detail=False, methods=["post"])
    def bulk_approve(self, request):
        """Bulk approve multiple registrations"""
        ids = request.data.get("ids", [])

        if not ids:
            return Response(
                {"error": "No registration IDs provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.has_perm("civil.approve_deathregistration"):
            return Response(
                {"error": "You do not have permission to approve registrations"},
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            deaths = DeathRegistration.objects.filter(id__in=ids, status="submitted")

            for death in deaths:
                death.approve()
                death.approved_at = timezone.now()
                death.save()

        return Response(
            {
                "message": f"{deaths.count()} registrations approved successfully",
                "approved_count": deaths.count(),
            }
        )

    def destroy(self, request, *args, **kwargs):
        """Only allow deletion of draft registrations"""
        instance = self.get_object()

        if instance.status != "draft":
            return Response(
                {"error": "Only draft registrations can be deleted"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)


# ---------- Marriage Registration ViewSet ----------
class MarriageRegistrationViewSet(viewsets.ModelViewSet):
    queryset = MarriageRegistration.objects.all().order_by("-date_of_marriage")
    serializer_class = MarriageRegistrationSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        marriage = self.get_object()
        marriage.approve()
        return Response({"status": marriage.status})
