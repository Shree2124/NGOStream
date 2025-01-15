import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import "./predicted.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define the type for API response
interface FundraisingMetricsData {
  averageMonthlyDonations: number;
  predictedNextMonthDonations: number;
  monthlyTotals: { month: string; amount: number }[]; // Monthly totals for the chart
}

const FundraisingMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<FundraisingMetricsData | null>(null); // State to hold API response
  const [loading, setLoading] = useState<boolean>(true); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error handling

  useEffect(() => {
    // Fetch data from API using Axios
    const fetchMetrics = async () => {
      try {
        const response = await axios.get<FundraisingMetricsData>(
          "http://127.0.0.1:5000/api/fundraising-metrics"
        );
        setMetrics(response.data); // Set the API response data
        setLoading(false); // Update loading status
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

  // Render Loading or Error state
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Destructure metrics for convenience
  const { averageMonthlyDonations, predictedNextMonthDonations, monthlyTotals } = metrics!;

  // Prepare data for the chart
  const chartData = {
    labels: monthlyTotals.map((item) => item.month), // X-axis: months
    datasets: [
      {
        label: "Total Donations",
        data: monthlyTotals.map((item) => item.amount), // Y-axis: donation amounts
        borderColor: "blue",
        fill: false,
        tension: 0.1
      }
    ]
  };

  // Chart options
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
        {/* Display the Line chart */}
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default FundraisingMetrics;
