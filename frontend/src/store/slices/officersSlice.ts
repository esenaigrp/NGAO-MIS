// src/store/slices/officersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import authApi from "../../api/axiosClient";
import { AdminUnit } from "./adminStructureSlice";
import { Area } from "recharts";

// -------------------------
// Types
// -------------------------
export interface Role {
  uid: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: Role
}

export interface Officer {
  id: string;
  user: User;
  role_text?: string;
  role?: Role;
  badge_number?: string;
  id_number?: string;
  admin_unit?: AdminUnit | string | null;
  phone?: string;
  is_active: boolean;
  notes?: string;
  office_email?: string;
  area?: Area;
}

// -------------------------
// Slice State
// -------------------------
interface OfficersState {
  officers: Officer[];
  loading: boolean;
  error: string | null;
}

const initialState: OfficersState = {
  officers: [],
  loading: false,
  error: null,
};

// -------------------------
// Async Thunks
// -------------------------
export const fetchOfficers = createAsyncThunk<Officer[], void, { rejectValue: string }>(
  "officers/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await authApi.get("/officers/");
      return response.data as Officer[];
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to fetch officers";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createOfficer = createAsyncThunk<
  Officer,
  Partial<Officer>,
  { rejectValue: string }
>("officers/create", async (data, thunkAPI) => {
  try {
    const response = await authApi.post("/officers/", data);
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to create officer"
    );
  }
});

export const updateOfficer = createAsyncThunk<
  Officer,
  { uid: string; data: Partial<Officer> },
  { rejectValue: string }
>("officers/update", async ({ uid, data }, thunkAPI) => {
  try {
    const response = await authApi.put(`/officers/${uid}/`, data);
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to update officer"
    );
  }
});

export const toggleOfficerStatus = createAsyncThunk<
  Officer,
  { uid: string; active: boolean },
  { rejectValue: string }
>("officers/toggleStatus", async ({ uid, active }, thunkAPI) => {
  try {
    const response = await authApi.patch(`/officers/${uid}/status/`, {
      active,
    });
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to update officer status"
    );
  }
});

export const assignOfficerRole = createAsyncThunk<
  Officer,
  { uid: string; role_uid: string },
  { rejectValue: string }
>("officers/assignRole", async ({ uid, role_uid }, thunkAPI) => {
  try {
    const response = await authApi.patch(`/officers/${uid}/assign-role/`, {
      role: role_uid,
    });
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to assign role"
    );
  }
});

export const assignOfficerAdminUnit = createAsyncThunk<
  Officer,
  { uid: string; admin_unit_uid: string },
  { rejectValue: string }
>("officers/assignAdminUnit", async ({ uid, admin_unit_uid }, thunkAPI) => {
  try {
    const response = await authApi.patch(
      `/officers/${uid}/assign-admin-unit/`,
      { admin_unit: admin_unit_uid }
    );
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to assign admin unit"
    );
  }
});

export const deleteOfficer = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("officers/delete", async (uid, thunkAPI) => {
  try {
    await authApi.delete(`/officers/${uid}/`);
    return uid;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to delete officer"
    );
  }
});


// -------------------------
// Slice
// -------------------------
const officersSlice = createSlice({
  name: "officers",
  initialState,
  reducers: {
    clearOfficers: (state) => {
      state.officers = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfficers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfficers.fulfilled, (state, action: PayloadAction<Officer[]>) => {
        state.loading = false;
        state.officers = action.payload;
      })
      .addCase(fetchOfficers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching officers";
      })
      
      .addCase(createOfficer.fulfilled, (state, action) => {
        state.officers.push(action.payload);
      })
      
      .addCase(updateOfficer.fulfilled, (state, action) => {
        const index = state.officers.findIndex(
          (o) => o.id === action.payload.id
        );
        
        if (index !== -1) state.officers[index] = action.payload;
      })
      
      .addCase(toggleOfficerStatus.fulfilled, (state, action) => {
        const index = state.officers.findIndex(
          (o) => o.id === action.payload.id
        );
        
        if (index !== -1) state.officers[index] = action.payload;
      })
      
      .addCase(assignOfficerRole.fulfilled, (state, action) => {
        const index = state.officers.findIndex(
          (o) => o.id === action.payload.id
        );
        
        if (index !== -1) state.officers[index] = action.payload;
      })
      
      .addCase(assignOfficerAdminUnit.fulfilled, (state, action) => {
        const index = state.officers.findIndex(
          (o) => o.id === action.payload.id
        );
        
        if (index !== -1) state.officers[index] = action.payload;
      })
      
      .addCase(deleteOfficer.fulfilled, (state, action) => {
        state.officers = state.officers.filter(
          (o) => o.id !== action.payload
        );
      });
  },
});

export const { clearOfficers } = officersSlice.actions;
export default officersSlice.reducer;