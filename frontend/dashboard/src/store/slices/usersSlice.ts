// src/store/slices/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "../../api/axiosClient";

export type Role = { uid?: string; name: string; hierarchy_level?: number };
export type User = {
  user_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string | null;
  admin_unit?: string | null;
};

interface UsersState {
  list: User[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: UsersState = {
  list: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 10,
};

// Fetch paginated users
export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async ({ page = 1, pageSize = 10, q = "" }: { page?: number; pageSize?: number; q?: string }, thunkAPI) => {
    try {
      const resp = await axios.get(`/users/?page=${page}&page_size=${pageSize}&q=${encodeURIComponent(q)}`);
      // assume server returns { results: [...], count: N }
      return { items: resp.data.results ?? resp.data, total: resp.data.count ?? resp.data.length, page, pageSize };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createUser = createAsyncThunk("users/create", async (payload: Partial<User>, thunkAPI) => {
  try {
    const resp = await axios.post("/users/", payload);
    return resp.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

export const updateUser = createAsyncThunk("users/update", async ({ id, payload }: { id: string; payload: Partial<User> }, thunkAPI) => {
  try {
    const resp = await axios.patch(`/users/${id}/`, payload);
    return resp.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteUser = createAsyncThunk("users/delete", async (id: string, thunkAPI) => {
  try {
    await axios.delete(`/users/${id}/`);
    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

const slice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUsers.fulfilled, (s, action) => {
        s.loading = false;
        s.list = action.payload.items;
        s.total = action.payload.total;
        s.page = action.payload.page;
        s.pageSize = action.payload.pageSize;
      })
      .addCase(fetchUsers.rejected, (s, action) => { s.loading = false; s.error = String(action.payload || action.error.message); })

      .addCase(createUser.fulfilled, (s, action) => { s.list.unshift(action.payload); s.total += 1; })
      .addCase(updateUser.fulfilled, (s, action) => {
        s.list = s.list.map((u) => (u.user_id === action.payload.user_id ? action.payload : u));
      })
      .addCase(deleteUser.fulfilled, (s, action) => {
        s.list = s.list.filter((u) => u.user_id !== action.payload);
        s.total = Math.max(0, s.total - 1);
      });
  },
});

export const { setPage, setPageSize } = slice.actions;
export default slice.reducer;
