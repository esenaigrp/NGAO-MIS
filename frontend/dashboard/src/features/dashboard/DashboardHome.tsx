import React, { useEffect, useState } from "react";
import StatCard from "../../components/ui/statCard";
import ChartCard from "../../components/ui/chartCard";
import { FaUsers, FaExclamationTriangle, FaEnvelope } from "react-icons/fa";
import authApi from "../../api/axiosClient";
import { DeviceApprovalList } from "../users/DeviceApprovalList";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchDevices } from "../../store/slices/devicesSlice";

interface DashboardStats {
  users: number;
  incidents: number;
  messages: number;
  incident_trends: { labels: string[]; data: number[] };
  message_trends: { labels: string[]; data: number[] };
}

// Fallback placeholder data
const fallbackStats: DashboardStats = {
  users: 12,
  incidents: 5,
  messages: 8,
  incident_trends: { labels: ["Jan", "Feb", "Mar", "Apr"], data: [1, 2, 3, 4] },
  message_trends: { labels: ["Jan", "Feb", "Mar", "Apr"], data: [2, 3, 1, 4] },
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(fallbackStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingPlaceholder, setUsingPlaceholder] = useState(false);

  // DeviceApprovalList Redux
  const dispatch = useAppDispatch();
  const { list: devices, status: deviceStatus } = useAppSelector(state => state.devices);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authApi.get("/dashboard/overview/");
        const data = response.data;

        const hasIncidentData = data.incident_trends?.labels?.length > 0;
        const hasMessageData = data.message_trends?.labels?.length > 0;

        setStats({
          users: data.stats?.total_officers ?? fallbackStats.users,
          incidents: data.stats?.incidents_today ?? fallbackStats.incidents,
          messages: data.stats?.pending_civil_registrations ?? fallbackStats.messages,
          incident_trends: hasIncidentData ? data.incident_trends : fallbackStats.incident_trends,
          message_trends: hasMessageData ? data.message_trends : fallbackStats.message_trends,
        });

        setUsingPlaceholder(!hasIncidentData || !hasMessageData);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard. Showing placeholder data.");
        setStats(fallbackStats);
        setUsingPlaceholder(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    dispatch(fetchDevices()); // fetch devices for approvals
  }, [dispatch]);

  if (loading) return <div className="p-6 text-gray-600">Loading dashboard...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100 font-ngao">
      <h1 className="mb-8 text-3xl font-bold text-green-800">Dashboard</h1>

      {error && (
        <div className="p-3 mb-4 text-yellow-900 bg-yellow-200 rounded shadow">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <StatCard
          title="Users"
          value={stats.users}
          icon={<FaUsers />}
          color={usingPlaceholder ? "bg-gray-500" : "bg-green-800"}
        />
        <StatCard
          title="Incidents"
          value={stats.incidents}
          icon={<FaExclamationTriangle />}
          color={usingPlaceholder ? "bg-gray-500" : "bg-red-700"}
        />
        <StatCard
          title="Messages"
          value={stats.messages}
          icon={<FaEnvelope />}
          color={usingPlaceholder ? "bg-gray-500" : "bg-yellow-500"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        <ChartCard
          title="Incidents Over Time"
          labels={stats.incident_trends.labels}
          data={stats.incident_trends.data}
          color="rgba(185,28,28,1)"
        />
        <ChartCard
          title="Messages Over Time"
          labels={stats.message_trends.labels}
          data={stats.message_trends.data}
          color="rgba(255,215,0,1)"
        />
      </div>

      {/* Device Approval List */}
      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold text-green-700">Device Approvals</h2>

        {deviceStatus === "loading" && (
          <div className="p-4 text-gray-600">Loading devices...</div>
        )}

        {deviceStatus === "failed" && (
          <div className="p-4 text-red-600">Failed to load devices.</div>
        )}

        {deviceStatus === "succeeded" && devices.length === 0 && (
          <div className="p-4 text-gray-500">No devices pending approval.</div>
        )}

        {deviceStatus === "succeeded" && devices.length > 0 && <DeviceApprovalList />}
      </div>

      {usingPlaceholder && (
        <p className="mt-4 italic text-gray-500">Displaying placeholder data.</p>
      )}
    </div>
  );
};

export default DashboardPage;
