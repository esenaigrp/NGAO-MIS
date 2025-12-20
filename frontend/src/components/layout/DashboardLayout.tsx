// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../../routes/ProtectedRoute";

import DashboardHome from "../../features/dashboard/DashboardHome";
import OfficersPage from "../../features/officers/OfficersPage";
import IncidentsPage from "../../features/incidents/IncidentsPage";
import BirthRegistrationList from "../../features/civilRegistration/BirthRegistrationList";
import DeathRegistrationList from "../../features/civilRegistration/DeathRegistrationList";
import MarriageRegistrationList from "../../features/civilRegistration/MarriageRegistrationList";
import LoginPage from "../../features/auth/LoginPage";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    
    {/* Protected dashboard routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardHome />} />
      <Route path="/dashboard/officers" element={<OfficersPage />} />
      <Route path="/dashboard/incidents" element={<IncidentsPage />} />

      {/* Civil Registrations */}
      <Route path="/dashboard/births" element={<BirthRegistrationList />} />
      <Route path="/dashboard/deaths" element={<DeathRegistrationList />} />
      <Route path="/dashboard/marriages" element={<MarriageRegistrationList />} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes>
);

export default AppRoutes;
