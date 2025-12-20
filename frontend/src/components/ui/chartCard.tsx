import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartCardProps {
  title: string;
  labels: string[];
  data: number[];
  color: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, labels, data, color }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: color + "55",
        tension: 0.4,
        pointBackgroundColor: color,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title, color: "#006400", font: { size: 16 } },
    },
    scales: {
      y: { ticks: { color: "#006400" } },
      x: { ticks: { color: "#006400" } },
    },
  };

  return (
    <div className="p-6 shadow-lg bg-green-50 rounded-xl">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ChartCard;
