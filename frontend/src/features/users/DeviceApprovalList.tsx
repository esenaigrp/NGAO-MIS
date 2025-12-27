import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDevices, approveDevice } from "../../store/slices/devicesSlice";

export const DeviceApprovalList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list: devices, status, message } = useAppSelector((state) => state.devices);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchDevices());
    }
  }, [dispatch, status]);

  console.log("devices:", devices)

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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Device Approval Requests
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage device approval requests submitted by users.
        </p>
      </div>

      {/* Device Approval requests Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Device</th>
              <th className="px-4 py-3 font-medium text-gray-700">User</th>
              <th className="px-4 py-3 font-medium text-gray-700">Trusted</th>
              <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {devices.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{d.id}</td>
                <td className="px-4 py-3">{d.user_email}</td>
                <td className="px-4 py-3">{d.is_trusted ? "Yes" : "No"}</td>
                <td className="px-4 py-3 space-x-2">
                  {!d.is_trusted && (
                    <button
                      onClick={() => handleApprove(d.id)}
                      className="px-3 py-1 text-white transition-colors bg-green-700 rounded hover:bg-green-800 cursor-pointer"
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

      {/* Pagination */}
      {/* <div className="flex items-center justify-between">
            <button
              onClick={() => dispatch(setPage(page - 1))}
              disabled={page === 1}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium
                           hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
    
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
    
            <button
              onClick={() => dispatch(setPage(page + 1))}
              disabled={page === totalPages}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium
                           hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div> */}
    </div>
  );
};
