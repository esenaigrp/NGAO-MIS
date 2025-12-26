import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setCurrentItem,
  verifyBirthParents,
  approveBirth,
  rejectBirth,
  clearCurrentItem,
  fetchBirthRegistrations,
} from "../../store/slices/civilSlice";

const BirthRegistrationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { birth, loading, error, currentItem } = useAppSelector((state) => state.civil);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [editingBirthRecord, setEditingBirthRecord] = useState<any | null>(null);
  const [motherVerified, setMotherVerified] = useState(false);
  const [fatherVerified, setFatherVerified] = useState(false);

  useEffect(() => {
    dispatch(fetchBirthRegistrations());
  }, [dispatch]);

  // Open modal when selecting an item
  const handleSelect = (item: any) => {
    dispatch(setCurrentItem(item));
    setMotherVerified(!!item.mother_verified);
    setFatherVerified(!!item.father_verified);
    setShowVerifyModal(true); // open modal
  };

  // Close modal and clear current item
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
    ).then(() => dispatch(clearCurrentItem()));
  };

  const handleApprove = (id: string) => dispatch(approveBirth(id));
  const handleReject = (id: string) => dispatch(rejectBirth(id));

  if (loading) return <p>Loading Birth Registrations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Birth Registrations
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage birth registration records submitted by citizens.
        </p>
      </div>

      {/* Create Incident */}
      {/* <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Report New Incident
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
      </div> */}

      {/* Incidents Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Reference</th>
              <th className="px-4 py-3 font-medium text-gray-700">Child Name</th>
              <th className="px-4 py-3 font-medium text-gray-700">Date of Birth</th>
              <th className="px-4 py-3 font-medium text-gray-700">Place of Birth</th>
              <th className="px-4 py-3 font-medium text-gray-700">Mother Verified</th>
              <th className="px-4 py-3 font-medium text-gray-700">Father Verified</th>
              <th className="px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {birth.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{b.reference_number}</td>
                <td className="px-4 py-3">{b.child_name}</td>
                <td className="px-4 py-3">{b.date_of_birth}</td>
                <td className="px-4 py-3">{b.place_of_birth}</td>
                <td className="px-4 py-3">{b.mother_verified}</td>
                <td className="px-4 py-3">{b.father_verified}</td>
                <td className="px-4 py-3">{b.status}</td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    onClick={() => handleSelect(b)}
                    className="px-3 py-1 text-sm text-indigo-700 bg-indigo-100 rounded hover:bg-indigo-200"
                  >
                    Verify Parents
                  </button>

                  <button
                    onClick={() => handleApprove(b.id)}
                    disabled={!b.mother_verified && b.father_verified}
                    className={`px-3 py-1 text-sm rounded ${b.mother_verified && b.father_verified
                      ? "text-green-700 bg-green-100 hover:bg-green-200"
                      : "text-gray-400 bg-gray-100 cursor-not-allowed"
                      }`}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(b.id)}
                    className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* <div className="flex items-center justify-between">
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
      </div> */}

      {/* Edit Modal */}
      {editingBirthRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Edit Birth Record
            </h3>

            <input
              value={editingBirthRecord.title}
              onChange={(e) =>
                setEditingBirthRecord({
                  ...editingBirthRecord,
                  title: e.target.value,
                })
              }
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              rows={3}
              value={editingBirthRecord.description}
              onChange={(e) =>
                setEditingBirthRecord({
                  ...editingBirthRecord,
                  description: e.target.value,
                })
              }
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingBirthRecord(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium
                             hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                // onClick={handleUpdate}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium
                             text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Parents Modal */}
      {showVerifyModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray bg-opacity-30">
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