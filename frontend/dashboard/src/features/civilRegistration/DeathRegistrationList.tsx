import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCivilRegistrations, approveDeath, rejectDeath } from "../../store/slices/civilSlice";

const DeathRegistrationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { death, loading, error } = useAppSelector((state) => state.civil);

  useEffect(() => {
    dispatch(fetchCivilRegistrations());
  }, [dispatch]);

  if (loading) return <p>Loading Death Registrations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Death Registrations</h2>
      <table className="w-full border table-auto">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Citizen</th>
            <th>Date of Death</th>
            <th>Place of Death</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {death.map((d) => (
            <tr key={d.id}>
              <td>{d.reference_number}</td>
              <td>{d.citizen_name || `${d.citizen?.first_name} ${d.citizen?.last_name}`}</td>
              <td>{d.date_of_death}</td>
              <td>{d.place_of_death}</td>
              <td>{d.status}</td>
              <td className="space-x-2">
                <button onClick={() => dispatch(approveDeath(d.id))} className="btn-success">
                  Approve
                </button>
                <button onClick={() => dispatch(rejectDeath(d.id))} className="btn-danger">
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

export default DeathRegistrationList;
