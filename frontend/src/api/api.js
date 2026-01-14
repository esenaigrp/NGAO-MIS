import axios from "axios";
import { getAccessToken } from "../auth/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:82000";


const api = axios.create({
   baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats/");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export default api;