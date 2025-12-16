import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`p-6 rounded-xl shadow-lg flex items-center justify-between ${color}`}>
      <div>
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      </div>
      <div className="text-4xl text-white opacity-80">{icon}</div>
    </div>
  );
};

export default StatCard;
