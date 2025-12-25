import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../../api/authApi";

interface Device {
  id: string;
  device_id: string;
  device_name?: string;
  user_email: string;
  is_trusted: boolean;
}

interface DevicesState {
  status: "idle" | "loading" | "succeeded" | "failed";
  message: string;
  list: Device[];
}

const initialState: DevicesState = {
  status: "idle",
  message: "",
  list: [],
};

export const fetchDevices = createAsyncThunk(
  "devices/fetch",
  async () => {
    const response = await authApi.get("/api/accounts/devices/");
    return response.data;
  }
);

export const registerDevice = createAsyncThunk(
  "devices/register",
  async (payload: { device_id: string; device_name?: string; lat?: number; lon?: number }) => {
    const response = await authApi.post("/api/accounts/devices/register/", payload);
    return response.data;
  }
);

export const fetchPendingDeviceCount = createAsyncThunk(
  "devices/fetchPendingCount",
  async () => {
    const res = await authApi.get("/api/accounts/devices/pending-count/");
    return res.data.pending_count;
  }
);

export const approveDevice = createAsyncThunk(
  "devices/approve",
  async (device_id: string) => {
    const response = await authApi.post(`/accounts/devices/${device_id}/approve/`);
    return response.data;
  }
);

const devicesSlice = createSlice({
  name: "devices",
  initialState: { status: "idle", message: "", list: [], pendingCount: 0, },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(registerDevice.pending, state => { state.status = "loading"; })
      .addCase(registerDevice.fulfilled, (state, action) => { state.status = "succeeded"; state.message = action.payload.detail; })
      .addCase(registerDevice.rejected, (state, action) => { state.status = "failed"; state.message = action.error.message || "Failed"; })
      .addCase(approveDevice.fulfilled, (state, action) => { state.message = action.payload.detail; })
      .addCase(fetchDevices.pending, state => { state.status = "loading"; })
      .addCase(fetchDevices.fulfilled, (state, action) => { state.status = "succeeded"; state.list = Array.isArray(action.payload) ? action.payload : [];})
      .addCase(fetchDevices.rejected, (state, action) => { state.status = "failed"; state.message = action.error.message || "Failed"; })
      .addCase(fetchPendingDeviceCount.fulfilled, (state, action) => {state.pendingCount = action.payload; });
  },
});

export default devicesSlice.reducer;
