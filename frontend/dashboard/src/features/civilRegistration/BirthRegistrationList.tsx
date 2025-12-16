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

  const [motherVerified, setMotherVerified] = useState(false);
  const [fatherVerified, setFatherVerified] = useState(false);

  useEffect(() => {
    dispatch(fetchCivilRegistrations());
  }, [dispatch]);

  const handleSelect = (item: any) => {
    dispatch(setCurrentItem(item));
    setMotherVerified(item.mother_verified);
    setFatherVerified(item.father_verified);
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
    <div>
      <h2 className="mb-4 text-xl font-bold">Birth Registrations</h2>
      <table className="w-full border table-auto">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Child Name</th>
            <th>Date of Birth</th>
            <th>Mother Verified</th>
            <th>Father Verified</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {birth.map((b) => (
            <tr key={b.id}>
              <td>{b.reference_number}</td>
              <td>{b.child_name || `${b.child?.first_name} ${b.child?.last_name}`}</td>
              <td>{b.date_of_birth}</td>
              <td>{b.mother_verified ? "Yes" : "No"}</td>
              <td>{b.father_verified ? "Yes" : "No"}</td>
              <td>{b.status}</td>
              <td className="space-x-2">
                <button onClick={() => handleSelect(b)} className="btn-primary">
                  Verify Parents
                </button>
                <button onClick={() => handleApprove(b.id)} className="btn-success">
                  Approve
                </button>
                <button onClick={() => handleReject(b.id)} className="btn-danger">
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {currentItem && (
        <div className="p-4 mt-4 bg-gray-100 border rounded">
          <h3 className="font-bold">Verify Parents for {currentItem.child_name}</h3>
          <label>
            <input
              type="checkbox"
              checked={motherVerified}
              onChange={(e) => setMotherVerified(e.target.checked)}
            />{" "}
            Mother Verified
          </label>
          <label className="ml-4">
            <input
              type="checkbox"
              checked={fatherVerified}
              onChange={(e) => setFatherVerified(e.target.checked)}
            />{" "}
            Father Verified
          </label>
          <div className="mt-2">
            <button onClick={handleVerifyParents} className="btn-primary">
              Submit Verification
            </button>
            <button onClick={() => dispatch(clearCurrentItem())} className="ml-2 btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthRegistrationList;