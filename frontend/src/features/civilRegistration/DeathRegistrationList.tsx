import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDeathRegistrations, approveDeath, rejectDeath, createDeath, updateDeath, deleteDeath } from "../../store/slices/civilSlice";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import { fetchCitizens } from "../../store/slices/citizenSlice";
import CompactAreaSelector from "../../components/CompactAreaSelector";
import { Area } from "../../store/slices/areasSlice";
import CitizenAutocomplete from "./CitizenAutoComplete";

interface DeathRecordForm {
  citizen: string;
  citizen_display: string;
  date_of_death: string;
  place_of_death: string;
  cause_of_death: string;
  initiated_by: string;
  reference_number: string;
  status: "submitted" | "approved" | "rejected";
  approved_at?: string;
  area?: string;
  age?: string;
  comments?: string;
  gender?: string;
}

const DeathRegistrationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { death, loading, error } = useAppSelector((state) => state.civil);
  const { citizens } = useAppSelector((state) => state.citizens);

  const [newDeath, setNewDeath] = useState<DeathRecordForm>({
    citizen: "",
    date_of_death: "",
    place_of_death: "",
    cause_of_death: "",
    initiated_by: "",
    reference_number: "",
    status: "submitted",
    approved_at: "",
    citizen_display: "",
    age: "",
    comments: "",
    gender: ""
  });

  const [editingDeath, setEditingDeath] = useState<DeathRecordForm | null>(null);
  const [citizenSearch, setCitizenSearch] = useState("");
  const [editCitizenSearch, setEditCitizenSearch] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // const totalPages = Math.ceil(total / pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);


  useEffect(() => {
    dispatch(fetchDeathRegistrations());
  }, [dispatch]);

  const handleCreate = () => {
    dispatch(createDeath(newDeath))
      .unwrap()
      .then(() => {
        setNewDeath({
          citizen: "",
          date_of_death: "",
          place_of_death: "",
          cause_of_death: "",
          initiated_by: "",
          reference_number: "",
          status: "submitted",
          approved_at: "",
          citizen_display: "",
          area: "",
          age: "",
          comments: "",
          gender: ""
        });
        setCitizenSearch("");
      })
      .catch((error) => {
        console.error("Death creation failed:", error);
      });
  };

  const handleUpdate = () => {
    if (!editingDeath) return;
    dispatch(updateDeath(editingDeath));
    setEditingDeath(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this record?")) {
      dispatch(deleteDeath(id));
    }
  };

  const handleAreaSelectionChange = (areaId: string | null, area: Area | null) => {
    setSelectedAreaId(areaId);
    setNewDeath({ ...newDeath, area: areaId })
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
    let filtered = death.filter((d) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        d.citizen.toLowerCase().includes(searchLower) ||
        d.place_of_death.toLowerCase().includes(searchLower) ||
        d.date_of_death.toLowerCase().includes(searchLower) ||
        d.gender.toLowerCase().includes(searchLower)
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
  }, [death, searchTerm, sortConfig]);

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

  if (loading) return <p>Loading Death Registrations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Death Registrations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage death registration records submitted by citizens.
        </p>
      </div>

      {/* Register Death Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Register Death</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <CitizenAutocomplete
              label="Deceased"
              placeholder="Search by name or ID number"
              value={newDeath.citizen_display}
              onSelect={(id, display) => setNewDeath({ ...newDeath, citizen: id, citizen_display: display })}
              required
            />
          </div>

          {/* Other Fields */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date of Death</label>
            <input
              type="date"
              value={newDeath.date_of_death}
              onChange={(e) => setNewDeath({ ...newDeath, date_of_death: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Place of Death</label>
            <input
              type="text"
              value={newDeath.place_of_death}
              onChange={(e) => setNewDeath({ ...newDeath, place_of_death: e.target.value })}
              placeholder="Hospital / Location"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cause of Death</label>
            <input
              type="text"
              value={newDeath.cause_of_death}
              onChange={(e) => setNewDeath({ ...newDeath, cause_of_death: e.target.value })}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              value={newDeath.gender}
              onChange={(e) => setNewDeath({ ...newDeath, gender: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Age at Death
            </label>
            <input
              type="number"
              min={0}
              value={newDeath.age}
              onChange={(e) => setNewDeath({ ...newDeath, age: e.target.value })}
              placeholder="Age in years"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Comments / Additional Notes
            </label>
            <textarea
              rows={3}
              value={newDeath.comments}
              onChange={(e) => setNewDeath({ ...newDeath, comments: e.target.value })}
              placeholder="Additional remarks (optional)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={newDeath.status}
              onChange={(e) => setNewDeath({ ...newDeath, status: e.target.value as any })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div> */}

          {/* <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Approved At</label>
            <input
              type="datetime-local"
              value={newDeath.approved_at}
              onChange={(e) => setNewDeath({ ...newDeath, approved_at: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}
        </div>

        <CompactAreaSelector
          onSelectionChange={handleAreaSelectionChange}
          className="max-w-1xl mt-2"
        />

        <div className="mt-6">
          <button
            onClick={handleCreate}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium
                         text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            Submit Death Record
          </button>
        </div>
      </div>

      {/* Death Records Table */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search death records..."
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
                    onClick={() => handleSort('reference')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Reference <SortIcon columnKey="reference" />
                  </th>
                  <th
                    onClick={() => handleSort('date_of_death')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Date of Death <SortIcon columnKey="date_of_death" />
                  </th>
                  <th
                    onClick={() => handleSort('place_of_death')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Place of Death <SortIcon columnKey="place_of_death" />
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Status <SortIcon columnKey="status" />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedData.length > 0 ? (
                  paginatedData.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{d.reference_number}</td>
                      <td className="px-4 py-3">{d.date_of_death}</td>
                      <td className="px-4 py-3">{d.place_of_death}</td>
                      <td className="px-4 py-3">{d.status}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => setEditingDeath(d)}
                          className="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
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
      {editingDeath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Edit Death Record</h3>

            {/* Citizen Dropdown */}
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Citizen</label>
              <input
                type="text"
                placeholder="Search citizen..."
                value={editCitizenSearch}
                onChange={(e) => setEditCitizenSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingDeath.citizen}
                onChange={(e) =>
                  setEditingDeath({ ...editingDeath, citizen: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select citizen</option>
                {citizens
                  .filter((c) => c.name.toLowerCase().includes(editCitizenSearch.toLowerCase()))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={editingDeath.status}
                onChange={(e) => setEditingDeath({ ...editingDeath, status: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Other Fields */}
            {["date_of_death", "place_of_death", "cause_of_death", "initiated_by", "reference_number", "approved_at"].map((field) => (
              <div className="mb-3" key={field}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {field.replace("_", " ").toUpperCase()}
                </label>
                <input
                  type={field.includes("date") || field.includes("approved") ? "datetime-local" : "text"}
                  value={(editingDeath as any)[field] || ""}
                  onChange={(e) =>
                    setEditingDeath({ ...editingDeath, [field]: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingDeath(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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

export default DeathRegistrationList;
