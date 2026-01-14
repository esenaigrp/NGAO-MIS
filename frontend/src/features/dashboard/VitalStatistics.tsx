import React, { useState } from 'react';
import { FaClock, FaExclamationTriangle, FaCheckCircle, FaBaby, FaHeart, FaSkull, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/ui/statCard';

const VitalStatistics = ({ birthsData, deathsData, marriagesData }) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Vital Statistics</h2>
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <StatCard
          title="Births This Month"
          value={birthsData?.thisMonth}
          icon={<FaBaby />}
          color="bg-pink-600"
        />
        <StatCard
          title="Deaths This Month"
          value={deathsData?.thisMonth}
          icon={<FaSkull />}
          color="bg-gray-700"
        />
        <StatCard
          title="Marriages This Month"
          value={marriagesData?.thisMonth}
          icon={<FaHeart />}
          color="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Births by Gender</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={birthsData?.byGender}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#ec4899" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Deaths by Age Group</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deathsData?.byAgeGroup}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6b7280" name="Deaths" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" data={birthsData?.trend} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" data={birthsData?.trend} stroke="#ec4899" strokeWidth={2} name="Births" />
            <Line type="monotone" dataKey="count" data={deathsData?.trend} stroke="#6b7280" strokeWidth={2} name="Deaths" />
            <Line type="monotone" dataKey="count" data={marriagesData?.trend} stroke="#8b5cf6" strokeWidth={2} name="Marriages" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default VitalStatistics;