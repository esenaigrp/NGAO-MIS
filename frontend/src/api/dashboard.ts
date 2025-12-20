// src/api/dashboard.ts
import authApi from "./axiosClient";

export const fetchDashboardOverview = () =>
  authApi.get("/dashboard/overview/");
