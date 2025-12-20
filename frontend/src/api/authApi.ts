// src/api/authApi.ts
import axios from "axios";

// Single axios instance
const authApi = axios.create({
  baseURL: "http://127.0.0.1:8000", // your backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to all requests automatically
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --------------------
// Auth API calls
// --------------------
export const loginApi = async (email: string, password: string) => {
  const res = await authApi.post("/api/accounts/login/", { email, password });
  return res.data; // { access, refresh }
};

export const getCurrentUserApi = async () => {
  const res = await authApi.get("/api/accounts/me/");
  return res.data;
};

export const refreshTokenApi = async (refresh: string) => {
  const res = await authApi.post("/api/accounts/token/refresh/", { refresh });
  return res.data;
};

export default authApi;
