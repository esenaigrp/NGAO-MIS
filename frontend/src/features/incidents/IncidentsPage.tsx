// src/features/incidents/IncidentsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
  setPage,
} from "../../store/slices/incidentsSlice";
import { fetchAdminUnits } from "../../store/slices/adminStructureSlice";
import { FaChevronUp, FaChevronDown, FaSearch } from "react-icons/fa";

const IncidentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading, error, page, pageSize, total } = useAppSelector((state) => state.incidents);
  const { adminUnits } = useAppSelector((state) => state.adminUnits);
  const { user } = useAppSelector((state) => state.auth);

  const [editingIncident, setEditingIncident] = useState<any | null>(null);
  const [newIncident, setNewIncident] = useState<any>({
    title: "",
    description: "",
    incident_type: "",
    reporter_phone: "",
    location: "",
  });

  // const totalPages = Math.ceil(total / pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchIncidents({ page, pageSize }));
    dispatch(fetchAdminUnits());
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
      location: "",
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

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = list.filter((incident) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        incident.title.toLowerCase().includes(searchLower) ||
        incident.incident_type.toLowerCase().includes(searchLower) ||
        incident.status.toLowerCase().includes(searchLower) ||
        `${incident.reported_by?.first_name || ''} ${incident.reported_by?.last_name || ''}`.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'reported_by') {
          aVal = `${a.reported_by?.first_name || ''} ${a.reported_by?.last_name || ''}`;
          bVal = `${b.reported_by?.first_name || ''} ${b.reported_by?.last_name || ''}`;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [list, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.direction === 'asc' ?
      <FaChevronUp className="ml-1 inline h-4 w-4" /> :
      <FaChevronDown className="ml-1 inline h-4 w-4" />;
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <option value="">Select Type ..</option>
              <option value="fire">Fire Incident</option>
              <option value="accident">Traffic Accident</option>
              <option value="crime">Crime/Security</option>
              <option value="medical">Medical Emergency</option>
              <option value="other">Other</option>
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

          {/* Admin Unit Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>
            {/* Admin Unit Dropdown */}
            <select
              value={newIncident.location}
              onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Location ...</option>
              {adminUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.properties.name}
                </option>
              ))}
            </select>
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
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {/* <div className="px-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Reported Incidents ({list.length})
          </h2>
        </div> */}
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th
                    onClick={() => handleSort('title')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Title <SortIcon columnKey="title" />
                  </th>
                  <th
                    onClick={() => handleSort('incident_type')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Type <SortIcon columnKey="incident_type" />
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Status <SortIcon columnKey="status" />
                  </th>
                  <th
                    onClick={() => handleSort('reported_by')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Reported By <SortIcon columnKey="reported_by" />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Reporter Phone</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Location</th>
                  <th
                    onClick={() => handleSort('date_reported')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Date <SortIcon columnKey="date_reported" />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedData.length > 0 ? (
                  paginatedData.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{incident.title}</td>
                      <td className="px-4 py-3">{incident.incident_type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          incident.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {incident.reported_by?.first_name} {incident.reported_by?.last_name || incident.reported_by?.email || "—"}
                      </td>
                      <td className="px-4 py-3">{incident.reporter_phone || "—"}</td>
                      <td className="px-4 py-3">
                        {incident.location
                          ? `${incident.location.latitude.toFixed(4)}, ${incident.location.longitude.toFixed(4)}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(incident.date_reported).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => setEditingIncident(incident)}
                          className="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(incident.id)}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No incidents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{' '}
            {filteredAndSortedData.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-md px-3 py-1 text-sm font-medium ${currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
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
