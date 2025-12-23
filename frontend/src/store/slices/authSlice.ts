// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAccessToken, setRefreshToken, clearTokens, getAccessToken, getRefreshToken } from "../../auth/tokenStorage";
import axios from "axios";

// ---------------------
// User Type
// ---------------------
export interface User {
  user_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  allowed_area_codes?: string[];
}

// ---------------------
// Auth State
// ---------------------
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isInitialLoad: boolean;
  areas: any[];
}

// ---------------------
// Initial State
// ---------------------
const initialState: AuthState = {
  isAuthenticated: !!getAccessToken(),
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  user: null,
  loading: false,
  error: null,
  isInitialLoad: true,
  areas: [],
};

// ---------------------
// Thunks
// ---------------------
export const login = createAsyncThunk<
  { access: string; refresh: string; user: User },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, thunkAPI) => {
  try {
    // Login
    const res = await axios.post("http://127.0.0.1:8200/api/accounts/login/", { email, password });
    const tokens = res.data;

    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);

    // Fetch user profile
    const profileRes = await axios.get("http://127.0.0.1:8200/api/accounts/me/", {
      headers: { Authorization: `Bearer ${tokens.access}` },
    });

    return { access: tokens.access, refresh: tokens.refresh, user: profileRes.data };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Login failed");
  }
});

// Optional: check auth on page reload
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    if (!access || !refresh) {
      clearTokens();
      return thunkAPI.rejectWithValue("Not authenticated");
    }

    try {
      const res = await axios.get("http://127.0.0.1:8200/api/accounts/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      return { user: res.data, accessToken: access, refreshToken: refresh };
    } catch {
      clearTokens();
      return thunkAPI.rejectWithValue("Session expired");
    }
  }
);

// ---------------------
// Slice
// ---------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      clearTokens();
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      state.areas = [];
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user || null;
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.error = null;
      state.isInitialLoad = false;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isInitialLoad = false;
      state.error = action.payload || "Login failed";
    });


    // CheckAuth
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = !!action.payload.accessToken;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isInitialLoad = false;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isInitialLoad = false;
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
