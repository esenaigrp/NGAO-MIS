import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axiosClient";
import { User } from "./usersSlice";

/* ============================
   TYPES
============================ */
export type Incident = {
  id: string;
  title: string;
  description?: string;
  incident_type?: string;
  status?: string;
  location?: any;
  reported_by?: User;
  date_reported?: string;
  reporter_phone?: string;
  assigned_to?: User;
  timestamp?: string;
  reference?: string;
  category?: string;
  priority?: string;
};

interface IncidentsState {
  list: Incident[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  stats?: {
    open: number;
    urgent: number;
    resolved_today?: number;
  };
  assigned?: Incident[];
}

const initialState: IncidentsState = {
  list: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 10,
  status: "idle",
  stats: {
    open: 0,
    urgent: 0,
    resolved_today: 0,
  },
  assigned: [],
};

/* ============================
   FETCH (ADMIN / ALL INCIDENTS)
============================ */
export const fetchIncidents = createAsyncThunk<
  {
    items: Incident[];
    total: number;
    page: number;
    pageSize: number;
  },
  {
    page?: number;
    pageSize?: number;
    q?: string;
  }
>("incidents/fetchAll", async ({ page = 1, pageSize = 10, q = "" }, { rejectWithValue }) => {
  try {
    const res = await api.get("/incidents/", {
      params: { page, page_size: pageSize, q },
    });

    const isPaginated = Array.isArray(res.data.results);

    return {
      items: isPaginated ? res.data.results : res.data,
      total: isPaginated ? res.data.count : res.data.length,
      page,
      pageSize,
    };
  } catch (err: any) {
    return rejectWithValue("Failed to load incidents");
  }
});

/* ============================
   FETCH (OFFICER / MY INCIDENTS)
============================ */
export const fetchMyIncidents = createAsyncThunk<Incident[]>(
  "incidents/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/incidents/my/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue("Failed to load assigned incidents");
    }
  }
);

/* ============================
   CREATE
============================ */
export const createIncident = createAsyncThunk(
  "incidents/create",
  async (payload: Partial<Incident>, { rejectWithValue }) => {
    try {
      const res = await api.post("/incidents/", payload);
      return res.data;
    } catch {
      return rejectWithValue("Failed to create incident");
    }
  }
);

/* ============================
   UPDATE / DELETE / ACTIONS
============================ */
export const updateIncident = createAsyncThunk(
  "incidents/update",
  async ({ id, payload }: { id: number; payload: Partial<Incident> }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/incidents/${id}/`, payload);
      return res.data;
    } catch {
      return rejectWithValue("Failed to update incident");
    }
  }
);

export const deleteIncident = createAsyncThunk(
  "incidents/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/incidents/${id}/`);
      return id;
    } catch {
      return rejectWithValue("Failed to delete incident");
    }
  }
);

/* ============================
   SLICE
============================ */
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
      // ADMIN FETCH
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

      // OFFICER FETCH
      .addCase(fetchMyIncidents.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMyIncidents.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
        s.total = a.payload.length;
      })
      .addCase(fetchMyIncidents.rejected, (s, a) => {
        s.loading = false;
        s.error = String(a.payload);
      })

      // CREATE
      .addCase(createIncident.fulfilled, (s, a) => {
        s.list.unshift(a.payload);
        s.total += 1;
      })

      // UPDATE
      .addCase(updateIncident.fulfilled, (s, a) => {
        s.list = s.list.map(i => (i.id === a.payload.id ? a.payload : i));
      })

      // DELETE
      .addCase(deleteIncident.fulfilled, (s, a) => {
        s.list = s.list.filter(i => i.id !== a.payload);
        s.total -= 1;
      });
  },
});

export const { setPage, setPageSize, clearIncidentError } = incidentsSlice.actions;
export default incidentsSlice.reducer;
