import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchIncidents } from "../../store/slices/incidentsSlice";
import { fetchDevices } from "../../store/slices/devicesSlice";
import StatCard from "../../components/ui/statCard";
import ChartCard from "../../components/ui/chartCard";
import { DeviceApprovalList } from "../users/DeviceApprovalList";
import {
  FaUsers,
  FaExclamationTriangle,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const incidentsState = useAppSelector(state => state.incidents);
  const devicesState = useAppSelector(state => state.devices);

  const { list: incidents, loading, error } = incidentsState;

  useEffect(() => {
    dispatch(fetchIncidents({}));
    dispatch(fetchDevices());
  }, [dispatch]);

  /* ============================
     KPI BUSINESS LOGIC
  ============================ */
  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter(i => i.status === "OPEN").length;
    const resolved = incidents.filter(i => i.status === "RESOLVED").length;
    const closed = incidents.filter(i => i.status === "CLOSED").length;

    return {
      total,
      open,
      resolved,
      closed,
    };
  }, [incidents]);

  /* ============================
     CHART LOGIC (MONTHLY TREND)
  ============================ */
  const incidentTrend = useMemo(() => {
    const map: Record<string, number> = {};

    incidents.forEach(i => {
      if (!i.timestamp) return;
      const month = new Date(i.timestamp).toLocaleString("default", {
        month: "short",
      });
      map[month] = (map[month] || 0) + 1;
    });

    return {
      labels: Object.keys(map),
      data: Object.values(map),
    };
  }, [incidents]);

  /* ============================
     RENDER GUARDS
  ============================ */
  if (loading) {
    return <div className="p-6">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="min-h-screen bg-gray-100 font-ngao">
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Administration Dashboard
        </h1>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-4">
          <StatCard
            title="Total Incidents"
            value={stats.total}
            icon={<FaClipboardList />}
            color="bg-blue-700"
          />
          <StatCard
            title="Open Incidents"
            value={stats.open}
            icon={<FaExclamationTriangle />}
            color="bg-red-700"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<FaCheckCircle />}
            color="bg-green-700"
          />
          <StatCard
            title="Closed"
            value={stats.closed}
            icon={<FaUsers />}
            color="bg-gray-700"
          />
        </div>

        {/* INCIDENT TRENDS */}
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2">
          <ChartCard
            title="Incident Volume Trend"
            labels={incidentTrend.labels}
            data={incidentTrend.data}
            color="rgba(220,38,38,1)"
          />
        </div>

        {/* DEVICE APPROVALS */}
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            Device Approval Requests
          </h2>

          {devicesState.status === "loading" && (
            <p className="text-gray-500">Loading device requests...</p>
          )}

          {devicesState.status === "succeeded" &&
            devicesState.list.length === 0 && (
              <p className="text-gray-500">
                No pending device approvals.
              </p>
            )}

          {devicesState.status === "succeeded" &&
            devicesState.list.length > 0 && (
              <DeviceApprovalList />
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
