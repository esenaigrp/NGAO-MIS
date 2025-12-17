import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../components/layout/DashboardLayout";

import DashboardHome from "../features/dashboard/DashboardHome";
import OfficersPage from "../features/officers/OfficersPage";
import IncidentsPage from "../features/incidents/IncidentsPage";
import BirthRegistrationList from "../features/civilRegistration/BirthRegistrationList";
import DeathRegistrationList from "../features/civilRegistration/DeathRegistrationList";
import MarriageRegistrationList from "../features/civilRegistration/MarriageRegistrationList";
import LoginPage from "../features/auth/LoginPage";
import { DeviceApprovalList } from "../features/users/DeviceApprovalList";

const AppRoutes = () => (
  <Routes>
    {/* Public route */}
    <Route path="/login" element={<LoginPage />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/officers" element={<OfficersPage />} />
        <Route path="/dashboard/incidents" element={<IncidentsPage />} />
        <Route path="/dashboard/births" element={<BirthRegistrationList />} />
        <Route path="/dashboard/deaths" element={<DeathRegistrationList />} />
        <Route path="/dashboard/marriages" element={<MarriageRegistrationList />} />
        <Route path="/devices" element={<DeviceApprovalList />} />
      </Route>
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
