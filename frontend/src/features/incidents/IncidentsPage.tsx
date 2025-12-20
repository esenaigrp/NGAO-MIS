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

const placeholderIncidents: Incident[] = [
  {
    id: -1,
    title: "Sample Incident 1",
    description: "This is a placeholder incident",
    incident_type: "Test",
    status: "Open",
    location: "Unknown",
    reported_by: "Admin",
    timestamp: new Date().toISOString(),
  },
  {
    id: -2,
    title: "Sample Incident 2",
    description: "This is another placeholder",
    incident_type: "Test",
    status: "Closed",
    location: "Unknown",
    reported_by: "Admin",
    timestamp: new Date().toISOString(),
  },
];

const IncidentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading, error, page, pageSize, total } = useAppSelector(
    (state) => state.incidents
  );

  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({});
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    dispatch(fetchIncidents({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  // Decide what to display: real data or placeholder
  const hasData = list.length > 0;
  const incidentsToShow = hasData ? list : placeholderIncidents;

  const handleCreate = () => {
    if (!newIncident.title) return alert("Title is required");
    dispatch(createIncident(newIncident));
    setNewIncident({});
  };

  const handleUpdate = () => {
    if (!editingIncident) return;
    dispatch(updateIncident({ id: editingIncident.id, payload: editingIncident }));
    setEditingIncident(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this incident?")) {
      dispatch(deleteIncident(id));
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) dispatch(setPage(page + 1));
  };

  const handlePrevPage = () => {
    if (page > 1) dispatch(setPage(page - 1));
  };

  if (loading) return <p>Loading incidents...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Incident Management</h2>

      {/* Create Incident */}
      <div className="p-4 mb-6 border rounded bg-gray-50">
        <h3 className="mb-2 font-semibold">Add New Incident</h3>
        <input
          type="text"
          placeholder="Title"
          value={newIncident.title || ""}
          onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
          className="p-1 mr-2 border"
        />
        <input
          type="text"
          placeholder="Description"
          value={newIncident.description || ""}
          onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
          className="p-1 mr-2 border"
        />
        <button onClick={handleCreate} className="btn-primary">
          Add Incident
        </button>
      </div>

      {/* Incidents Table */}
      <table className="w-full border table-auto">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Type</th>
            <th>Status</th>
            <th>Location</th>
            <th>Reported By</th>
            <th>Timestamp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidentsToShow.map((i) => (
            <tr key={i.id} className={i.id < 0 ? "opacity-50 italic" : ""}>
              <td>{i.title}</td>
              <td>{i.description || "-"}</td>
              <td>{i.incident_type || "-"}</td>
              <td>{i.status || "-"}</td>
              <td>{i.location || "-"}</td>
              <td>{i.reported_by || "-"}</td>
              <td>{i.timestamp || "-"}</td>
              <td className="space-x-2">
                {i.id > 0 && (
                  <>
                    <button onClick={() => setEditingIncident(i)} className="btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(i.id)} className="btn-danger">
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!hasData && (
        <p className="mt-4 italic text-gray-500">No incidents found. Showing placeholders.</p>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button onClick={handlePrevPage} disabled={page === 1 || !hasData} className="btn-secondary">
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page === totalPages || !hasData} className="btn-secondary">
          Next
        </button>
      </div>

      {/* Edit Incident Modal */}
      {editingIncident && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="p-4 bg-white rounded w-96">
            <h3 className="mb-2 font-bold">Edit Incident</h3>
            <input
              type="text"
              value={editingIncident.title}
              onChange={(e) =>
                setEditingIncident({ ...editingIncident, title: e.target.value })
              }
              className="w-full p-1 mb-2 border"
            />
            <input
              type="text"
              value={editingIncident.description || ""}
              onChange={(e) =>
                setEditingIncident({ ...editingIncident, description: e.target.value })
              }
              className="w-full p-1 mb-2 border"
            />
            <input
              type="text"
              value={editingIncident.incident_type || ""}
              onChange={(e) =>
                setEditingIncident({ ...editingIncident, incident_type: e.target.value })
              }
              className="w-full p-1 mb-2 border"
            />
            <button onClick={handleUpdate} className="mr-2 btn-primary">
              Save
            </button>
            <button onClick={() => setEditingIncident(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
