import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPendingDeviceCount } from "../../store/slices/devicesSlice";
import { logout } from "../../store/slices/authSlice";
import { useEffect } from "react";

const Topbar = () => {
  const dispatch = useAppDispatch();
  const pending = useAppSelector(state => state.devices.pendingCount);
  const role = useAppSelector(state => state.auth.user?.role);

  useEffect(() => {
    if (role === "SUPER_ADMIN") {
      dispatch(fetchPendingDeviceCount());
    }
  }, [dispatch, role]);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {role === "SUPER_ADMIN" && pending > 0 && (
        <span className="px-3 py-1 text-sm text-white bg-red-600 rounded-full">
          {pending} Device Approvals
        </span>
      )}
    </header>
  );
};

export default Topbar;
