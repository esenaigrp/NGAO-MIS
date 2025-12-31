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
import CompactAreaSelector from "../../components/CompactAreaSelector";
import { Area } from "../../store/slices/areasSlice";
import IncidentMapModal from "./IncidentsMapModal";

const IncidentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading, error, page, pageSize, total } = useAppSelector((state) => state.incidents);
  const { adminUnits } = useAppSelector((state) => state.adminUnits);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const [editingIncident, setEditingIncident] = useState<any | null>(null);
  const [newIncident, setNewIncident] = useState<any>({
    title: "",
    description: "",
    incident_type: "other",
    reporter_name: "",
    reporter_email: "",
    reporter_phone: "",
    reporter_statement: "",
    location: "",
    area: selectedAreaId
  });

  // const totalPages = Math.ceil(total / pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [mapOpen, setMapOpen] = useState(false);
  const [mapIncidents, setMapIncidents] = useState<any[]>([]);
  const [witnesses, setWitnesses] = useState([{ name: '', email: '', phone: '', statement: '' }]);
  const [showReporter, setShowReporter] = useState(false);
  const [showWitnesses, setShowWitnesses] = useState(false);

  useEffect(() => {
    dispatch(fetchIncidents({ page, pageSize }));
    dispatch(fetchAdminUnits());
  }, [dispatch, page, pageSize]);


  const handleAddWitness = () => {
    if (!showWitnesses) {
      setShowWitnesses(true);
    }
    setWitnesses([...witnesses, { name: '', email: '', phone: '', statement: '' }]);
  };

  const handleRemoveWitness = (index) => {
    if (witnesses.length > 1) {
      setWitnesses(witnesses.filter((_, i) => i !== index));
    }
  };

  const handleWitnessChange = (index, field, value) => {
    const updatedWitnesses = witnesses.map((witness, i) =>
      i === index ? { ...witness, [field]: value } : witness
    );
    setWitnesses(updatedWitnesses);
  };

  const handleCreate = () => {
    if (!newIncident.title || !newIncident.description) {
      alert("Title and description are required");
      return;
    }

    // Validate reporter if any reporter field is filled
    const hasReporterData = newIncident.reporter_name || newIncident.reporter_email ||
      newIncident.reporter_phone || newIncident.reporter_statement;

    if (hasReporterData && (!newIncident.reporter_name || !newIncident.reporter_phone)) {
      alert("Reporter name and phone are required when providing reporter information");
      return;
    }

    // Validate witnesses - filter out empty witnesses and validate filled ones
    const filledWitnesses = witnesses.filter(w =>
      w.name || w.email || w.phone || w.statement
    );

    for (let i = 0; i < filledWitnesses.length; i++) {
      if (!filledWitnesses[i].name || !filledWitnesses[i].phone) {
        alert(`Witness ${i + 1}: Name and phone are required when providing witness information`);
        return;
      }
    }

    // Create incident with witnesses data
    const incidentData = {
      ...newIncident,
      witnesses: filledWitnesses
    };

    dispatch(createIncident(incidentData))
      .unwrap()
      .then(() => {
        // Reset form ONLY on success
        setNewIncident({
          title: "",
          description: "",
          incident_type: "other",
          reporter_name: "",
          reporter_email: "",
          reporter_phone: "",
          reporter_statement: "",
          location: "",
          area: selectedAreaId,
        });

        setWitnesses([{ name: "", email: "", phone: "", statement: "" }]);
      })
      .catch((error) => {
        console.error("Incident creation failed:", error);
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

  const handleAreaSelectionChange = (areaId: string | null, area: Area | null) => {
    setSelectedAreaId(areaId);
    setNewIncident({ ...newIncident, area: areaId })
  };

  const openSingleIncidentMap = (incident) => {
    setMapIncidents([incident]);
    setMapOpen(true);
  };

  const openAllIncidentsMap = () => {
    setMapIncidents(filteredAndSortedData);
    setMapOpen(true);
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
          <div className="md:col-span-2">
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

          {/* Description */}
          <div className="md:col-span-3">
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
        <CompactAreaSelector
          onSelectionChange={handleAreaSelectionChange}
          className="max-w-1xl mt-2"
        />

        {/* Reporter Section */}
        <div className="mb-6 border-t border-gray-200 pt-6">
          <div
            onClick={() => setShowReporter(!showReporter)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${showReporter ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900">
                  Reporter Information
                </h3>
                <p className="text-xs text-gray-500">Optional - Click to add reporter details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showReporter && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Active
                </span>
              )}
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform ${showReporter ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {showReporter && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newIncident.reporter_name || ''}
                    onChange={(e) =>
                      setNewIncident({ ...newIncident, reporter_name: e.target.value })
                    }
                    placeholder="Reporter's name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newIncident.reporter_email || ''}
                    onChange={(e) =>
                      setNewIncident({ ...newIncident, reporter_email: e.target.value })
                    }
                    placeholder="reporter@example.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newIncident.reporter_phone || ''}
                    onChange={(e) =>
                      setNewIncident({
                        ...newIncident,
                        reporter_phone: e.target.value,
                      })
                    }
                    placeholder="+254..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Reporter Statement
                  </label>
                  <textarea
                    rows={3}
                    value={newIncident.reporter_statement || ''}
                    onChange={(e) =>
                      setNewIncident({
                        ...newIncident,
                        reporter_statement: e.target.value,
                      })
                    }
                    placeholder="Additional details from the reporter..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Witnesses Section */}
        <div className="mb-6 border-t border-gray-200 pt-6">
          <div className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
            <div
              onClick={() => setShowWitnesses(!showWitnesses)}
              className="flex items-center gap-3 flex-1 cursor-pointer"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${showWitnesses ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900">
                  Witness Information
                </h3>
                <p className="text-xs text-gray-500">
                  Optional - Click to add witness details
                  {witnesses.length > 0 && witnesses.some(w => w.name || w.email || w.phone || w.statement) &&
                    ` (${witnesses.filter(w => w.name || w.email || w.phone || w.statement).length} witness${witnesses.filter(w => w.name || w.email || w.phone || w.statement).length > 1 ? 'es' : ''})`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showWitnesses && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddWitness();
                  }}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  + Add Witness
                </button>
              )}
              {showWitnesses && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Active
                </span>
              )}
              <svg
                onClick={() => setShowWitnesses(!showWitnesses)}
                className={`h-5 w-5 text-gray-400 transition-transform cursor-pointer ${showWitnesses ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {showWitnesses && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
              {witnesses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-3">No witnesses added yet</p>
                  <button
                    type="button"
                    onClick={handleAddWitness}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    + Add First Witness
                  </button>
                </div>
              ) : (
                <>
                  {witnesses.map((witness, index) => (
                    <div key={index} className="mb-6 last:mb-0">
                      {witnesses.length > 1 && (
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            Witness {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveWitness(index)}
                            className="text-xs text-red-600 hover:text-red-800 focus:outline-none font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            value={witness.name}
                            onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                            placeholder="Witness's name"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            value={witness.email}
                            onChange={(e) => handleWitnessChange(index, 'email', e.target.value)}
                            placeholder="witness@example.com"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={witness.phone}
                            onChange={(e) => handleWitnessChange(index, 'phone', e.target.value)}
                            placeholder="+254..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Witness Statement
                          </label>
                          <textarea
                            rows={3}
                            value={witness.statement}
                            onChange={(e) => handleWitnessChange(index, 'statement', e.target.value)}
                            placeholder="What did the witness observe..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {index < witnesses.length - 1 && (
                        <div className="mt-4 border-b border-gray-200"></div>
                      )}
                    </div>
                  ))}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleAddWitness}
                      className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                      + Add Another Witness
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
            <div>
              <button
                onClick={openAllIncidentsMap}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 cursor-pointer"
              >
                View All on Map
              </button>
            </div>
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
                      <td className="px-4 py-3">{incident?.area?.name}</td>
                      <td className="px-4 py-3">
                        {new Date(incident.date_reported).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => openSingleIncidentMap(incident)}
                          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setEditingIncident(incident)}
                          className="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-300 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(incident.id)}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 cursor-pointer"
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

      {mapOpen && (
        <IncidentMapModal
          incidents={mapIncidents}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );

};

export default IncidentsPage;
