import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { api } from "../../api/api";
import { CircularProgress } from "@mui/material";

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
  totalDonations: number;
  totalDonors: number;
  activeCampaigns: number;
  topDonor: {
    name: string;
    amount: number;
  };
  averageMonthlyDonations: number;
  predictedNextMonthDonations: number;
}

interface MonthlyTotals {
  month: number;
  amount: number;
}

const DashboardHome: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [fundraisingMetrics, setFundraisingMetrics] = useState<FundraisingMetricsData | null>(null);
  const [adminMetrics, setAdminMetrics] = useState<any | null>(null); // Adjust type as needed
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFundraisingMetrics = async () => {
      try {
        const response = await axios.get<FundraisingMetricsData>(
          "http://127.0.0.1:5000/api/fundraising-metrics"
        );
        setFundraisingMetrics(response.data);
      } catch (err) {
        setError("Error: Unable to fetch fundraising metrics.");
      }
    };

    const fetchAdminMetrics = async () => {
      try {
        const response = await api.get("/admin/metrics");
        setAdminMetrics(response.data);
      } catch (err) {
        setError("Error: Unable to fetch admin metrics.");
      }
    };

    // Fetch data concurrently
    Promise.all([fetchFundraisingMetrics(), fetchAdminMetrics()])
      .finally(() => setLoading(false)); // Stop loading when both are done
  }, []);

  const chartData = {
    labels: fundraisingMetrics
      ? fundraisingMetrics.monthly_totals.map((item: MonthlyTotals) => `Month ${item.month}`)
      : [],
    datasets: [
      {
        label: "Total Donations",
        data: fundraisingMetrics
          ? fundraisingMetrics.monthly_totals.map((item: MonthlyTotals) => item.amount)
          : [],
        borderColor: "#3b82f6",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Donation Trends Over Time",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Donations",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="lg:p-6 sm:p-0">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <h2 className="text-xl mb-4">
        Welcome, <span className="text-blue-600">{user?.username}</span>!
      </h2>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Fundraising Insights
        </h2>
        <p className="text-gray-600 mb-6">
          Utilize machine learning to predict donation trends and optimize
          campaigns for better fundraising outcomes.
        </p>

        {loading ? (
          <div className="flex justify-center items-center">
            <CircularProgress /> 
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">
                  Average Monthly Donations
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  ${fundraisingMetrics?.average?.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">
                  Predicted Next Month Donations
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  ${fundraisingMetrics?.predicted?.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Donation Trends
              </h3>
              <Line data={chartData} options={chartOptions} />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="text-sm text-gray-500">Total Donations This Year</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${adminMetrics?.data?.totalDonations.toFixed(2)}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="text-sm text-gray-500">Active Campaigns</h3>
          <p className="text-2xl font-bold text-green-600">
            {adminMetrics?.data?.activeCampaigns}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="text-sm text-gray-500">Number of Donors</h3>
          <p className="text-2xl font-bold text-purple-600">
            {adminMetrics?.data?.totalDonors}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="text-sm text-gray-500">Top Donor</h3>
          <p className="text-lg font-bold text-yellow-600">
            {adminMetrics?.data?.topDonor.name} - $
            {adminMetrics?.data?.topDonor.amount}
          </p>
        </div>
      </div>

      {/* <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Campaign Performance</h2>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Campaign Name</th>
              <th className="py-2">Target Amount</th>
              <th className="py-2">Raised Amount</th>
              <th className="py-2">Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Healthcare Aid</td>
              <td className="py-2">$50,000</td>
              <td className="py-2">$40,000</td>
              <td className="py-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: "80%" }}
                  ></div>
                </div>
              </td>
            </tr>
            
          </tbody>
        </table>
      </div>      */}
    </div>
  );
};

export default DashboardHome;
