import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import api from "../../api/axiosClient";
import { Area } from "./areasSlice";

// Citizen type
export interface Citizen {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  id_number?: string;
  gender?: string;
  date_of_birth?: string;
  phone_number?: string;
  email?: string;
  area?: string;
  status?: string;
  [key: string]: any;
  current_area: Area
}

interface CitizenState {
  citizens: Citizen[];
  loading: boolean;
  error: string | null;
  currentItem: Citizen | null;
  total: number;
  pageSize: number;
  currentPage: number;
}

const initialState: CitizenState = {
  citizens: [],
  loading: false,
  error: null,
  currentItem: null,
  total: 0,
  pageSize: 10,
  currentPage: 1,
};

// ---------------------
// Async thunks
// ---------------------

// Fetch citizens (filtered by backend RBAC)
export const fetchCitizens = createAsyncThunk<
  { results: Citizen[]; count: number },
  { page?: number; pageSize?: number } | void,
  { rejectValue: string }
>("citizen/fetchCitizens", async (params, thunkAPI) => {
  try {
    const page = params && 'page' in params ? params.page : 1;
    const pageSize = params && 'pageSize' in params ? params.pageSize : 10;

    const response = await api.get("/citizens/", {
      params: { page, page_size: pageSize },
    });
    
    return {
      results: response.data.results || response.data,
      count: response.data.count || response.data.length,
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to fetch citizens"
    );
  }
});

// Lookup citizens (for autocomplete)
export const lookupCitizens = createAsyncThunk<
  Citizen[],
  { query: string },
  { rejectValue: string }
>("citizen/lookupCitizens", async ({ query }, thunkAPI) => {
  try {
    const response = await api.post("/citizens/lookup/", { query });
    return response.data.results || [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to lookup citizens"
    );
  }
});

// Get single citizen by ID
export const getCitizenById = createAsyncThunk<
  Citizen,
  string,
  { rejectValue: string }
>("citizen/getCitizenById", async (id, thunkAPI) => {
  try {
    const response = await api.get(`/citizens/${id}/`);
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to fetch citizen"
    );
  }
});

// Create a new citizen
export const createCitizen = createAsyncThunk<
  Citizen,
  Partial<Citizen>,
  { rejectValue: string }
>("citizen/createCitizen", async (data, thunkAPI) => {
  try {
    const response = await api.post("/citizens/", data);
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to create citizen"
    );
  }
});

// Update a citizen
export const updateCitizen = createAsyncThunk<
  Citizen,
  { id: string; data: Partial<Citizen> },
  { rejectValue: string }
>("citizen/updateCitizen", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.patch(`/citizens/${id}/`, data);
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to update citizen"
    );
  }
});

// Delete a citizen
export const deleteCitizen = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("citizen/deleteCitizen", async (id, thunkAPI) => {
  try {
    await api.delete(`/citizens/${id}/`);
    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to delete citizen"
    );
  }
});

// Verify citizen (IPRS-style verification)
export const verifyCitizen = createAsyncThunk<
  Citizen,
  { id_number: string; last_name: string },
  { rejectValue: string }
>("citizen/verifyCitizen", async ({ id_number, last_name }, thunkAPI) => {
  try {
    const response = await api.post("/citizens/lookup/", {
      id_number,
      last_name,
      module: "verification",
    });
    return response.data.results[0] || response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Citizen verification failed"
    );
  }
});

// Bulk import citizens
export const bulkImportCitizens = createAsyncThunk<
  { success: number; failed: number; message: string },
  FormData,
  { rejectValue: string }
>("citizen/bulkImportCitizens", async (formData, thunkAPI) => {
  try {
    const response = await api.post("/citizens/bulk-import/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.detail || "Failed to import citizens"
    );
  }
});

// ---------------------
// Slice
// ---------------------
const citizenSlice = createSlice({
  name: "citizen",
  initialState,
  reducers: {
    clearCitizenError: (state) => {
      state.error = null;
    },
    setCurrentCitizen: (state, action: PayloadAction<Citizen | null>) => {
      state.currentItem = action.payload;
    },
    clearCurrentCitizen: (state) => {
      state.currentItem = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    clearCitizens: (state) => {
      state.citizens = [];
      state.total = 0;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    // FETCH CITIZENS
    builder
      .addCase(fetchCitizens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCitizens.fulfilled, (state, action) => {
        state.loading = false;
        state.citizens = action.payload.results;
        state.total = action.payload.count;
      })
      .addCase(fetchCitizens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch citizens";
      });

    // LOOKUP CITIZENS
    builder
      .addCase(lookupCitizens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(lookupCitizens.fulfilled, (state, action) => {
        state.loading = false;
        state.citizens = action.payload;
      })
      .addCase(lookupCitizens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to lookup citizens";
      });

    // GET CITIZEN BY ID
    builder
      .addCase(getCitizenById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCitizenById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(getCitizenById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch citizen";
      });

    // CREATE CITIZEN
    builder
      .addCase(createCitizen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCitizen.fulfilled, (state, action) => {
        state.loading = false;
        state.citizens.push(action.payload);
        state.total += 1;
      })
      .addCase(createCitizen.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create citizen";
      });

    // UPDATE CITIZEN
    builder
      .addCase(updateCitizen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCitizen.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.citizens.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.citizens[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(updateCitizen.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update citizen";
      });

    // DELETE CITIZEN
    builder
      .addCase(deleteCitizen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCitizen.fulfilled, (state, action) => {
        state.loading = false;
        state.citizens = state.citizens.filter((c) => c.id !== action.payload);
        state.total -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      })
      .addCase(deleteCitizen.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete citizen";
      });

    // VERIFY CITIZEN
    builder
      .addCase(verifyCitizen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCitizen.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(verifyCitizen.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Verification failed";
      });

    // BULK IMPORT CITIZENS
    builder
      .addCase(bulkImportCitizens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkImportCitizens.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally refetch citizens after bulk import
      })
      .addCase(bulkImportCitizens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to import citizens";
      });
  },
});

export const {
  clearCitizenError,
  setCurrentCitizen,
  clearCurrentCitizen,
  setCurrentPage,
  setPageSize,
  clearCitizens,
} = citizenSlice.actions;

export default citizenSlice.reducer;