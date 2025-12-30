import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setCurrentItem,
  verifyBirthParents,
  approveBirth,
  rejectBirth,
  clearCurrentItem,
  fetchBirthRegistrations,
  createBirth,
  updateBirth,
  deleteBirth,
  submitBirth,
} from "../../store/slices/civilSlice";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import CompactAreaSelector from "../../components/CompactAreaSelector";
import { Area } from "../../store/slices/areasSlice";
import CitizenAutocomplete from "./CitizenAutoComplete";

const BirthRegistrationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { birth, loading, error, currentItem } = useAppSelector((state) => state.civil);

  const [form, setForm] = useState({
    child_id: "",
    child_display: "",
    mother_id: "",
    mother_display: "",
    father_id: "",
    father_display: "",
    place_of_birth: "",
    date_of_birth: ""
  });

  const [editingBirthRecord, setEditingBirthRecord] = useState<any | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [motherVerified, setMotherVerified] = useState(false);
  const [fatherVerified, setFatherVerified] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: string }>({ 
    key: null, 
    direction: 'asc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchBirthRegistrations());
  }, [dispatch]);

  // Create draft - now using IDs
  const handleCreate = () => {
    const payload = {
      child: form.child_id,
      mother: form.mother_id,
      father: form.father_id || null, // optional
      place_of_birth: form.place_of_birth,
      date_of_birth: form.date_of_birth,
      area: selectedAreaId
    };
    
    dispatch(createBirth(payload));
    
    // Reset form
    setForm({
      child_id: "",
      child_display: "",
      mother_id: "",
      mother_display: "",
      father_id: "",
      father_display: "",
      place_of_birth: "",
      date_of_birth: ""
    });
    setSelectedAreaId(null);
  };

  const handleUpdate = () => {
    if (!editingBirthRecord) return;
    dispatch(updateBirth({ id: editingBirthRecord.id, data: editingBirthRecord }));
    setEditingBirthRecord(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this birth record?')) {
      dispatch(deleteBirth(id));
    }
  };

  const handleSubmit = (id: string) => {
    if (window.confirm('Submit this birth record for approval?')) {
      dispatch(submitBirth(id));
    }
  };

  const handleApprove = (id: string) => dispatch(approveBirth(id));
  const handleReject = (id: string) => dispatch(rejectBirth(id));

  const handleSelect = (item: any) => {
    dispatch(setCurrentItem(item));
    setMotherVerified(!!item.mother_verified);
    setFatherVerified(!!item.father_verified);
    setShowVerifyModal(true);
  };

  const closeModal = () => {
    setShowVerifyModal(false);
    dispatch(clearCurrentItem());
  };

  const handleVerifyParents = () => {
    if (!currentItem) return;
    dispatch(
      verifyBirthParents({
        id: currentItem.id,
        motherVerified,
        fatherVerified,
      })
    ).then(() => {
      dispatch(clearCurrentItem());
      setShowVerifyModal(false);
    });
  };

  const handleAreaSelectionChange = (areaId: string | null, area: any | null) => {
    setSelectedAreaId(areaId);
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = birth.filter((b) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        b.child_name?.toLowerCase().includes(searchLower) ||
        b.mother?.toLowerCase().includes(searchLower) ||
        b.father?.toLowerCase().includes(searchLower) ||
        b.place_of_birth?.toLowerCase().includes(searchLower) ||
        b.date_of_birth?.toLowerCase().includes(searchLower) ||
        b.reference_number?.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key as keyof typeof a];
        let bVal = b[sortConfig.key as keyof typeof b];

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
  }, [birth, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.direction === 'asc' ?
      <FaChevronUp className="ml-1 inline h-4 w-4" /> :
      <FaChevronDown className="ml-1 inline h-4 w-4" />;
  };

  if (loading) return <p>Loading Birth Registrations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Birth Registrations</h1>
        <p className="mt-1 text-sm text-gray-500">Manage birth registration records submitted by citizens.</p>
      </div>

      {/* Register Birth Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Register Birth</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CitizenAutocomplete
            label="Child"
            placeholder="Search child by name or ID number"
            value={form.child_display}
            onSelect={(id, display) => setForm({ ...form, child_id: id, child_display: display })}
            required
          />

          <CitizenAutocomplete
            label="Mother"
            placeholder="Search mother by name or ID number"
            value={form.mother_display}
            onSelect={(id, display) => setForm({ ...form, mother_id: id, mother_display: display })}
            required
          />

          <CitizenAutocomplete
            label="Father (optional)"
            placeholder="Search father by name or ID number"
            value={form.father_display}
            onSelect={(id, display) => setForm({ ...form, father_id: id, father_display: display })}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Place of Birth <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Place of Birth"
              value={form.place_of_birth}
              onChange={(e) => setForm({ ...form, place_of_birth: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <CompactAreaSelector
          onSelectionChange={handleAreaSelectionChange}
          className="max-w-1xl mt-4"
        />

        <div className="mt-4">
          <button
            onClick={handleCreate}
            disabled={!form.child_id || !form.mother_id || !form.place_of_birth || !form.date_of_birth}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save Draft
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search birth records..."
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
                    onClick={() => handleSort('reference_number')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Reference <SortIcon columnKey="reference_number" />
                  </th>
                  <th
                    onClick={() => handleSort('child_name')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Child Name <SortIcon columnKey="child_name" />
                  </th>
                  <th
                    onClick={() => handleSort('date_of_birth')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Date of Birth <SortIcon columnKey="date_of_birth" />
                  </th>
                  <th
                    onClick={() => handleSort('place_of_birth')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Place of Birth <SortIcon columnKey="place_of_birth" />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Mother Verified</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Father Verified</th>
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
                  paginatedData.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{b.reference_number}</td>
                      <td className="px-4 py-3">{b.child_name}</td>
                      <td className="px-4 py-3">{b.date_of_birth}</td>
                      <td className="px-4 py-3">{b.place_of_birth}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          b.mother_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {b.mother_verified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          b.father_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {b.father_verified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          b.status === 'draft' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : b.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleSelect(b)}
                          className="px-3 py-1 text-sm text-indigo-700 bg-indigo-100 rounded hover:bg-indigo-200"
                        >
                          Verify Parents
                        </button>

                        <button
                          onClick={() => setEditingBirthRecord(b)}
                          disabled={b.status !== "draft"}
                          className={`px-3 py-1 text-sm rounded ${b.status === "draft"
                            ? "text-blue-700 bg-blue-100 hover:bg-blue-200"
                            : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={b.status !== "draft"}
                          className={`px-3 py-1 text-sm rounded ${b.status === "draft"
                            ? "text-red-700 bg-red-100 hover:bg-red-200"
                            : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                          Delete
                        </button>

                        <button
                          onClick={() => handleSubmit(b.id)}
                          disabled={b.status !== "draft"}
                          className={`px-3 py-1 text-sm rounded ${b.status === "draft"
                            ? "text-green-700 bg-green-100 hover:bg-green-200"
                            : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No birth records found
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
      {editingBirthRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Edit Birth Record</h3>

            <input
              placeholder="Place of Birth"
              value={editingBirthRecord.place_of_birth}
              onChange={(e) =>
                setEditingBirthRecord({ ...editingBirthRecord, place_of_birth: e.target.value })
              }
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              value={editingBirthRecord.date_of_birth}
              onChange={(e) =>
                setEditingBirthRecord({ ...editingBirthRecord, date_of_birth: e.target.value })
              }
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingBirthRecord(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
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

      {/* Verify Parents Modal */}
      {showVerifyModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Verify Parents</h3>

            <p className="mb-4 text-sm text-gray-600">
              Child: <span className="font-medium">{currentItem.child_name}</span>
            </p>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={motherVerified}
                  onChange={(e) => setMotherVerified(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Mother Verified</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={fatherVerified}
                  onChange={(e) => setFatherVerified(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Father Verified</span>
              </label>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleVerifyParents}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-700 rounded hover:bg-green-800"
              >
                Submit Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthRegistrationList;