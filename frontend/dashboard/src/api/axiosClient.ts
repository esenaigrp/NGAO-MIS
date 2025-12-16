import axios from "axios";
import { store } from "../store";
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from "../auth/tokenStorage";
import { logout } from "../store/slices/authSlice";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// --------------------
// REQUEST
// --------------------
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --------------------
// RESPONSE (refresh token)
// --------------------
let isRefreshing = false;
let queue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return axiosClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refresh = getRefreshToken();
        if (!refresh) throw new Error("No refresh token");

        const res = await axios.post(`${API_BASE}/accounts/token/refresh/`, {
          refresh,
        });

        setAccessToken(res.data.access);
        processQueue(null, res.data.access);

        original.headers.Authorization = `Bearer ${res.data.access}`;
        return axiosClient(original);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        store.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
