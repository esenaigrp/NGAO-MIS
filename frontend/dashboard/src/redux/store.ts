// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice"
import officersReducer from "../store/slices/officersSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    officers: officersReducer,
    // other slices here...
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
