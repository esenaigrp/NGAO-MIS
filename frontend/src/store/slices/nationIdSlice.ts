import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// --------- Async Thunks ---------

// Fetch all National ID requests
export const fetchRequests = createAsyncThunk(
  "nationalId/fetchRequests",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/national_id/requests/");
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// Create new National ID request
export const createRequest = createAsyncThunk(
  "nationalId/createRequest",
  async (payload: any, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/national_id/requests/", payload);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// Verify parents (chief verification)
export const verifyParents = createAsyncThunk(
  "nationalId/verifyParents",
  async ({ id, mother_ok, father_ok }: any, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/national_id/requests/${id}/verify/`, {
        mother_verified: mother_ok,
        father_verified: father_ok,
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// Submit to NRB
export const submitToNRB = createAsyncThunk(
  "nationalId/submitToNRB",
  async (id: string, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/national_id/requests/${id}/submit/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// Approve request
export const approveRequest = createAsyncThunk(
  "nationalId/approveRequest",
  async (id: string, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/national_id/requests/${id}/approve/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// Reject request
export const rejectRequest = createAsyncThunk(
  "nationalId/rejectRequest",
  async (id: string, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/national_id/requests/${id}/reject/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// --------- Slice ---------
interface NationalIdState {
  requests: any[];
  currentRequest: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: NationalIdState = {
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,
};

const nationIdSlice = createSlice({
  name: "nationalId",
  initialState,
  reducers: {
    setCurrentRequest(state, action: PayloadAction<any>) {
      state.currentRequest = action.payload;
    },
    clearCurrentRequest(state) {
      state.currentRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Parent verification
      .addCase(verifyParents.fulfilled, (state, action) => {
        const updated = state.requests.map((r) =>
          r.id === action.payload.id ? action.payload : r
        );
        state.requests = updated;
        if (state.currentRequest?.id === action.payload.id)
          state.currentRequest = action.payload;
      })

      // Submit to NRB
      .addCase(submitToNRB.fulfilled, (state, action) => {
        const updated = state.requests.map((r) =>
          r.id === action.payload.id ? action.payload : r
        );
        state.requests = updated;
        if (state.currentRequest?.id === action.payload.id)
          state.currentRequest = action.payload;
      })

      // Approve
      .addCase(approveRequest.fulfilled, (state, action) => {
        const updated = state.requests.map((r) =>
          r.id === action.payload.id ? action.payload : r
        );
        state.requests = updated;
        if (state.currentRequest?.id === action.payload.id)
          state.currentRequest = action.payload;
      })

      // Reject
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const updated = state.requests.map((r) =>
          r.id === action.payload.id ? action.payload : r
        );
        state.requests = updated;
        if (state.currentRequest?.id === action.payload.id)
          state.currentRequest = action.payload;
      });
  },
});

export const { setCurrentRequest, clearCurrentRequest } = nationIdSlice.actions;
export default nationIdSlice.reducer;
