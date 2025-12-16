// src/routes/AppRoutes.tsx
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

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardHome />} />
    <Route element={<ProtectedRoute children={""} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/officers" element={<OfficersPage />} />
        <Route path="/dashboard/incidents" element={<IncidentsPage />} />
        <Route path="/dashboard/births" element={<BirthRegistrationList />} />
        <Route path="/dashboard/deaths" element={<DeathRegistrationList />} />
        <Route path="/dashboard/marriages" element={<MarriageRegistrationList />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);
