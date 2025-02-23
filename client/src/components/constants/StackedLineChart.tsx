/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
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
import { Line } from "react-chartjs-2";

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StackedLineChartProps {
  labels: any[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

const StackedLineChart: React.FC<StackedLineChartProps> = ({ labels, datasets }) => {
  const data = {
    labels,
    datasets: datasets?.map((dataset) => ({
      ...dataset,
      fill: true, // Enable stacked effect
      tension: 0.4, // Smooth curve effect
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow it to resize freely
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Stacked Line Chart",
      },
    },
    scales: {
      x: {
        stacked: true, // Enable stacking on x-axis
      },
      y: {
        stacked: true, // Enable stacking on y-axis
      },
    },
  };

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-96">
      <Line data={data} options={options} />
    </div>
  );
};

export default StackedLineChart;
