import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCivilRegistrations, approveMarriage, rejectMarriage } from "../../store/slices/civilSlice";

const MarriageRegistrationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { marriage, loading, error } = useAppSelector((state) => state.civil);

  useEffect(() => {
    dispatch(fetchCivilRegistrations());
  }, [dispatch]);

  if (loading) return <p>Loading Marriage Registrations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Marriage Registrations</h2>
      <table className="w-full border table-auto">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Spouse 1</th>
            <th>Spouse 2</th>
            <th>Date of Marriage</th>
            <th>Place of Marriage</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {marriage.map((m) => (
            <tr key={m.id}>
              <td>{m.reference_number}</td>
              <td>{m.spouse_1_name || `${m.spouse_1?.first_name} ${m.spouse_1?.last_name}`}</td>
              <td>{m.spouse_2_name || `${m.spouse_2?.first_name} ${m.spouse_2?.last_name}`}</td>
              <td>{m.date_of_marriage}</td>
              <td>{m.place_of_marriage}</td>
              <td>{m.status}</td>
              <td className="space-x-2">
                <button onClick={() => dispatch(approveMarriage(m.id))} className="btn-success">
                  Approve
                </button>
                <button onClick={() => dispatch(rejectMarriage(m.id))} className="btn-danger">
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarriageRegistrationList;
