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
  monthly_totals: MonthlyTotals[];
  average: number;
  predicted: number;
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
          "http://127.0.0.1:8000/api/fundraising-metrics"
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
      ? fundraisingMetrics.monthly_totals?.map((item: MonthlyTotals) => `Month ${item.month}`)
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
    <div className="sm:p-0 lg:p-6">
      <h1 className="mb-6 font-bold text-3xl">Admin Dashboard</h1>
      <h2 className="mb-4 text-xl">
        Welcome, <span className="text-blue-600">{user?.username}</span>!
      </h2>

      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="mb-4 font-semibold text-gray-800 text-2xl">
          Fundraising Insights
        </h2>
        {/* <p className="mb-6 text-gray-600">
          Utilize machine learning to predict donation trends and optimize
          campaigns for better fundraising outcomes.
        </p> */}

        {loading ? (
          <div className="flex justify-center items-center">
            <CircularProgress /> 
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
             <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 text-lg">
                  Average Monthly Donations
                </h3>
                <p className="font-bold text-blue-600 text-2xl">
                  ${fundraisingMetrics?.average?.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 text-lg">
                  Predicted Next Month Donations
                </h3>
                <p className="font-bold text-green-600 text-2xl">
                  ${fundraisingMetrics?.predicted?.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="mb-4 font-medium text-gray-700 text-lg">
                Donation Trends
              </h3>
              <Line data={chartData} options={chartOptions} />
            </div>
          </>
        )}
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="text-gray-500 text-sm">Total Donations This Year</h3>
          <p className="font-bold text-blue-600 text-2xl">
            ${adminMetrics?.data?.totalDonations.toFixed(2)}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="text-gray-500 text-sm">Active Campaigns</h3>
          <p className="font-bold text-green-600 text-2xl">
            {adminMetrics?.data?.activeCampaigns}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="text-gray-500 text-sm">Number of Donors</h3>
          <p className="font-bold text-purple-600 text-2xl">
            {adminMetrics?.data?.totalDonors}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="text-gray-500 text-sm">Top Donor</h3>
          <p className="font-bold text-yellow-600 text-lg">
            {adminMetrics?.data?.topDonor.name} - $
            {adminMetrics?.data?.topDonor.amount}
          </p>
        </div>
      </div>

      {/* <div className="bg-white shadow-md mb-6 p-6 rounded-lg">
        <h2 className="mb-4 font-semibold text-2xl">Campaign Performance</h2>
        <table className="w-full text-left border-collapse">
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
                <div className="bg-gray-200 rounded-full w-full h-2.5">
                  <div
                    className="bg-blue-500 rounded-full h-2.5"
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
