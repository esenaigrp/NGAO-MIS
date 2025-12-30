import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  onClick?: any;
}

const StatCard = ({ title, value, icon, color, onClick } : StatCardProps) => (
  <div 
    className={`${color} text-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-4xl font-bold">{value}</p>
      </div>
      <div className="text-4xl opacity-80">{icon}</div>
    </div>
  </div>
);

export default StatCard;
