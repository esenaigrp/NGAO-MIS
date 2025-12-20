import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";

type Props = {
  roles?: string[];
};

export default function ProtectedRoute({ roles }: Props) {
  const { isAuthenticated, user, loading, isInitialLoad } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading || isInitialLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
