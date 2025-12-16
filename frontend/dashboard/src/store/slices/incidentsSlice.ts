import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axiosClient";

export type Incident = {
  id: number;
  title: string;
  description?: string;
  incident_type?: string;
  status?: string;
  location?: any;
  reported_by?: string;
  timestamp?: string;
};

interface IncidentsState {
  list: Incident[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: IncidentsState = {
  list: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 10,
};

/* ============================
   FETCH
============================ */
export const fetchIncidents = createAsyncThunk(
  "incidents/fetch",
  async (
    { page = 1, pageSize = 10, q = "" }: { page?: number; pageSize?: number; q?: string },
    thunkAPI
  ) => {
    try {
      const res = await api.get(
        `/incidents/?page=${page}&page_size=${pageSize}&q=${encodeURIComponent(q)}`
      );

      return {
        items: res.data.results ?? res.data,
        total: res.data.count ?? res.data.length,
        page,
        pageSize,
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to load incidents");
    }
  }
);

/* ============================
   CREATE
============================ */
export const createIncident = createAsyncThunk(
  "incidents/create",
  async (payload: Partial<Incident>, thunkAPI) => {
    try {
      const res = await api.post("/incidents/", payload);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to create incident");
    }
  }
);

/* ============================
   UPDATE
============================ */
export const updateIncident = createAsyncThunk(
  "incidents/update",
  async ({ id, payload }: { id: number; payload: Partial<Incident> }, thunkAPI) => {
    try {
      const res = await api.patch(`/incidents/${id}/`, payload);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to update incident");
    }
  }
);

/* ============================
   DELETE
============================ */
export const deleteIncident = createAsyncThunk(
  "incidents/delete",
  async (id: number, thunkAPI) => {
    try {
      await api.delete(`/incidents/${id}/`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to delete incident");
    }
  }
);

export const assignIncident = createAsyncThunk(
  "incidents/assign",
  async ({ id, officer_id }: { id: number; officer_id: string }, thunkAPI) => {
    try {
      const res = await api.patch(`/incidents/${id}/assign/`, { officer_id });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue("Failed to assign incident");
    }
  }
);

export const startInvestigation = createAsyncThunk(
  "incidents/startInvestigation",
  async (id: number, thunkAPI) => {
    try {
      const res = await api.patch(`/incidents/${id}/start-investigation/`);
      return res.data;
    } catch {
      return thunkAPI.rejectWithValue("Failed to start investigation");
    }
  }
);

export const resolveIncident = createAsyncThunk(
  "incidents/resolve",
  async (id: number, thunkAPI) => {
    try {
      const res = await api.patch(`/incidents/${id}/resolve/`);
      return res.data;
    } catch {
      return thunkAPI.rejectWithValue("Failed to resolve incident");
    }
  }
);

export const closeIncident = createAsyncThunk(
  "incidents/close",
  async (id: number, thunkAPI) => {
    try {
      const res = await api.patch(`/incidents/${id}/close/`);
      return res.data;
    } catch {
      return thunkAPI.rejectWithValue("Failed to close incident");
    }
  }
);

const incidentsSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },
    clearIncidentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchIncidents.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.items;
        s.total = a.payload.total;
        s.page = a.payload.page;
        s.pageSize = a.payload.pageSize;
      })
      .addCase(fetchIncidents.rejected, (s, a) => {
        s.loading = false;
        s.error = String(a.payload);
      })

      // CREATE
      .addCase(createIncident.pending, (s) => {
        s.loading = true;
      })
      .addCase(createIncident.fulfilled, (s, a) => {
        s.loading = false;
        s.list.unshift(a.payload);
        s.total += 1;
      })
      .addCase(createIncident.rejected, (s, a) => {
        s.loading = false;
        s.error = String(a.payload);
      })

      // UPDATE
      .addCase(updateIncident.fulfilled, (s, a) => {
        s.list = s.list.map(i => (i.id === a.payload.id ? a.payload : i));
      })

      // DELETE
      .addCase(deleteIncident.fulfilled, (s, a) => {
        s.list = s.list.filter(i => i.id !== a.payload);
        s.total = Math.max(0, s.total - 1);
      })

      .addCase(assignIncident.fulfilled, (s, a) => {
        s.list = s.list.map(i => (i.id === a.payload.id ? a.payload : i));
      })

  },
});

export const { setPage, setPageSize, clearIncidentError } = incidentsSlice.actions;
export default incidentsSlice.reducer;
