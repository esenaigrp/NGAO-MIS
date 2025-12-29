import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import api from "../../api/axiosClient";

// Citizen type
export interface Citizen {
  id: string;
  first_name: string;
  last_name: string;
  id_number?: string;
  gender?: string;
  date_of_birth?: string;
  sub_county?: string;
  division?: string;
  location?: string;
  sublocation?: string;
  village?: string;
  [key: string]: any;
}

interface CitizenState {
  citizens: Citizen[];
  loading: boolean;
  error: string | null;
  birth: Citizen[];
  death: Citizen[];
  marriage: Citizen[];
  currentItem?: Citizen;
}

const initialState: CitizenState = {
  citizens: [],
  loading: false,
  error: null,
  birth: [],
  death: [],
  marriage: [],
  currentItem: {} as Citizen,
};

// ---------------------
// Async thunks
// ---------------------

// Fetch citizens (filtered by backend RBAC)
export const fetchCitizens = createAsyncThunk<
  Citizen[],
  void,
  { rejectValue: string }
>("citizen/fetchCitizens", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const token = state.auth.accessToken;

    const response = await api.get("/citizens/");
    console.log("Response.data:", response.data);
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to fetch citizens");
  }
});

// Lookup citizens
export const lookupCitizens = createAsyncThunk<
  Citizen[],
  void,
  { rejectValue: string }
>("citizen/lookupCitizens", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const token = state.auth.accessToken;

    const response = await api.post("/citizens/lookup/");
    console.log("Response.data:", response.data);
    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to fetch citizens");
  }
});

// Create a new citizen
export const createCitizen = createAsyncThunk<
  Citizen,
  Partial<Citizen>,
  { rejectValue: string }
>("citizen/createCitizen", async (data, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const token = state.auth.accessToken;

    const response = await api.post("/citizens/", data);

    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to create citizen");
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
  },
  extraReducers: (builder) => {
    // FETCH
    builder.addCase(fetchCitizens.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCitizens.fulfilled, (state, action: PayloadAction<Citizen[]>) => {
      state.loading = false;
      state.citizens = action.payload;
    });
    builder.addCase(fetchCitizens.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch citizens";
    });

    // CREATE
    builder.addCase(createCitizen.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCitizen.fulfilled, (state, action: PayloadAction<Citizen>) => {
      state.loading = false;
      state.citizens.push(action.payload);
    });
    builder.addCase(createCitizen.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to create citizen";
    });
  },
});

export const { clearCitizenError } = citizenSlice.actions;
export default citizenSlice.reducer;
