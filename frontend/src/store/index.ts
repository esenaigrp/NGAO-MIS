import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import incidentsReducer from "./slices/incidentsSlice";
import officersReducers from "./slices/officersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    incidents: incidentsReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
