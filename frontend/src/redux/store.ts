// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice"
import officersReducer from "../store/slices/officersSlice"
import devicesReducer from "../store/slices/devicesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    officers: officersReducer,
    devices: devicesReducer,
    // other slices here...
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
