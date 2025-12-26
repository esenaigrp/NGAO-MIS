// src/features/incidents/IncidentsPage.tsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
  setPage,
  setPageSize,
  Incident,
} from "../../store/slices/incidentsSlice";


const IncidentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading, error, page, pageSize, total } = useAppSelector((state) => state.incidents);
  const { user } = useAppSelector((state) => state.auth);

  const [editingIncident, setEditingIncident] = useState<any | null>(null);
  const [newIncident, setNewIncident] = useState<any>({
    title: "",
    description: "",
    incident_type: "other",
    reporter_phone: "",
  });

  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    dispatch(fetchIncidents({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  const handleCreate = () => {
    if (!newIncident.title || !newIncident.description) {
      alert("Title and description are required");
      return;
    }

    dispatch(createIncident(newIncident));
    setNewIncident({
      title: "",
      description: "",
      incident_type: "other",
      reporter_phone: "",
    });
  };

  const handleUpdate = () => {
    if (!editingIncident) return;
    dispatch(
      updateIncident({
        id: editingIncident.id,
        payload: editingIncident,
      })
    );
    setEditingIncident(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this incident?")) {
      dispatch(deleteIncident(id));
    }
  };

  if (loading) return <p className="p-6">Loading incidents…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Incident Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Report, track, and manage incidents
        </p>
      </div>

      {/* Create Incident */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Report New Incident
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={newIncident.title}
              onChange={(e) =>
                setNewIncident({ ...newIncident, title: e.target.value })
              }
              placeholder="Brief incident title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Incident Type
            </label>
            <select
              value={newIncident.incident_type}
              onChange={(e) =>
                setNewIncident({
                  ...newIncident,
                  incident_type: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="other">Other</option>
              <option value="theft">Theft</option>
              <option value="assault">Assault</option>
              <option value="accident">Accident</option>
            </select>
          </div>

           {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reporter Phone
            </label>
            <input
              type="tel"
              value={newIncident.reporter_phone}
              onChange={(e) =>
                setNewIncident({
                  ...newIncident,
                  reporter_phone: e.target.value,
                })
              }
              placeholder="+2547…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={4}
              value={newIncident.description}
              onChange={(e) =>
                setNewIncident({
                  ...newIncident,
                  description: e.target.value,
                })
              }
              placeholder="Describe what happened…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleCreate}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium
                     text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            Submit Incident
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Title</th>
              <th className="px-4 py-3 font-medium text-gray-700">Type</th>
              <th className="px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 font-medium text-gray-700">Reported By</th>
              <th className="px-4 py-3 font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.map((incident) => (
              <tr key={incident.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{incident.title}</td>
                <td className="px-4 py-3">{incident.incident_type}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {incident.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {incident.reported_by?.email || "—"}
                </td>
                <td className="px-4 py-3">
                  {new Date(incident.date_reported).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    onClick={() => setEditingIncident(incident)}
                    className="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium
                             hover:bg-gray-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(incident.id)}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium
                             text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
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
      </div>

      {/* Edit Modal */}
      {editingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Edit Incident
            </h3>

            <input
              value={editingIncident.title}
              onChange={(e) =>
                setEditingIncident({
                  ...editingIncident,
                  title: e.target.value,
                })
              }
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              rows={3}
              value={editingIncident.description}
              onChange={(e) =>
                setEditingIncident({
                  ...editingIncident,
                  description: e.target.value,
                })
              }
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingIncident(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium
                         hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium
                         text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default IncidentsPage;
