// src/components/layout/PrivateLayout.tsx
import React, {ReactNode} from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface PrivateLayoutProps {
  children: ReactNode;
}

const PrivateLayout: React.FC = () => {
  const { user, loading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Let ProtectedRoute handle redirect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar userName={user?.first_name || "User"} />
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
