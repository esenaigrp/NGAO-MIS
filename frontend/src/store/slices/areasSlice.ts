import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../api/axiosClient";

export const fetchUserAreas = createAsyncThunk(
  "areas/fetchUserAreas",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/areas/my-areas/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to load areas");
    }
  }
);

type AreaState = {
  areas: any[];
  loading: boolean;
  error: string | null;
};

const initialState: AreaState = {
  areas: [],
  loading: false,
  error: null,
};

const areasSlice = createSlice({
  name: "areas",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAreas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchUserAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default areasSlice.reducer;
