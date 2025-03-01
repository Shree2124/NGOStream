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
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  useTheme,
  CardHeader,
  Chip,
  Stack,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShowChartIcon from "@mui/icons-material/ShowChart";

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
  const theme = useTheme();
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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const {
    averageMonthlyDonations,
    predictedNextMonthDonations,
    monthlyTotals,
  } = metrics!;

  const percentChange =
    monthlyTotals.length > 1
      ? (
          ((predictedNextMonthDonations -
            monthlyTotals[monthlyTotals.length - 1].amount) /
            monthlyTotals[monthlyTotals.length - 1].amount) *
          100
        ).toFixed(1)
      : "0.0";

  const isPositiveChange = parseFloat(percentChange) >= 0;

  const chartData = {
    labels: monthlyTotals.map((item) => item.month),
    datasets: [
      {
        label: "Total Donations",
        data: monthlyTotals.map((item) => item.amount),
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: "#fff",
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
        labels: {
          font: {
            size: 14,
            family: theme.typography.fontFamily,
          },
          boxWidth: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff",
        titleColor: theme.palette.mode === "dark" ? "#fff" : "#333",
        bodyColor: theme.palette.mode === "dark" ? "#fff" : "#333",
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          family: theme.typography.fontFamily,
        },
        bodyFont: {
          size: 13,
          family: theme.typography.fontFamily,
        },
        callbacks: {
          label: function (context: any) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
        displayColors: false,
        boxPadding: 3,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: theme.typography.fontFamily,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "$" + value.toLocaleString();
          },
          font: {
            family: theme.typography.fontFamily,
          },
        },
        grid: {
          borderDash: [3, 3],
          color: theme.palette.divider,
        },
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Fundraising Metrics
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                borderRadius: 2,
                backgroundColor: theme.palette.primary.light + "10",
                border: `1px solid ${theme.palette.primary.light}30`,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <AttachMoneyIcon
                    sx={{ color: theme.palette.primary.main, mr: 1 }}
                  />
                  <Typography
                    variant="h6"
                    component="h2"
                    color="text.secondary"
                  >
                    Average Monthly Donations
                  </Typography>
                </Box>
                <Typography
                  variant="h3"
                  component="p"
                  sx={{
                    fontWeight: "medium",
                    color: theme.palette.primary.main,
                  }}
                >
                  $
                  {averageMonthlyDonations.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Based on historical donation data
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                borderRadius: 2,
                backgroundColor: isPositiveChange
                  ? theme.palette.success.light + "10"
                  : theme.palette.error.light + "10",
                border: `1px solid ${
                  isPositiveChange
                    ? theme.palette.success.light + "30"
                    : theme.palette.error.light + "30"
                }`,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <ShowChartIcon
                    sx={{
                      color: isPositiveChange
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="h6"
                    component="h2"
                    color="text.secondary"
                  >
                    Predicted Next Month
                  </Typography>
                </Box>

                <Typography
                  variant="h3"
                  component="p"
                  sx={{
                    fontWeight: "medium",
                    color: isPositiveChange
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  }}
                >
                  $
                  {predictedNextMonthDonations.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Chip
                    icon={
                      isPositiveChange ? (
                        <TrendingUpIcon fontSize="small" />
                      ) : (
                        <TrendingDownIcon fontSize="small" />
                      )
                    }
                    label={`${percentChange}%`}
                    size="small"
                    color={isPositiveChange ? "success" : "error"}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    from last month
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={3} sx={{ borderRadius: 2, mb: 10 }}>
          <CardHeader
            title="Monthly Donation Trends"
            titleTypographyProps={{ variant: "h6" }}
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent>
            <Box sx={{ height: 400, position: "relative" }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default FundraisingMetrics;
