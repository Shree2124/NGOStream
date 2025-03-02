import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
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
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  Stack,
  useTheme,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  Campaign,
  People,
  Person,
  MonetizationOn,
  ShowChart,
} from "@mui/icons-material";

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
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.user);
  const [fundraisingMetrics, setFundraisingMetrics] =
    useState<FundraisingMetricsData | null>(null);
  const [adminMetrics, setAdminMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFundraisingMetrics = async () => {
      try {
        const response = await axios.get<FundraisingMetricsData>(
          "http://localhost:5000/api/fundraising-metrics"
        );
        setFundraisingMetrics(response.data);
      } catch (err) {
        setError("Error: Unable to fetch fundraising metrics.");
        console.error("Fundraising metrics error:", err);
      }
    };

    const fetchAdminMetrics = async () => {
      try {
        const response = await api.get("/admin/metrics");
        setAdminMetrics(response.data);
      } catch (err) {
        setError("Error: Unable to fetch admin metrics.");
        console.error("Admin metrics error:", err);
      }
    };

    // Fetch data concurrently
    Promise.all([fetchFundraisingMetrics(), fetchAdminMetrics()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const chartData = {
    labels: fundraisingMetrics
      ? fundraisingMetrics.monthly_totals?.map((item: MonthlyTotals) => {
          // Convert the month number to a month name and add year
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const monthIndex = (item.month - 1) % 12; // Convert 1-12 to 0-11 index
          const monthName = monthNames[monthIndex];

          // Assuming item.month might include year information or you have a separate year field
          // If item.month is just 1-12, you'll need to determine the year another way
          const year = new Date().getFullYear(); // Current year as fallback

          return `${monthName} ${year}`;
        })
      : [],
    datasets: [
      {
        label: "Total Donations",
        data: fundraisingMetrics
          ? fundraisingMetrics.monthly_totals.map(
              (item: MonthlyTotals) => item.amount
            )
          : [],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + "40", // 40 = 25% opacity
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.background.paper,
        pointBorderColor: theme.palette.primary.main,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Donation Trends Over Time",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.grey[900],
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Donations ($)",
        },
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          callback: function (value: any) {
            return "$" + value;
          },
        },
      },
    },
  };

  const MetricCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        "&:hover": {
          transform: "translateY(-4px)",
          transition: "transform 0.3s ease",
          boxShadow: "0 12px 20px rgba(71, 117, 234, 0.12)",
        },
        transition: "box-shadow 0.3s ease",
        backdropFilter: "blur(10px)",
        boxShadow: "0 6px 16px rgba(71, 117, 234, 0.08)",
        border: "1px solid rgba(229, 231, 235, 0.5)",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{ bgcolor: color + ".light", color: color + ".main", mr: 2 }}
          >
            {icon}
          </Avatar>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: "bold", color: `${color}.main` }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(90deg, #1976d2, #2196f3)",
          color: "white",
          borderRadius: 2,
          transition: "box-shadow 0.3s ease",
          backdropFilter: "blur(10px)",
          boxShadow: "0 6px 16px rgba(71, 117, 234, 0.08)",
          border: "1px solid rgba(229, 231, 235, 0.5)",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="h6">
          Welcome, {user?.username || "Admin"}!
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Main metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Donations"
                value={`$${
                  adminMetrics?.data?.totalDonations?.toFixed(2) || "0.00"
                }`}
                icon={<MonetizationOn />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Active Campaigns"
                value={adminMetrics?.data?.activeCampaigns?.toString() || "0"}
                icon={<Campaign />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Donors"
                value={adminMetrics?.data?.totalDonors?.toString() || "0"}
                icon={<People />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    transition: "transform 0.3s ease",
                    boxShadow: "0 12px 20px rgba(71, 117, 234, 0.12)",
                  },
                  transition: "box-shadow 0.3s ease",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 6px 16px rgba(71, 117, 234, 0.08)",
                  border: "1px solid rgba(229, 231, 235, 0.5)",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: "warning.light",
                        color: "warning.main",
                        mr: 2,
                      }}
                    >
                      <Person />
                    </Avatar>
                    <Typography variant="subtitle2" color="text.secondary">
                      Top Donor
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    component="div"
                    fontWeight="bold"
                    sx={{ color: "warning.main" }}
                  >
                    {adminMetrics?.data?.topDonor?.name || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    $
                    {adminMetrics?.data?.topDonor?.amount?.toFixed(2) || "0.00"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Fundraising insights */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 2,

              transition: "box-shadow 0.3s ease",
              backdropFilter: "blur(10px)",
              boxShadow: "0 6px 16px rgba(71, 117, 234, 0.08)",
              border: "1px solid rgba(229, 231, 235, 0.5)",
            }}
          >
            <CardHeader
              title="Fundraising Insights"
              subheader="AI-powered predictions to optimize your fundraising strategy"
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6} sx={{}}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "primary.light",
                      borderRadius: 2,
                      position: "relative",
                      overflow: "hidden",
                      transition: "box-shadow 0.3s ease",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 6px 16px rgba(71, 117, 234, 0.08)",
                      border: "1px solid rgba(229, 231, 235, 0.5)",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "4px",
                        background: "linear-gradient(135deg, #2193b0, #6dd5ed)",
                      }}
                    />
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ mb: 1 }}
                    >
                      <ShowChart color="primary" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Average Monthly Donations
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="primary.dark"
                    >
                      ${fundraisingMetrics?.average?.toFixed(2) || "0.00"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "success.light",
                      borderRadius: 2,
                      position: "relative",
                      overflow: "hidden",
                      transition: "box-shadow 0.3s ease",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 6px 16px rgba(71, 117, 234, 0.08)",
                      border: "1px solid rgba(229, 231, 235, 0.5)",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "4px",
                        background: "linear-gradient(135deg, #56ab2f, #a8e169)",
                      }}
                    />
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ mb: 1 }}
                    >
                      <TrendingUp color="success" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Predicted Next Month Donations
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="success.dark"
                    >
                      ${fundraisingMetrics?.predicted?.toFixed(2) || "0.00"}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ height: 400, mt: 4 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  sx={{ mb: 2 }}
                >
                  Donation Trends
                </Typography>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default DashboardHome;
