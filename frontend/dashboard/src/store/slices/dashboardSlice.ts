// src/store/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDashboardOverview } from "../../api/dashboard";

interface DashboardState {
  stats: any;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

export const loadDashboard = createAsyncThunk(
  "dashboard/load",
  async (_, thunkAPI) => {
    try {
      const res = await fetchDashboardOverview();
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue("Failed to load dashboard");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(loadDashboard.pending, (s) => {
      s.loading = true;
    });
    b.addCase(loadDashboard.fulfilled, (s, a) => {
      s.loading = false;
      s.stats = a.payload;
    });
    b.addCase(loadDashboard.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload as string;
    });
  },
});

export default dashboardSlice.reducer;
