/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IEvent } from "../../types/event.types";
import { api } from "../../api/api";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Edit } from "@mui/icons-material";
import StackedLineChart from "../constants/StackedLineChart";
import EditEventModal from "../constants/EditEventModal";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const EventDetails: React.FC = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<IEvent | any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState(false);

  const feedbackAnalysis = event?.feedbackAnalysis ?? {};
  const feedbackLabels = Object.keys(feedbackAnalysis);

  const positiveData = feedbackLabels.map((date) => feedbackAnalysis[date]?.positive || 0);
  const negativeData = feedbackLabels.map((date) => feedbackAnalysis[date]?.negative || 0);
  const neutralData = feedbackLabels.map((date) => feedbackAnalysis[date]?.neutral || 0);
  const suggestionsData = feedbackLabels.map((date) => feedbackAnalysis[date]?.suggestions || 0);

  console.log(isModalOpen);

  // useEffect(() => {
  //   const fetchEvent = async () => {
  //     let event1;
  //     try {
  //       event1 = await api.get(`/event/get-event-by-id/${eventId}`);
  //       console.log("fetch event",event1.data.data);
  //     } catch (e:any) {
  //       console.log(e.message);
  //     }
  //   };
  //   fetchEvent();
  // }, [event]);

  // const labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
  // const datasets = [
  //   {
  //     label: "Positive Feedback",
  //     data: [50, 75, 90, 120, 150],
  //     borderColor: "rgb(75, 192, 192)",
  //     backgroundColor: "rgba(75, 192, 192, 0.2)",
  //   },
  //   {
  //     label: "Negative Feedback",
  //     data: [20, 35, 50, 70, 85],
  //     borderColor: "rgb(255, 99, 132)",
  //     backgroundColor: "rgba(255, 99, 132, 0.2)",
  //   },
  // ];

  const getEventDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/event/${eventId}`);
      setEvent(res.data.data);
      console.log("details ", event);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEventDetails();
  }, [eventId]);

  const feedbackChartData = {
    labels: feedbackLabels,
    datasets: [
      {
        label: "Positive Feedback",
        data: positiveData,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Negative Feedback",
        data: negativeData,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Neutral Feedback",
        data: neutralData,
        borderColor: "rgb(255, 206, 86)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Suggestions",
        data: suggestionsData,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // const handleDownload = () => {
  //   const link = document.createElement("a");
  //   link.href = event?.eventReport;
  //   link.download = `event-${event.name}-${
  //     event._id
  //   }-${new Date().toLocaleString()}`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const handleReportGeneration = async () => {
    const res = await api.get(`/event/${eventId}/report`);
    console.log(res.data.data);
    setEvent(res.data.data);
    getEventDetails();
  };

  if (loading) return <p className="text-lg text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;
  if (!event) return <p className="text-center">Event not found.</p>;

  const kpiData = {
    labels: ["Attendance"],
    datasets: [
      {
        label: "Event KPIs",
        data: [event?.attendees],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="space-y-6 bg-white shadow-lg mx-auto mt-6 p-6 rounded-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center pb-4 border-b"
      >
        <div>
          <h1 className="font-bold text-gray-900 text-2xl">{event?.name}</h1>
          <p className="text-gray-500">
            {event?.location} |{" "}
            {new Date(event?.startDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              event.status === "Upcoming"
                ? "bg-blue-100 text-blue-600"
                : event.status === "Happening"
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {event?.status}
          </span>

          {event.status === "Upcoming" && (
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-md px-4 py-2 rounded-lg text-white transition"
            >
              <Edit />
            </button>
          )}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-700 leading-relaxed"
      >
        {event?.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-100 p-4 rounded-lg"
      >
        <h2 className="mb-3 font-semibold text-lg">Event KPIs</h2>
        <Bar
          data={kpiData}
          options={{
            responsive: true,
            plugins: { title: { display: true, text: "Event Performance" } },
          }}
        />
      </motion.div>

      <div>
        <h2 className="mb-2 font-semibold text-lg">Participants</h2>
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="mb-1 font-medium text-gray-600">Attendees</h3>
            <ul className="bg-gray-50 rounded-lg divide-y">
              {event?.attendees?.map((p: any, index: number) => (
                <li
                  key={index}
                  className="flex justify-between p-3 text-gray-700"
                >
                  {p.fullName}{" "}
                  <span className="text-gray-500 text-sm">{p.email}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-gray-600">Event Team</h3>
            <ul className="bg-gray-50 rounded-lg divide-y">
              {event?.eventStaff?.map((p: any, index: any) => (
                <li
                  key={index}
                  className="flex justify-between p-3 text-gray-700"
                >
                  {p.fullName}{" "}
                  <span className="text-gray-500 text-sm">
                    {p.ngoRole} | {p.eventRole}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto p-4 w-full max-w-4xl">
        <h2 className="mb-4 font-bold text-xl text-center">
          Weekly Feedback Overview
        </h2>
        <div className="relative w-full h-auto">
          <StackedLineChart datasets={feedbackChartData.datasets} labels={feedbackChartData.labels} />
        </div>
      </div>

      {event?.feedback &&
      event?.feedback?.length > 0 &&
      event?.feedback?.some((fb: any) => Object.keys(fb).length > 0) ? (
        <div>
          <h2 className="mb-2 font-semibold text-lg">Feedback</h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {event?.feedback?.map(
              (fb: any, index: any) =>
                Object.keys(fb).length > 0 && (
                  <div
                    key={index}
                    className="bg-gray-50 shadow-sm p-3 rounded-lg"
                  >
                    <p className="text-gray-700">"{fb?.feedbackText}"</p>
                    <p className="text-gray-500 text-sm">
                      ⭐ {fb?.rating}/5 -{" "}
                      {new Date(fb.date).toLocaleDateString()}
                    </p>
                  </div>
                )
            )}
          </motion.div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No feedbacks available.</p>
      )}

      <div className="mx-auto p-4 w-full max-w-4xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center bg-gray-800 shadow-lg mt-6 p-6 rounded-lg text-white">
              <div></div>
              <div className="flex space-x-2">
                <div>
                  <button onClick={handleReportGeneration}>
                    {event?.eventReport ? (
                      <p>Generate New Report</p>
                    ) : (
                      <p>Generate Report</p>
                    )}
                  </button>
                </div>
                {event?.eventReport && (
                  <button>
                    <a href={`${event.eventReport}`} download target="_blank">
                      Download Receipt
                    </a>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EditEventModal onClose={() => setModalOpen(false)} event={event} />
      )}
    </div>
  );
};

export default EventDetails;
