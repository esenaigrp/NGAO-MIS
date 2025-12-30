from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.db import transaction
from datetime import datetime

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
    

    def create(self, request, *args, **kwargs):
        """Create birth registration with duplicate check"""
        child_id = request.data.get('child')
        
        # Check for duplicate registration
        existing = BirthRegistration.objects.filter(
            child_id=child_id
        ).exclude(status='rejected').first()
        
        if existing:
            return Response({
                'error': 'duplicate_registration',
                'message': f'This child is already registered (Reference: {existing.reference_number}). A child cannot be registered more than once.',
                'existing_registration': {
                    'reference_number': existing.reference_number,
                    'date_of_birth': existing.date_of_birth.isoformat() if existing.date_of_birth else None,
                    'status': existing.status,
                    'mother': existing.mother.first_name if existing.mother else None,
                    'father': existing.father.first_name if existing.father else None,
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add registered_by to request data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(registered_by=request.user)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Update with duplicate check (if child is changed)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        child_id = request.data.get('child')
        
        # Only check if child is being changed
        if child_id and str(instance.child.id) != str(child_id):
            existing = BirthRegistration.objects.filter(
                child_id=child_id
            ).exclude(
                Q(id=instance.id) | Q(status='rejected')
            ).first()
            
            if existing:
                return Response({
                    'error': 'duplicate_registration',
                    'message': f'This child is already registered (Reference: {existing.reference_number}). A child cannot be registered more than once.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
        """Update with duplicate check (if child is changed)"""
        instance = self.get_object()
        child_id = self.request.data.get("child")

        # Only check if child is being changed
        if child_id and str(instance.child.id) != str(child_id):
            existing = (
                BirthRegistration.objects.filter(child_id=child_id)
                .exclude(Q(id=instance.id) | Q(status="rejected"))
                .first()
            )

            if existing:
                raise ValidationError(
                    {
                        "child": f"This child is already registered (Reference: {existing.reference_number}). "
                        f"A child cannot be registered more than once."
                    }
                )

        serializer.save()

    @action(detail=False, methods=["post"])
    def check_duplicate(self, request):
        """Check if a child is already registered before submission"""
        child_id = request.data.get("child_id")

        if not child_id:
            return Response(
                {"error": "child_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        existing = (
            BirthRegistration.objects.filter(child_id=child_id)
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
        birth.submitted_at = datetime.now()
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

        birth.status = "approved"
        birth.approved_by = request.user
        birth.approved_at = datetime.now()
        birth.save()

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
        birth.rejected_at = datetime.now()
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
        birth.verified_at = datetime.now()
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

            updated = births.update(
                status="approved", approved_by=request.user, approved_at=datetime.now()
            )

        return Response(
            {
                "message": f"{updated} registrations approved successfully",
                "approved_count": updated,
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
    queryset = DeathRegistration.objects.all().order_by("-created_at")
    serializer_class = DeathRegistrationSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        death = self.get_object()
        death.approve()
        return Response({"status": death.status})


# ---------- Marriage Registration ViewSet ----------
class MarriageRegistrationViewSet(viewsets.ModelViewSet):
    queryset = MarriageRegistration.objects.all().order_by("-date_of_marriage")
    serializer_class = MarriageRegistrationSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        marriage = self.get_object()
        marriage.approve()
        return Response({"status": marriage.status})
