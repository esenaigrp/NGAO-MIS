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
import { fetchAdminUnits } from "../../store/slices/adminStructureSlice";

const OfficersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { officers, loading, error } = useAppSelector((state) => state.officers);
  const { adminUnits } = useAppSelector((state) => state.adminUnits);

  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [newOfficer, setNewOfficer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    role_text: '',
    badge_number: '',
    id_number: '',
    office_email: '',
    admin_unit: '',
    is_active: true,
    notes: ''
  });
  const [roleInput, setRoleInput] = useState("");

  const [adminUnitInput, setAdminUnitInput] = useState("");

  useEffect(() => {
    dispatch(fetchOfficers());
    dispatch(fetchAdminUnits());

    return () => {
      dispatch(clearOfficers());
    };
  }, [dispatch]);

  // -----------------------
  // Handlers
  // -----------------------
  const handleCreate = () => {
    if (!newOfficer.email) return alert("Email is required");

    // Structure the data according to your API expectations
    const officerData = {
      user: {
        first_name: newOfficer.first_name,
        last_name: newOfficer.last_name,
        email: newOfficer.email
      },
      phone: newOfficer.phone,
      role_text: newOfficer.role_text,
      badge_number: newOfficer.badge_number,
      id_number: newOfficer.id_number,
      office_email: newOfficer.office_email,
      admin_unit: newOfficer.admin_unit,
      is_active: newOfficer.is_active,
      notes: newOfficer.notes
    };

    dispatch(createOfficer(officerData));

    // Reset form
    setNewOfficer({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      role_text: '',
      badge_number: '',
      id_number: '',
      office_email: '',
      admin_unit: '',
      is_active: true,
      notes: ''
    });

  };

  const handleUpdate = () => {
    if (!editingOfficer) return;
    dispatch(updateOfficer({ uid: editingOfficer.id, data: editingOfficer }));
    setEditingOfficer(null);
  };

  const handleDelete = (uid: string) => {
    if (window.confirm("Are you sure you want to delete this officer?")) {
      dispatch(deleteOfficer(uid));
    }
  };

  const handleToggleStatus = (officer: Officer) => {
    dispatch(toggleOfficerStatus({ uid: officer.id, active: !(officer as any).active }));
  };

  const handleAssignRole = (officer: Officer) => {
    if (!roleInput) return alert("Role UID is required");
    dispatch(assignOfficerRole({ uid: officer.id, role_uid: roleInput }));
    setRoleInput("");
  };

  const handleAssignAdminUnit = (officer: Officer) => {
    if (!adminUnitInput) return alert("Admin Unit UID is required");
    dispatch(assignOfficerAdminUnit({ uid: officer.id, admin_unit_uid: adminUnitInput }));
    setAdminUnitInput("");
  };

  // -----------------------
  // Render
  // -----------------------
  if (loading) return <p>Loading officers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-8">

        {/* Header */}
         <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Officers Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage law enforcement officers within the system.
        </p>
      </div>

        {/* Add Officer Card */}
        <div className="mb-10 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-800">
              Add New Officer
            </h2>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Personal Information */}
              <input
                type="text"
                placeholder="First Name"
                value={newOfficer.first_name}
                onChange={(e) => setNewOfficer({ ...newOfficer, first_name: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newOfficer.last_name}
                onChange={(e) => setNewOfficer({ ...newOfficer, last_name: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email *"
                value={newOfficer.email}
                onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none"
                required
              />

              {/* Contact Information */}
              <input
                type="tel"
                placeholder="Phone"
                value={newOfficer.phone}
                onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Office Email"
                value={newOfficer.office_email}
                onChange={(e) => setNewOfficer({ ...newOfficer, office_email: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none"
              />

              {/* Officer Details */}
              <input
                type="text"
                placeholder="Badge Number"
                value={newOfficer.badge_number}
                onChange={(e) => setNewOfficer({ ...newOfficer, badge_number: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none"
              />
              <input
                type="text"
                placeholder="ID Number"
                value={newOfficer.id_number}
                onChange={(e) => setNewOfficer({ ...newOfficer, id_number: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none"
              />

              {/* Role Information */}
              <input
                type="text"
                placeholder="Role Text (e.g., Inspector)"
                value={newOfficer.role_text}
                onChange={(e) => setNewOfficer({ ...newOfficer, role_text: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none"
              />

              {/* Admin Unit Dropdown */}
              <select
                value={newOfficer.admin_unit}
                onChange={(e) => setNewOfficer({ ...newOfficer, admin_unit: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none bg-white"
              >
                <option value="">Select Admin Unit</option>
                {adminUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.properties.name}
                  </option>
                ))}
              </select>

              {/* Notes - Full Width */}
              <textarea
                placeholder="Notes"
                value={newOfficer.notes}
                onChange={(e) => setNewOfficer({ ...newOfficer, notes: e.target.value })}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-200 focus:outline-none md:col-span-2"
                rows={2}
              />

              {/* Active Status */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newOfficer.is_active}
                    onChange={(e) => setNewOfficer({ ...newOfficer, is_active: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="px-6 py-2 font-semibold text-white bg-green-700 rounded hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Add Officer
              </button>
            </div>
          </div>
        </div>

        {/* Officers Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Registered Officers ({officers.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Badge</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Admin Unit</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {officers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No officers found. Add your first officer above.
                    </td>
                  </tr>
                ) : (
                  officers.map((o: Officer) => (
                    <tr
                      key={o.id}
                      className="border-t hover:bg-gray-50 transition-colors"
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
                          ? adminUnits.find(u => u.id === o.admin_unit)?.name || o.admin_unit
                          : o.admin_unit?.name || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${o.is_active
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                            }`}
                        >
                          {o.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => setEditingOfficer(o)}
                          className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggleStatus(o)}
                          className="px-3 py-1 text-sm text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 transition-colors"
                        >
                          Toggle
                        </button>

                        <button
                          onClick={() => handleDelete(o.id)}
                          className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfficersPage;
