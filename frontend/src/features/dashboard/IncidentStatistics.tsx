import React, { useState } from 'react';
import { FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/ui/statCard';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const IncidentStatistics = ({ data, onCardClick }) => {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <StatCard
          title="Open Incidents"
          value={data?.stats?.open}
          icon={<FaClock />}
          color="bg-blue-700"
          onClick={onCardClick}
        />
        <StatCard
          title="Urgent Incidents"
          value={data?.stats?.urgent}
          icon={<FaExclamationTriangle />}
          color="bg-red-700"
          onClick={onCardClick}
        />
        <StatCard
          title="Resolved Today"
          value={data?.stats?.resolved_today}
          icon={<FaCheckCircle />}
          color="bg-green-700"
          onClick={onCardClick}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Incidents by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.byType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.byType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Incident Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} name="Incidents" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default IncidentStatistics;