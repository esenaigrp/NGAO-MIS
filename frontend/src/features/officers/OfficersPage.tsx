// src/features/officers/OfficersPage.tsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchOfficers,
  createOfficer,
  updateOfficer,
  deleteOfficer,
  toggleOfficerStatus,
  assignOfficerRole,
  assignOfficerAdminUnit,
  clearOfficers,
  Officer,
} from "../../store/slices/officersSlice";

const OfficersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { officers, loading, error } = useAppSelector((state) => state.officers);

  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [newOfficer, setNewOfficer] = useState<Partial<Officer>>({});
  const [roleInput, setRoleInput] = useState("");
  const [adminUnitInput, setAdminUnitInput] = useState("");

  useEffect(() => {
    dispatch(fetchOfficers());

    return () => {
      dispatch(clearOfficers());
    };
  }, [dispatch]);

  // -----------------------
  // Handlers
  // -----------------------
  const handleCreate = () => {
    if (!newOfficer.user?.email) return alert("Email is required");
    dispatch(createOfficer(newOfficer));
    setNewOfficer({});
  };

  const handleUpdate = () => {
    if (!editingOfficer) return;
    dispatch(updateOfficer({ uid: editingOfficer.uid, data: editingOfficer }));
    setEditingOfficer(null);
  };

  const handleDelete = (uid: string) => {
    if (window.confirm("Are you sure you want to delete this officer?")) {
      dispatch(deleteOfficer(uid));
    }
  };

  const handleToggleStatus = (officer: Officer) => {
    dispatch(toggleOfficerStatus({ uid: officer.uid, active: !(officer as any).active }));
  };

  const handleAssignRole = (officer: Officer) => {
    if (!roleInput) return alert("Role UID is required");
    dispatch(assignOfficerRole({ uid: officer.uid, role_uid: roleInput }));
    setRoleInput("");
  };

  const handleAssignAdminUnit = (officer: Officer) => {
    if (!adminUnitInput) return alert("Admin Unit UID is required");
    dispatch(assignOfficerAdminUnit({ uid: officer.uid, admin_unit_uid: adminUnitInput }));
    setAdminUnitInput("");
  };

  // -----------------------
  // Render
  // -----------------------
  if (loading) return <p>Loading officers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 font-ngao">
      <div className="px-6 py-8 mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Officers Management
          </h1>
        </div>

        {/* Add Officer Card */}
        <div className="mb-10 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Add New Officer
            </h2>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-4">
            <input
              type="text"
              placeholder="First Name"
              className="px-3 py-2 border rounded focus:ring focus:ring-green-200"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="px-3 py-2 border rounded focus:ring focus:ring-green-200"
            />
            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 border rounded focus:ring focus:ring-green-200"
            />

            <button
              className="px-4 py-2 font-semibold text-white bg-green-700 rounded hover:bg-green-800"
            >
              Add Officer
            </button>
          </div>
        </div>

        {/* Officers Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Registered Officers
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Badge</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Admin Unit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {officers.map((o) => (
                  <tr
                    key={o.uid}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {o.user.first_name} {o.user.last_name}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {o.user.email}
                    </td>

                    <td className="px-4 py-3">
                      {o.badge_number || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {o.role_text || o.role?.name || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {typeof o.admin_unit === "string"
                        ? o.admin_unit
                        : o.admin_unit?.name || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          (o as any).active
                            ? "text-green-700 bg-green-100"
                            : "text-red-700 bg-red-100"
                        }`}
                      >
                        {(o as any).active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3 space-x-2">
                      <button className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
                        Edit
                      </button>

                      <button className="px-3 py-1 text-sm text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200">
                        Toggle
                      </button>

                      <button className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfficersPage;
