from django.test import TestCase

from .models import AdminUnit, CustomUser, OfficerProfile, Role


class AccountsModelTest(TestCase):
    def test_role_creation(self):
        r = Role.objects.create(name="TestRole", level=1)
        self.assertEqual(str(r), "TestRole")

    def test_user_and_profile(self):
        u = CustomUser.objects.create_user(email="t@example.com", password="pw")
        a = AdminUnit.objects.create(name="TestCounty", unit_type="county")
        r = Role.objects.create(name="Tester", level=1)
        p = OfficerProfile.objects.create(user=u, role=r, admin_unit=a)
        self.assertEqual(p.user.email, "t@example.com")
