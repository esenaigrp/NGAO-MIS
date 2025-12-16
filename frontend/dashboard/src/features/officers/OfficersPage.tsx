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
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Officers Management</h2>

      {/* Create Officer */}
      <div className="p-4 mb-6 border rounded bg-gray-50">
        <h3 className="mb-2 font-semibold">Add New Officer</h3>
        <input
          type="text"
          placeholder="First Name"
          value={newOfficer.user?.first_name || ""}
          onChange={(e) =>
            setNewOfficer({ ...newOfficer, user: { ...newOfficer.user, first_name: e.target.value } })
          }
          className="p-1 mr-2 border"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newOfficer.user?.last_name || ""}
          onChange={(e) =>
            setNewOfficer({ ...newOfficer, user: { ...newOfficer.user, last_name: e.target.value } })
          }
          className="p-1 mr-2 border"
        />
        <input
          type="email"
          placeholder="Email"
          value={newOfficer.user?.email || ""}
          onChange={(e) =>
            setNewOfficer({ ...newOfficer, user: { ...newOfficer.user, email: e.target.value } })
          }
          className="p-1 mr-2 border"
        />
        <button onClick={handleCreate} className="btn-primary">
          Add Officer
        </button>
      </div>

      {/* Officers Table */}
      <table className="w-full border table-auto">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Badge Number</th>
            <th>Role</th>
            <th>Admin Unit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {officers.map((o) => (
            <tr key={o.uid}>
              <td>{`${o.user.first_name} ${o.user.last_name}`}</td>
              <td>{o.user.email}</td>
              <td>{o.badge_number || "-"}</td>
              <td>{o.role_text || o.role?.name || "-"}</td>
              <td>{typeof o.admin_unit === "string" ? o.admin_unit : o.admin_unit?.name || "-"}</td>
              <td>{(o as any).active ? "Active" : "Inactive"}</td>
              <td className="space-x-2">
                <button onClick={() => setEditingOfficer(o)} className="btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleToggleStatus(o)} className="btn-warning">
                  Toggle Status
                </button>
                <button onClick={() => handleAssignRole(o)} className="btn-info">
                  Assign Role
                </button>
                <button onClick={() => handleAssignAdminUnit(o)} className="btn-info">
                  Assign Unit
                </button>
                <button onClick={() => handleDelete(o.uid)} className="btn-danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Officer Modal */}
      {editingOfficer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="p-4 bg-white rounded w-96">
            <h3 className="mb-2 font-bold">Edit Officer</h3>
            <input
              type="text"
              value={editingOfficer.user.first_name}
              onChange={(e) =>
                setEditingOfficer({
                  ...editingOfficer,
                  user: { ...editingOfficer.user, first_name: e.target.value },
                })
              }
              className="w-full p-1 mb-2 border"
            />
            <input
              type="text"
              value={editingOfficer.user.last_name}
              onChange={(e) =>
                setEditingOfficer({
                  ...editingOfficer,
                  user: { ...editingOfficer.user, last_name: e.target.value },
                })
              }
              className="w-full p-1 mb-2 border"
            />
            <input
              type="email"
              value={editingOfficer.user.email}
              onChange={(e) =>
                setEditingOfficer({
                  ...editingOfficer,
                  user: { ...editingOfficer.user, email: e.target.value },
                })
              }
              className="w-full p-1 mb-2 border"
            />
            <button onClick={handleUpdate} className="mr-2 btn-primary">
              Save
            </button>
            <button onClick={() => setEditingOfficer(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficersPage;
