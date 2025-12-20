import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDevices, approveDevice } from "../../store/slices/devicesSlice";

export const DeviceApprovalList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list: devices = [], status, message } = useAppSelector(
    (state) => state.devices
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchDevices());
    }
  }, [dispatch, status]);

  const handleApprove = (id: string) => {
    dispatch(approveDevice(id));
  };

  if (status === "loading") {
    return <div className="p-4 text-gray-600">Loading devices...</div>;
  }

  if (status === "failed") {
    return <div className="p-4 text-red-600">Failed to load devices. {message}</div>;
  }

  if (devices.length === 0) {
    return <div className="p-4 text-gray-500">No devices pending approval.</div>;
  }

  return (
    <div className="p-4 overflow-x-auto bg-white rounded shadow">
      {message && <div className="mb-2 text-green-700">{message}</div>}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-green-100">
            <th className="px-4 py-2 border-b">Device ID</th>
            <th className="px-4 py-2 border-b">User</th>
            <th className="px-4 py-2 border-b">Trusted</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{d.device_id}</td>
              <td className="px-4 py-2 border-b">{d.user_email}</td>
              <td className="px-4 py-2 border-b">{d.is_trusted ? "Yes" : "No"}</td>
              <td className="px-4 py-2 border-b">
                {!d.is_trusted && (
                  <button
                    onClick={() => handleApprove(d.id)}
                    className="px-3 py-1 text-white transition-colors bg-green-700 rounded hover:bg-green-800"
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
