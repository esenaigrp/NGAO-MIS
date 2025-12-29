// src/features/officers/OfficersPage.tsx
import React, { useEffect, useMemo, useState } from "react";
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
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import CompactAreaSelector from "../../components/CompactAreaSelector";
import { Area } from "../../store/slices/areasSlice";


const OfficersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { officers, loading, error } = useAppSelector((state) => state.officers);
  const { adminUnits } = useAppSelector((state) => state.adminUnits);

  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

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
    notes: '',
    area: selectedAreaId
  });
  const [roleInput, setRoleInput] = useState("");
  const [adminUnitInput, setAdminUnitInput] = useState("");


  // const totalPages = Math.ceil(total / pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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
      notes: '',
      area: selectedAreaId
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

   const handleAreaSelectionChange = (areaId: string | null, area: Area | null) => {
    setSelectedAreaId(areaId);
    console.log("Area Selected:", areaId, area);
    // This will ONLY fire when a sub county is actually selected
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
    const searchLower = searchTerm.toLowerCase();

    const filtered = officers.filter((officer) => {
      const firstName = officer.user?.first_name || "";
      const lastName = officer.user?.last_name || "";
      const email = officer.user?.email || "";
      const badge = officer.badge_number || "";
      const idNumber = officer.id_number || "";

      return (
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        badge.toLowerCase().includes(searchLower) ||
        idNumber.toLowerCase().includes(searchLower) ||
        `${firstName} ${lastName}`.toLowerCase().includes(searchLower)
      );
    });

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = "";
      let bVal = "";

      switch (sortConfig.key) {
        case "name":
          aVal = `${a.user?.first_name || ""} ${a.user?.last_name || ""}`;
          bVal = `${b.user?.first_name || ""} ${b.user?.last_name || ""}`;
          break;

        case "email":
          aVal = a.user?.email || "";
          bVal = b.user?.email || "";
          break;

        case "badge_number":
          aVal = a.badge_number || "";
          bVal = b.badge_number || "";
          break;

        case "id_number":
          aVal = a.id_number || "";
          bVal = b.id_number || "";
          break;

        case "status":
          aVal = a.is_active ? "active" : "inactive";
          bVal = b.is_active ? "active" : "inactive";
          break;

        case "admin_unit":
          aVal = typeof a.admin_unit === "string"
            ? adminUnits.find(u => u.id === a.admin_unit)?.name || ""
            : a.admin_unit?.name || "";
          bVal = typeof b.admin_unit === "string"
            ? adminUnits.find(u => u.id === b.admin_unit)?.name || ""
            : b.admin_unit?.name || "";
          break;

        default:
          aVal = String((a as any)[sortConfig.key] ?? "");
          bVal = String((b as any)[sortConfig.key] ?? "");
      }

      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [officers, searchTerm, sortConfig]);


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
            <CompactAreaSelector
              onSelectionChange={handleAreaSelectionChange}
              className="max-w-1xl mt-2"
            />

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

          <div className="overflow-x-auto p-6 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search officers..."
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
                        onClick={() => handleSort('name')}
                        className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Name <SortIcon columnKey="name" />
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Email <SortIcon columnKey="email" />
                      </th>
                      <th
                        onClick={() => handleSort('badge_number')}
                        className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Badge <SortIcon columnKey="badge_number" />
                      </th>
                      <th onClick={() => handleSort('admin_unit')} className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100">
                        Admin Unit <SortIcon columnKey="admin_unit" />
                      </th>
                      <th onClick={() => handleSort('status')} className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100">
                        Status <SortIcon columnKey="status" />
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((officer) => (
                        <tr key={officer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{officer.user?.first_name} {officer.user?.last_name}</td>
                          <td className="px-4 py-3">{officer.user.email}</td>
                          <td className="px-4 py-3">{officer?.badge_number}</td>
                          <td className="px-4 py-3">{typeof officer.admin_unit === "string"
                            ? adminUnits.find(u => u.id === officer.admin_unit)?.name || officer.admin_unit
                            : officer.admin_unit?.name || "-"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${officer.is_active
                                ? "text-green-700 bg-green-100"
                                : "text-red-700 bg-red-100"
                                }`}
                            >
                              {officer.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-4 py-3 space-x-2">
                            <button
                              onClick={() => setEditingOfficer(officer)}
                              className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleToggleStatus(officer)}
                              className="px-3 py-1 text-sm text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 transition-colors"
                            >
                              Toggle
                            </button>

                            <button
                              onClick={() => handleDelete(officer.id)}
                              className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
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
        </div>

      </div>
    </div>
  );
};

export default OfficersPage;
