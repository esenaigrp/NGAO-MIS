import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axiosClient";

// Types
export interface Area {
  id: string;
  name: string;
  code: string;
  area_type: string;
  parent?: string | null;
  chief?: string | null;
  assistant_chief?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
}

export interface GeoJSONFeature {
  type: "Feature";
  properties: {
    id: string;
    name: string;
    code: string;
    area_type: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  geometry: any;
  children?: GeoJSONFeature[];
}

export interface AreaType {
  value: string;
  label: string;
}

export interface FetchAreasParams {
  area_type?: string;
  parent?: string | "root";
  code?: string;
  name?: string;
}

export interface FetchGeoJSONParams {
  area_type?: string;
  parent?: string | "root";
  code?: string;
  recursive?: boolean;
  id?: string;
}

type AreaState = {
  areas: Area[];
  selectedArea: Area | null;
  areaChildren: Area[];
  areaHierarchy: Array<{
    id: string;
    name: string;
    code: string;
    area_type: string;
  }>;
  geoJsonData: GeoJSONFeature[];
  areaTypes: AreaType[];
  areasByType: Record<string, Area[]>;
  loading: boolean;
  childrenLoading: boolean;
  geoJsonLoading: boolean;
  error: string | null;
  filters: FetchAreasParams;
};

const initialState: AreaState = {
  areas: [],
  selectedArea: null,
  areaChildren: [],
  areaHierarchy: [],
  geoJsonData: [],
  areaTypes: [],
  areasByType: {},
  loading: false,
  childrenLoading: false,
  geoJsonLoading: false,
  error: null,
  filters: {},
};

// Async Thunks

// Fetch areas with filters
export const fetchAreas = createAsyncThunk(
  "areas/fetchAreas",
  async (params: FetchAreasParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.area_type) queryParams.append("area_type", params.area_type);
      if (params.parent) queryParams.append("parent", params.parent);
      if (params.code) queryParams.append("code", params.code);
      if (params.name) queryParams.append("name", params.name);

      const res = await api.get(`/geography/areas/?${queryParams.toString()}`);
      return { data: res.data, filters: params };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to load areas");
    }
  }
);

// Fetch specific area by ID
export const fetchAreaById = createAsyncThunk(
  "areas/fetchAreaById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/geography/areas/${id}/`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to load area");
    }
  }
);

// Fetch children of an area
export const fetchAreaChildren = createAsyncThunk(
  "areas/fetchAreaChildren",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/geography/areas/${id}/children/`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to load area children"
      );
    }
  }
);

// Fetch area hierarchy
export const fetchAreaHierarchy = createAsyncThunk(
  "areas/fetchAreaHierarchy",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/geography/areas/${id}/hierarchy/`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to load area hierarchy"
      );
    }
  }
);

// Fetch GeoJSON data
export const fetchGeoJSON = createAsyncThunk(
  "areas/fetchGeoJSON",
  async (params: FetchGeoJSONParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.area_type) queryParams.append("area_type", params.area_type);
      if (params.parent) queryParams.append("parent", params.parent);
      if (params.code) queryParams.append("code", params.code);
      if (params.recursive !== undefined)
        queryParams.append("recursive", params.recursive.toString());
      if (params.id) queryParams.append("id", params.id);

      const res = await api.get(
        `/geography/geojson/?${queryParams.toString()}`
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to load GeoJSON");
    }
  }
);

// Fetch area types
export const fetchAreaTypes = createAsyncThunk(
  "areas/fetchAreaTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/geography/area-types/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to load area types"
      );
    }
  }
);

// Fetch areas by type
export const fetchAreasByType = createAsyncThunk(
  "areas/fetchAreasByType",
  async (
    { area_type, parent }: { area_type: string; parent?: string },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (parent) queryParams.append("parent", parent);

      const res = await api.get(
        `/geography/by-type/${area_type}/?${queryParams.toString()}`
      );
      return { area_type, data: res.data };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to load areas by type"
      );
    }
  }
);

// Fetch areas by type as GeoJSON
export const fetchAreasByTypeGeoJSON = createAsyncThunk(
  "areas/fetchAreasByTypeGeoJSON",
  async (
    {
      area_type,
      parent,
      recursive = false,
    }: { area_type: string; parent?: string; recursive?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("format", "geojson");
      if (parent) queryParams.append("parent", parent);
      if (recursive) queryParams.append("recursive", "true");

      const res = await api.get(
        `/geography/by-type/${area_type}/?${queryParams.toString()}`
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to load GeoJSON by type"
      );
    }
  }
);

// Fetch user's areas (keep your existing one)
export const fetchUserAreas = createAsyncThunk(
  "areas/fetchUserAreas",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/areas/my-areas/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to load areas");
    }
  }
);

// Slice
const areasSlice = createSlice({
  name: "areas",
  initialState,
  reducers: {
    setSelectedArea: (state, action: PayloadAction<Area | null>) => {
      state.selectedArea = action.payload;
    },
    clearSelectedArea: (state) => {
      state.selectedArea = null;
      state.areaChildren = [];
      state.areaHierarchy = [];
    },
    setFilters: (state, action: PayloadAction<FetchAreasParams>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearGeoJSON: (state) => {
      state.geoJsonData = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch areas
    builder
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload.data;
        state.filters = action.payload.filters;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch area by ID
    builder
      .addCase(fetchAreaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreaById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArea = action.payload;
      })
      .addCase(fetchAreaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch area children
    builder
      .addCase(fetchAreaChildren.pending, (state) => {
        state.childrenLoading = true;
        state.error = null;
      })
      .addCase(fetchAreaChildren.fulfilled, (state, action) => {
        state.childrenLoading = false;
        state.areaChildren = action.payload;
      })
      .addCase(fetchAreaChildren.rejected, (state, action) => {
        state.childrenLoading = false;
        state.error = action.payload as string;
      });

    // Fetch area hierarchy
    builder
      .addCase(fetchAreaHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreaHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.areaHierarchy = action.payload;
      })
      .addCase(fetchAreaHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch GeoJSON
    builder
      .addCase(fetchGeoJSON.pending, (state) => {
        state.geoJsonLoading = true;
        state.error = null;
      })
      .addCase(fetchGeoJSON.fulfilled, (state, action) => {
        state.geoJsonLoading = false;
        state.geoJsonData = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
      })
      .addCase(fetchGeoJSON.rejected, (state, action) => {
        state.geoJsonLoading = false;
        state.error = action.payload as string;
      });

    // Fetch area types
    builder
      .addCase(fetchAreaTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreaTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.areaTypes = action.payload;
      })
      .addCase(fetchAreaTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch areas by type
    builder
      .addCase(fetchAreasByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreasByType.fulfilled, (state, action) => {
        state.loading = false;
        state.areasByType[action.payload.area_type] = action.payload.data;
      })
      .addCase(fetchAreasByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch areas by type as GeoJSON
    builder
      .addCase(fetchAreasByTypeGeoJSON.pending, (state) => {
        state.geoJsonLoading = true;
        state.error = null;
      })
      .addCase(fetchAreasByTypeGeoJSON.fulfilled, (state, action) => {
        state.geoJsonLoading = false;
        state.geoJsonData = action.payload;
      })
      .addCase(fetchAreasByTypeGeoJSON.rejected, (state, action) => {
        state.geoJsonLoading = false;
        state.error = action.payload as string;
      });

    // Fetch user areas
    builder
      .addCase(fetchUserAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
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

export const {
  setSelectedArea,
  clearSelectedArea,
  setFilters,
  clearFilters,
  clearError,
  clearGeoJSON,
} = areasSlice.actions;

export default areasSlice.reducer;