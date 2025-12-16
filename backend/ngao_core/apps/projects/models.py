from django.db import models
from django.contrib.gis.db.models import PointField
from django.conf import settings
import uuid

User = settings.AUTH_USER_MODEL

PROJECT_STATUS = [
    ("planned", "Planned"),
    ("ongoing", "Ongoing"),
    ("delayed", "Delayed"),
    ("completed", "Completed"),
    ("closed", "Closed"),
]

class Project(models.Model):
    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    location = PointField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=PROJECT_STATUS, default="planned")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="projects_created")
    assigned_officers = models.ManyToManyField(User, related_name="assigned_projects", blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Milestone(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="milestones")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    achieved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.project.title} - {self.title}"
