import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axiosClient";

// -------------------------
// Types
// -------------------------
export interface AdminUnit {
  uid: string;
  name: string;
  unit_type: string;
  code?: string;
  parent_unit?: string | AdminUnit | null;
}

// -------------------------
// Slice State
// -------------------------
interface AdminStructureState {
  units: AdminUnit[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminStructureState = {
  units: [],
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
    return res.data;
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
      state.units = [];
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
        s.units = a.payload;
      })
      .addCase(fetchAdminUnits.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to fetch admin units";
      })
      // CREATE
      .addCase(createAdminUnit.fulfilled, (s, a: PayloadAction<AdminUnit>) => {
        s.units.push(a.payload);
      })
      // UPDATE
      .addCase(updateAdminUnit.fulfilled, (s, a: PayloadAction<AdminUnit>) => {
        const index = s.units.findIndex((u) => u.uid === a.payload.uid);
        if (index !== -1) s.units[index] = a.payload;
      })
      // DELETE
      .addCase(deleteAdminUnit.fulfilled, (s, a: PayloadAction<string>) => {
        s.units = s.units.filter((u) => u.uid !== a.payload);
      });
  },
});

export const { clearUnits } = adminStructureSlice.actions;
export default adminStructureSlice.reducer;
