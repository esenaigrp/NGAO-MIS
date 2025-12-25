import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axiosClient";

// -------------------------
// Types
// -------------------------

export interface AdminUnit {
  id: string;
  name: string;
  code?: string;
  type: string;
  geometry?: any;
  properties: {
    name: string;
    code?: string;
    parent?: string | null;
    level?: number;
    [key: string]: any;
  };
}

// -------------------------
// Slice State
// -------------------------
interface AdminStructureState {
  adminUnits: AdminUnit[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminStructureState = {
  adminUnits: [],
  loading: false,
  error: null,
};

// -------------------------
// Async Thunks
// -------------------------

// Fetch all admin units
export const fetchAdminUnits = createAsyncThunk<
  AdminUnit[],
  void,
  { rejectValue: string }
>("adminStructure/fetchAll", async (_, thunkAPI) => {
  try {
    const res = await api.get("/admin-units/");
    return res.data.features;
  } catch (err: any) {
    return thunkAPI.rejectWithValue("Failed to fetch admin units");
  }
});

// Create a new admin unit
export const createAdminUnit = createAsyncThunk<
  AdminUnit,
  Partial<AdminUnit>,
  { rejectValue: string }
>("adminStructure/create", async (data, thunkAPI) => {
  try {
    const res = await api.post("/admin-units/", data);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue("Failed to create admin unit");
  }
});

// Update admin unit
export const updateAdminUnit = createAsyncThunk<
  AdminUnit,
  { uid: string; data: Partial<AdminUnit> },
  { rejectValue: string }
>("adminStructure/update", async ({ uid, data }, thunkAPI) => {
  try {
    const res = await api.put(`/admin-units/${uid}/`, data);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue("Failed to update admin unit");
  }
});

// Delete admin unit
export const deleteAdminUnit = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("adminStructure/delete", async (uid, thunkAPI) => {
  try {
    await api.delete(`/admin-units/${uid}/`);
    return uid;
  } catch (err: any) {
    return thunkAPI.rejectWithValue("Failed to delete admin unit");
  }
});

// -------------------------
// Slice
// -------------------------
const adminStructureSlice = createSlice({
  name: "adminStructure",
  initialState,
  reducers: {
    clearUnits: (state) => {
      state.adminUnits = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchAdminUnits.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAdminUnits.fulfilled, (s, a: PayloadAction<AdminUnit[]>) => {
        s.loading = false;
        s.adminUnits = a.payload;
      })
      .addCase(fetchAdminUnits.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to fetch admin units";
      })
      // CREATE
      .addCase(createAdminUnit.fulfilled, (s, a: PayloadAction<AdminUnit>) => {
        s.adminUnits.push(a.payload);
      })
      // UPDATE
      .addCase(updateAdminUnit.fulfilled, (s, a: PayloadAction<AdminUnit>) => {
        const index = s.adminUnits.findIndex((u) => u.id === a.payload.id);
        if (index !== -1) s.adminUnits[index] = a.payload;
      })
      // DELETE
      .addCase(deleteAdminUnit.fulfilled, (s, a: PayloadAction<string>) => {
        s.adminUnits = s.adminUnits.filter((u) => u.id !== a.payload);
      });
  },
});

export const { clearUnits } = adminStructureSlice.actions;
export default adminStructureSlice.reducer;
