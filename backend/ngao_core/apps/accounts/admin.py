from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import ContactPoint, CustomUser, OfficerProfile, Role

class OfficerProfileInline(admin.StackedInline):
    model = OfficerProfile
    can_delete = False
    verbose_name_plural = 'Officer Profile'
    fk_name = 'user'  # This links OfficerProfile to CustomUser
    fields = ('phone', 'role', 'role_text', 'badge_number', 'id_number', 'office_email', 'admin_unit', 'is_active', 'notes')
    readonly_fields = ('uid',)
    extra = 0  # don't show extra empty forms

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = ("email", "first_name", "last_name", "is_staff", "is_active")
    list_filter = ("is_active",)
    search_fields = ("email", "first_name", "last_name")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        ("Permissions", {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")
        }),
    )

    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )
    
inlines = [OfficerProfileInline]  # ✅ include the inline here



@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'hierarchy_level')
    fields = ('name', 'hierarchy_level', 'description')


@admin.register(OfficerProfile)
class OfficerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role_text", "badge_number", "admin_unit", "is_active")
    search_fields = ("user__email", "role_text", "badge_number")
   

@admin.register(ContactPoint)
class ContactPointAdmin(admin.ModelAdmin):
    list_display = ("user", "type", "value", "is_primary")

class OfficerProfileInline(admin.StackedInline):
    model = OfficerProfile
    # Setting extra=0 ensures only one profile form is displayed (since it's OneToOne)
    extra = 0 
    can_delete = False # You don't want to delete the profile without deleting the user

