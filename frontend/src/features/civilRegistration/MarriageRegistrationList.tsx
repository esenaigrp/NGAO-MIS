import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMarriageRegistrations, approveMarriage, rejectMarriage, createMarriage, updateMarriage, deleteMarriage } from "../../store/slices/civilSlice";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";

interface MarriageForm {
  spouse_1: string;
  spouse_2: string;
  date_of_marriage: string;
  place_of_marriage: string;
  initiated_by: string;
  reference_number: string;
  status: "submitted" | "approved" | "rejected" | string;
  approved_at?: string;
}

const MarriageRegistrationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { marriage, loading, error } = useAppSelector((state) => state.civil);
  const { citizens } = useAppSelector((state) => state.citizens);

  const [newMarriage, setNewMarriage] = useState<MarriageForm>({
    spouse_1: "",
    spouse_2: "",
    date_of_marriage: "",
    place_of_marriage: "",
    initiated_by: "",
    reference_number: "",
    status: "submitted",
    approved_at: "",
  });

  const [editingMarriage, setEditingMarriage] = useState<MarriageForm | null>(null);
  const [spouse1Search, setSpouse1Search] = useState("");
  const [spouse2Search, setSpouse2Search] = useState("");
  const [editSpouse1Search, setEditSpouse1Search] = useState("");
  const [editSpouse2Search, setEditSpouse2Search] = useState("");

  // const totalPages = Math.ceil(total / pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchMarriageRegistrations());
  }, [dispatch]);

  const handleCreate = () => {
    dispatch(createMarriage(newMarriage));
    setNewMarriage({
      spouse_1: "",
      spouse_2: "",
      date_of_marriage: "",
      place_of_marriage: "",
      initiated_by: "",
      reference_number: "",
      status: "submitted",
      approved_at: "",
    });
    setSpouse1Search("");
    setSpouse2Search("");
  };

  const handleUpdate = () => {
    if (!editingMarriage) return;
    dispatch(updateMarriage(editingMarriage));
    setEditingMarriage(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this record?")) {
      dispatch(deleteMarriage(id));
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
    let filtered = marriage.filter((m) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        // m.spouse1.toLowerCase().includes(searchLower) ||
        // m.spouse2.toLowerCase().includes(searchLower) ||
        m.place_of_marriage.toLowerCase().includes(searchLower) ||
        m.date_of_marriage.toLowerCase().includes(searchLower) ||
        m.status.toLowerCase().includes(searchLower)
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
  }, [marriage, searchTerm, sortConfig]);

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

  if (loading) return <p>Loading Marriage Registrations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Marriage Registrations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage marriage registration records submitted by citizens.
        </p>
      </div>

      {/* Register Marriage Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Register Marriage</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Spouse 1 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Spouse 1</label>
            <input
              type="text"
              placeholder="Search Spouse 1..."
              value={spouse1Search}
              onChange={(e) => setSpouse1Search(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newMarriage.spouse_1}
              onChange={(e) => setNewMarriage({ ...newMarriage, spouse_1: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Spouse 1</option>
              {citizens
                .filter((c) => c.name.toLowerCase().includes(spouse1Search.toLowerCase()))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.national_id})
                  </option>
                ))}
            </select>
          </div>

          {/* Spouse 2 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Spouse 2</label>
            <input
              type="text"
              placeholder="Search Spouse 2..."
              value={spouse2Search}
              onChange={(e) => setSpouse2Search(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newMarriage.spouse_2}
              onChange={(e) => setNewMarriage({ ...newMarriage, spouse_2: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Spouse 2</option>
              {citizens
                .filter((c) => c.name.toLowerCase().includes(spouse2Search.toLowerCase()))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.national_id})
                  </option>
                ))}
            </select>
          </div>

          {/* Other Fields */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date of Marriage</label>
            <input
              type="date"
              value={newMarriage.date_of_marriage}
              onChange={(e) => setNewMarriage({ ...newMarriage, date_of_marriage: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Place of Marriage</label>
            <input
              type="text"
              value={newMarriage.place_of_marriage}
              onChange={(e) => setNewMarriage({ ...newMarriage, place_of_marriage: e.target.value })}
              placeholder="Location / Venue"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Initiated By</label>
            <input
              type="text"
              value={newMarriage.initiated_by}
              onChange={(e) => setNewMarriage({ ...newMarriage, initiated_by: e.target.value })}
              placeholder="User initiating record"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Reference Number</label>
            <input
              type="text"
              value={newMarriage.reference_number}
              onChange={(e) => setNewMarriage({ ...newMarriage, reference_number: e.target.value })}
              placeholder="Unique reference"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={newMarriage.status}
              onChange={(e) => setNewMarriage({ ...newMarriage, status: e.target.value as any })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Approved At</label>
            <input
              type="datetime-local"
              value={newMarriage.approved_at}
              onChange={(e) => setNewMarriage({ ...newMarriage, approved_at: e.target.value })}
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
            Submit Marriage Record
          </button>
        </div>
      </div>

      {/* Marriage Records Table */}
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
                    onClick={() => handleSort('spouse1')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Spouse 1 <SortIcon columnKey="spouse1" />
                  </th>
                  <th
                    onClick={() => handleSort('spouse2')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Spouse 2 <SortIcon columnKey="spouse2" />
                  </th>
                  <th
                    onClick={() => handleSort('place_of_marriage')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Place of Marriage <SortIcon columnKey="place_of_marriage" />
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
                  paginatedData.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{m.reference_number}</td>
                      <td className="px-4 py-3">{m.spouse1}</td>
                      <td className="px-4 py-3">{m.spouse2}</td>
                      <td className="px-4 py-3">{m.place_of_marriage}</td>
                      <td className="px-4 py-3">{m.status}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => dispatch(approveMarriage(m.id))}
                          className={`px-3 py-1 text-sm rounded cursor-pointer ${m.status !== "approved"
                            ? "text-green-700 bg-green-100 hover:bg-green-200"
                            : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => dispatch(rejectMarriage(m.id))}
                          className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setEditingMarriage(m)}
                          className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
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
      {editingMarriage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Edit Marriage Record</h3>

            {/* Spouse 1 & 2 Searchable Selects */}
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Spouse 1</label>
              <input
                type="text"
                placeholder="Search Spouse 1..."
                value={editSpouse1Search}
                onChange={(e) => setEditSpouse1Search(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingMarriage.spouse_1}
                onChange={(e) =>
                  setEditingMarriage({ ...editingMarriage, spouse_1: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Spouse 1</option>
                {citizens
                  .filter((c) => c.name.toLowerCase().includes(editSpouse1Search.toLowerCase()))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.national_id})
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Spouse 2</label>
              <input
                type="text"
                placeholder="Search Spouse 2..."
                value={editSpouse2Search}
                onChange={(e) => setEditSpouse2Search(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingMarriage.spouse_2}
                onChange={(e) =>
                  setEditingMarriage({ ...editingMarriage, spouse_2: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Spouse 2</option>
                {citizens
                  .filter((c) => c.name.toLowerCase().includes(editSpouse2Search.toLowerCase()))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.national_id})
                    </option>
                  ))}
              </select>
            </div>

            {/* Other Fields */}
            {["date_of_marriage", "place_of_marriage", "initiated_by", "reference_number", "status", "approved_at"].map(
              (field) => (
                <div className="mb-3" key={field}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {field.replace("_", " ").toUpperCase()}
                  </label>
                  {field === "status" ? (
                    <select
                      value={(editingMarriage as any)[field]}
                      onChange={(e) =>
                        setEditingMarriage({ ...editingMarriage, [field]: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <input
                      type={field.includes("date") || field.includes("approved") ? "datetime-local" : "text"}
                      value={(editingMarriage as any)[field] || ""}
                      onChange={(e) =>
                        setEditingMarriage({ ...editingMarriage, [field]: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              )
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingMarriage(null)}
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

export default MarriageRegistrationList;
