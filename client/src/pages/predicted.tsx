import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FundraisingMetricsData {
  averageMonthlyDonations: number;
  predictedNextMonthDonations: number;
  monthlyTotals: { month: string; amount: number }[]; 
}

const FundraisingMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<FundraisingMetricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get<FundraisingMetricsData>(
          "http://127.0.0.1:5000/api/fundraising-metrics"
        );
        setMetrics(response.data);
        setLoading(false);
      } catch (err) {
        setError(
          axios.isAxiosError(err) && err.response
            ? `Error: ${err.response.status} - ${err.response.statusText}`
            : "Error: Unable to fetch data"
        );
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const { averageMonthlyDonations, predictedNextMonthDonations, monthlyTotals } = metrics!;

  const chartData = {
    labels: monthlyTotals.map((item) => item.month),
    datasets: [
      {
        label: "Total Donations",
        data: monthlyTotals.map((item) => item.amount),
        borderColor: "blue",
        fill: false,
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Donation Trends Over Time',
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Donations',
        },
        beginAtZero: true,
      }
    }
  };

  return (
    <div>
      <h1>Fundraising Metrics</h1>

      <div>
        <h2>Average Monthly Donations</h2>
        <p>${averageMonthlyDonations.toFixed(2)}</p>
      </div>

      <div>
        <h2>Predicted Next Month Donations</h2>
        <p>${predictedNextMonthDonations.toFixed(2)}</p>
      </div>

      <div>
        <h2>Donation Trends</h2>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default FundraisingMetrics;
