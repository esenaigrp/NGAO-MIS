import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axiosClient";
import { DashboardStats } from "../../types/dashboard";

interface DashboardState {
  data: DashboardStats | null
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
}

export const loadDashboard = createAsyncThunk<
  DashboardStats,
  void,
  { rejectValue: string }
>("dashboard/load", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/incidents/dashboard-stats/")
    return res.data
  } catch (err: any) {
    const message =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to load dashboard"
    return rejectWithValue(message)
  }
})

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        loadDashboard.fulfilled,
        (state, action: PayloadAction<DashboardStats>) => {
          state.loading = false
          state.data = action.payload
        }
      )
      .addCase(loadDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Something went wrong"
      })
  },
})

export const { resetDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
