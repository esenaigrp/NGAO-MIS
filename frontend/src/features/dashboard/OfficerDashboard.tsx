import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchIncidents } from "../../store/slices/incidentsSlice";
import StatCard from "../../components/ui/statCard";
import {
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

const OfficerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const { list, loading, error } = useAppSelector(
    state => state.incidents
  );

  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchIncidents({}));
  }, [dispatch]);

  /* ============================
     DERIVED DATA (BUSINESS LOGIC)
  ============================ */

  const assigned = useMemo(
    () =>
      list.filter(
        i => i.status !== "CLOSED" && i.reported_by === user?.email
      ),
    [list, user]
  );

  const stats = useMemo(() => {
    const open = assigned.filter(i => i.status === "OPEN").length;
    const urgent = assigned.filter(i => i.incident_type === "URGENT").length;
    const resolvedToday = assigned.filter(
      i =>
        i.status === "RESOLVED" &&
        i.timestamp?.startsWith(new Date().toISOString().split("T")[0])
    ).length;

    return {
      open,
      urgent,
      resolved_today: resolvedToday,
    };
  }, [assigned]);

  /* ============================
     RENDER
  ============================ */

  if (loading) {
    return <div className="p-6">Loading incidents...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-ngao">
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          My Operational Dashboard
        </h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
          <StatCard
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
          />
        </div>

        {/* Assigned Incidents */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Assigned Incidents
            </h2>
          </div>

          <div className="p-6">
            {assigned.length === 0 ? (
              <p className="text-gray-500">
                No incidents assigned to you.
              </p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left bg-gray-100">
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Type</th>
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
                        {incident.title}
                      </td>
                      <td className="px-4 py-2">
                        {incident.incident_type || "—"}
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
