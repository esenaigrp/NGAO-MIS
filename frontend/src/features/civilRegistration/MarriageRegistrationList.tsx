import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMarriageRegistrations, approveMarriage, rejectMarriage } from "../../store/slices/civilSlice";

const MarriageRegistrationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { marriage, loading, error } = useAppSelector((state) => state.civil);

  useEffect(() => {
    dispatch(fetchMarriageRegistrations());
  }, [dispatch]);

  if (loading) return <p>Loading Marriage Registrations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Marriage Registrations
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage marriage registration records submitted by citizens.
        </p>
      </div>

      {/* Register Marriage */}
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
              <th className="px-4 py-3 font-medium text-gray-700">Spouse 1</th>
              <th className="px-4 py-3 font-medium text-gray-700">Spouse 2</th>
              <th className="px-4 py-3 font-medium text-gray-700">Place of Marriage</th>
              <th className="px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {marriage.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{m.reference_number}</td>
                <td className="px-4 py-3">{m.spouse1_name}</td>
                <td className="px-4 py-3">{m.spouse2_name}</td>
                <td className="px-4 py-3">{m.place_of_marriage}</td>
                <td className="px-4 py-3">{m.status}</td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => dispatch(approveMarriage(m.id))} className={`px-3 py-1 text-sm rounded cursor-pointer ${m.status !== "approved"
                    ? "text-green-700 bg-green-100 hover:bg-green-200"
                    : "text-gray-400 bg-gray-100 cursor-not-allowed"
                    }`}>
                    Approve
                  </button>
                  <button onClick={() => dispatch(rejectMarriage(m.id))} className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 cursor-pointer">
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
    </div>
  );
};

export default MarriageRegistrationList;
