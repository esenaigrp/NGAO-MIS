// src/features/dashboard/OfficerDashboard.tsx
import React, { useEffect } from "react";
import { FaExclamationTriangle, FaClock, FaCheckCircle } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMyIncidents } from "../../store/slices/incidentsSlice";
import StatCard from "../../components/ui/statCard";

const OfficerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  // const { assigned, stats, status } = useAppSelector(
  //   state => state.incidents
  // );

  let status = "loading";
  let assigned = [];
  const stats = [];

  useEffect(() => {
    dispatch(fetchMyIncidents());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100 font-ngao">
      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Header */}
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          My Operational Dashboard
        </h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
          {/* <StatCard
            title="Open Incidents"
            value={stats.open}
            icon={<FaClock />}
            color="bg-blue-700"
          />
          <StatCard
            title="Urgent Incidents"
            value={stats.urgent}
            icon={<FaExclamationTriangle />}
            color="bg-red-700"
          />
          <StatCard
            title="Resolved Today"
            value={stats.resolved_today}
            icon={<FaCheckCircle />}
            color="bg-green-700"
          /> */}
        </div>

        {/* Assigned Incidents */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Assigned Incidents
            </h2>
          </div>

          <div className="p-6">
            {status === "loading" && (
              <p className="text-gray-500">Loading incidents...</p>
            )}

            {assigned.length === 0 && status === "succeeded" && (
              <p className="text-gray-500">
                No incidents assigned to you.
              </p>
            )}

            {assigned.length > 0 && (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left bg-gray-100">
                    <th className="px-4 py-2">Reference</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Priority</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assigned.map(incident => (
                    <tr
                      key={incident.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium">
                        {incident.reference}
                      </td>
                      <td className="px-4 py-2">
                        {incident.category}
                      </td>
                      <td className="px-4 py-2">
                        {incident.priority}
                      </td>
                      <td className="px-4 py-2">
                        {incident.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
