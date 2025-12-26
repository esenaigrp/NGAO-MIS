// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import areasReducer from "./slices/areasSlice"; // your AreaState slice
import usersReducer from "./slices/usersSlice"; 
import incidentsReducer from "./slices/incidentsSlice";
import dashboardReducer from "./slices/dashboardSlice";
import devicesReducer from "./slices/devicesSlice";
import officersReducer from "./slices/officersSlice";
import civilReducer from "./slices/civilSlice";
import adminUnitsReducer from "./slices/adminStructureSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,     // ✅ Auth slice
    areas: areasReducer,
    users: usersReducer,
    incidents: incidentsReducer,
    dashboard: dashboardReducer,
    devices: devicesReducer,
    officers: officersReducer,
    civil: civilReducer,
    adminUnits: adminUnitsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
