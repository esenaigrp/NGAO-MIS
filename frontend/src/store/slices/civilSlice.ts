import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axiosClient";


interface CivilState {
  birth: any[];
  death: any[];
  marriage: any[];
  currentItem: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: CivilState = {
  birth: [],
  death: [],
  marriage: [],
  currentItem: null,
  loading: false,
  error: null,
};

// -------- Async Thunks --------

// Fetch all civil registrations (birth, death, marriage)
export const fetchBirthRegistrations = createAsyncThunk(
  "civil/fetchAllBirths",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/registrations/births/");
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

// Fetch all civil registrations (birth, death, marriage)
export const fetchDeathRegistrations = createAsyncThunk(
  "civil/fetchAllDeaths",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/registrations/deaths/");
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

// Fetch all civil registrations (birth, death, marriage)
export const fetchMarriageRegistrations = createAsyncThunk(
  "civil/fetchAllMarriages",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/registrations/marriages/");
      // Expected backend response:
      // { birth: [...], death: [...], marriage: [...] }
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

// -------- Birth Registration Actions --------
export const verifyBirthParents = createAsyncThunk(
  "civil/verifyBirthParents",
  async ({ id, motherVerified, fatherVerified }: any, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/births/${id}/verify_parents/`, {
        mother_verified: motherVerified,
        father_verified: fatherVerified,
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const approveBirth = createAsyncThunk(
  "civil/approveBirth",
  async (id: string, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/births/${id}/approve/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const rejectBirth = createAsyncThunk(
  "civil/rejectBirth",
  async (id: string, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/births/${id}/reject/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

// -------- Death Registration Actions --------
export const approveDeath = createAsyncThunk(
  "civil/approveDeath",
  async (id: string, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/deaths/${id}/approve/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const rejectDeath = createAsyncThunk(
  "civil/rejectDeath",
  async (id: string, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/deaths/${id}/reject/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

// -------- Marriage Registration Actions --------
export const approveMarriage = createAsyncThunk(
  "civil/approveMarriage",
  async (id: string, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/marriages/${id}/approve/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const rejectMarriage = createAsyncThunk(
  "civil/rejectMarriage",
  async (id: string, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/marriages/${id}/reject/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);


// -------- Birth Registration Actions --------
export const createBirth = createAsyncThunk(
  "civil/createBirth",
  async (data: any, thunkAPI) => {
    try {
      const res = await api.post("/registrations/births/", data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const updateBirth = createAsyncThunk(
  "civil/updateBirth",
  async ({ id, data }: any, thunkAPI) => {
    try {
      const res = await api.put(`/registrations/births/${id}/`, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const deleteBirth = createAsyncThunk(
  "civil/deleteBirth",
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/registrations/births/${id}/`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const submitBirth = createAsyncThunk(
  "civil/submitBirth",
  async (id: string, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/births/${id}/submit/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

// -------- Death Registration Actions --------
export const createDeath = createAsyncThunk(
  "civil/createDeath",
  async (data: any, thunkAPI) => {
    try {
      const res = await api.post("/registrations/deaths/", data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const updateDeath = createAsyncThunk(
  "civil/updateDeath",
  async ({ id, data }: any, thunkAPI) => {
    try {
      const res = await api.put(`/registrations/deaths/${id}/`, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const deleteDeath = createAsyncThunk(
  "civil/deleteDeath",
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/registrations/deaths/${id}/`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const submitDeath = createAsyncThunk(
  "civil/submitDeath",
  async (id: string, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/deaths/${id}/submit/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

// -------- Marriage Registration Actions --------
export const createMarriage = createAsyncThunk(
  "civil/createMarriage",
  async (data: any, thunkAPI) => {
    try {
      const res = await api.post("/registrations/marriages/", data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const updateMarriage = createAsyncThunk(
  "civil/updateMarriage",
  async ({ id, data }: any, thunkAPI) => {
    try {
      const res = await api.put(`/registrations/marriages/${id}/`, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const deleteMarriage = createAsyncThunk(
  "civil/deleteMarriage",
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/registrations/marriages/${id}/`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);

export const submitMarriage = createAsyncThunk(
  "civil/submitMarriage",
  async (id: string, thunkAPI) => {
    try {
      const res = await api.post(`/registrations/marriages/${id}/submit/`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Network Error");
    }
  }
);


// -------- Slice --------

const civilSlice = createSlice({
  name: "civil",
  initialState,
  reducers: {
    setCurrentItem(state, action: PayloadAction<any>) {
      state.currentItem = action.payload;
    },
    clearCurrentItem(state) {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBirthRegistrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBirthRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.birth = action.payload; // <-- directly assign the array
      })
      .addCase(fetchBirthRegistrations.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDeathRegistrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeathRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.death = action.payload;
      })
      .addCase(fetchDeathRegistrations.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMarriageRegistrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarriageRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.marriage = action.payload;
      })
      .addCase(fetchMarriageRegistrations.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
  // Birth
      .addCase(verifyBirthParents.fulfilled, (state, action) => {
        state.birth = state.birth.map((b) => (b.id === action.payload.id ? action.payload : b));
        if (state.currentItem?.id === action.payload.id) state.currentItem = action.payload;
      })
      .addCase(approveBirth.fulfilled, (state, action) => {
        state.birth = state.birth.map((b) => (b.id === action.payload.id ? action.payload : b));
        if (state.currentItem?.id === action.payload.id) state.currentItem = action.payload;
      })
      .addCase(rejectBirth.fulfilled, (state, action) => {
        state.birth = state.birth.map((b) => (b.id === action.payload.id ? action.payload : b));
        if (state.currentItem?.id === action.payload.id) state.currentItem = action.payload;
      })
      .addCase(createBirth.fulfilled, (state, action) => { state.birth.push(action.payload); })
      .addCase(updateBirth.fulfilled, (state, action) => {
        state.birth = state.birth.map((b) => (b.id === action.payload.id ? action.payload : b));
      })
      .addCase(deleteBirth.fulfilled, (state, action) => {
        state.birth = state.birth.filter((b) => b.id !== action.payload);
      })
      .addCase(submitBirth.fulfilled, (state, action) => {
        state.birth = state.birth.map((b) => (b.id === action.payload.id ? action.payload : b));
      })

      // Death
      .addCase(approveDeath.fulfilled, (state, action) => {
        state.death = state.death.map((d) => (d.id === action.payload.id ? action.payload : d));
        if (state.currentItem?.id === action.payload.id) state.currentItem = action.payload;
      })
      .addCase(rejectDeath.fulfilled, (state, action) => {
        state.death = state.death.map((d) => (d.id === action.payload.id ? action.payload : d));
        if (state.currentItem?.id === action.payload.id) state.currentItem = action.payload;
      })
      .addCase(createDeath.fulfilled, (state, action) => { state.death.push(action.payload); })
      .addCase(updateDeath.fulfilled, (state, action) => {
        state.death = state.death.map((d) => (d.id === action.payload.id ? action.payload : d));
      })
      .addCase(deleteDeath.fulfilled, (state, action) => {
        state.death = state.death.filter((d) => d.id !== action.payload);
      })
      .addCase(submitDeath.fulfilled, (state, action) => {
        state.death = state.death.map((d) => (d.id === action.payload.id ? action.payload : d));
      })

      // Marriage
      .addCase(approveMarriage.fulfilled, (state, action) => {
        state.marriage = state.marriage.map((m) => (m.id === action.payload.id ? action.payload : m));
        if (state.currentItem?.id === action.payload.id) state.currentItem = action.payload;
      })
      .addCase(rejectMarriage.fulfilled, (state, action) => {
        state.marriage = state.marriage.map((m) => (m.id === action.payload.id ? action.payload : m));
        if (state.currentItem?.id === action.payload.id) state.currentItem = action.payload;
      })
      .addCase(createMarriage.fulfilled, (state, action) => { state.marriage.push(action.payload); })
      .addCase(updateMarriage.fulfilled, (state, action) => {
        state.marriage = state.marriage.map((m) => (m.id === action.payload.id ? action.payload : m));
      })
      .addCase(deleteMarriage.fulfilled, (state, action) => {
        state.marriage = state.marriage.filter((m) => m.id !== action.payload);
      })
      .addCase(submitMarriage.fulfilled, (state, action) => {
        state.marriage = state.marriage.map((m) => (m.id === action.payload.id ? action.payload : m));
      });
  },
});

export const { setCurrentItem, clearCurrentItem } = civilSlice.actions;
export default civilSlice.reducer;
