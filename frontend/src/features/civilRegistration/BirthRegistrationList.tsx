import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchCivilRegistrations,
  setCurrentItem,
  verifyBirthParents,
  approveBirth,
  rejectBirth,
  clearCurrentItem,
} from "../../store/slices/civilSlice";

const BirthRegistrationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { birth, loading, error, currentItem } = useAppSelector((state) => state.civil);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [motherVerified, setMotherVerified] = useState(false);
  const [fatherVerified, setFatherVerified] = useState(false);

  useEffect(() => {
    dispatch(fetchCivilRegistrations());
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
    <div className="min-h-screen bg-gray-100 font-ngao">
      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Header */}
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Birth Registrations</h1>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Submitted Applications</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Child Name</th>
                  <th className="px-4 py-3">Date of Birth</th>
                  <th className="px-4 py-3">Mother</th>
                  <th className="px-4 py-3">Father</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {birth.map((b) => {
                  const fullyVerified = b.mother_verified && b.father_verified;
                  return (
                    <tr key={b.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{b.reference_number}</td>
                      <td className="px-4 py-3">{b.child_name || `${b.child?.first_name} ${b.child?.last_name}`}</td>
                      <td className="px-4 py-3 text-gray-600">{b.date_of_birth}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            b.mother_verified ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                          }`}
                        >
                          {b.mother_verified ? "Verified" : "Not Verified"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            b.father_verified ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                          }`}
                        >
                          {b.father_verified ? "Verified" : "Not Verified"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
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
                          onClick={() => handleApprove(b.id)}
                          disabled={!fullyVerified}
                          className={`px-3 py-1 text-sm rounded ${
                            fullyVerified
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verify Parents Modal */}
        {showVerifyModal && currentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
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
    </div>
  );
};

export default BirthRegistrationList;