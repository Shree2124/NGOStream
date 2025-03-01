import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ feedbackAnalysis }) => {
  // Calculate totals across all weeks
  const totals = {
    positive: 0,
    negative: 0,
    neutral: 0,
    suggestion: 0,
  };

  console.log("feedbackAnalysis received:", feedbackAnalysis);

  // Process feedback data from the aggregated analysis
  if (feedbackAnalysis && Object.keys(feedbackAnalysis).length > 0) {
    if (feedbackAnalysis.datasets) {
      // Handle formatted chart data
      const positiveData = feedbackAnalysis.datasets.find(
        (dataset) => dataset.label === "Positive"
      );
      const negativeData = feedbackAnalysis.datasets.find(
        (dataset) => dataset.label === "Negative"
      );
      const neutralData = feedbackAnalysis.datasets.find(
        (dataset) => dataset.label === "Neutral"
      );
      const suggestionData = feedbackAnalysis.datasets.find(
        (dataset) => dataset.label === "Suggestions"
      );

      if (positiveData && positiveData.data) {
        totals.positive = positiveData.data.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
      }
      if (negativeData && negativeData.data) {
        totals.negative = negativeData.data.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
      }
      if (neutralData && neutralData.data) {
        totals.neutral = neutralData.data.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
      }
      if (suggestionData && suggestionData.data) {
        totals.suggestion = suggestionData.data.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
      }
    } else {
      // Handle raw data format
      Object.values(feedbackAnalysis).forEach((weekData) => {
        if (weekData) {
          totals.positive += weekData.positive || 0;
          totals.negative += weekData.negative || 0;
          totals.neutral += weekData.neutral || 0;
          totals.suggestion += weekData.suggestion || weekData.suggestions || 0;
        }
      });
    }
  }

  // Check if all totals are zero
  const hasData = Object.values(totals).some((value) => value > 0);

  // If there's no data, return a message instead of a chart

  const data = {
    labels: ["Positive", "Negative", "Neutral", "Suggestions"],
    datasets: [
      {
        data: [
          totals.positive,
          totals.negative,
          totals.neutral,
          totals.suggestion,
        ],
        backgroundColor: [
          "#36A2EB", // Blue for positive
          "#FF6384", // Pink/red for negative
          "#FFCE56", // Yellow for neutral
          "#4BC0C0", // Teal for suggestions
        ],
        borderColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // This will allow the chart to fill its container
    cutout: "60%", // Slightly smaller donut hole for better visibility
    plugins: {
      legend: {
        position: "bottom", // Move legend to bottom for better layout
        align: "center",
        labels: {
          padding: 20,
          boxWidth: 15,
          font: {
            size: 14, // Larger font for better readability
          },
        },
      },
      title: {
        display: true,
        text: "Feedback Distribution",
        font: {
          size: 18,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full mx-auto">
      {/* Increase height for better visibility */}
      <div className="w-full h-80">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default PieChart;
