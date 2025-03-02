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
import { Edit, Download, Assessment } from "@mui/icons-material";
import StackedLineChart from "../constants/StackedLineChart";
import EditEventModal from "../constants/EditEventModal";
import PieChart from "../constants/PieChart";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const EventDetails: React.FC = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<IEvent | any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [feedbackChartData, setFeedbackChartData] = useState({});

  const getEventDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/event/${eventId}`);
      setEvent(res.data.data);
      setFeedbackChartData(res.data.data?.feedbackAnalysis);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEventDetails();
  }, [eventId]);

  const handleReportGeneration = async () => {
    try {
      const res = await api.get(`/event/${eventId}/report`);
      setEvent(res.data.data);
      getEventDetails();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mx-auto max-w-4xl mt-8">
        <p className="text-red-600 font-medium text-center">Error: {error}</p>
      </div>
    );

  if (!event)
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mx-auto max-w-4xl mt-8">
        <p className="text-gray-600 font-medium text-center">
          Event not found.
        </p>
      </div>
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-600";
      case "Happening":
        return "bg-green-100 text-green-600";
      case "Completed":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex justify-between items-end">
              <div>
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white"
                >
                  {event?.name}
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white text-opacity-90"
                >
                  {event?.location} |{" "}
                  {new Date(event?.startDate).toLocaleDateString()}
                </motion.p>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    event.status
                  )}`}
                >
                  {event?.status}
                </span>
                {event.status === "Upcoming" && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 text-blue-600 p-2 rounded-full transition shadow-md"
                    aria-label="Edit event"
                  >
                    <Edit />
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              About this event
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {event?.description}
            </p>
          </motion.div>

          {/* Participants Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Participants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-600 p-1 rounded-md mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  Attendees ({event?.attendees?.length || 0})
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {event?.attendees?.length > 0 ? (
                      event.attendees.map((p: any, index: number) => (
                        <li key={index} className="py-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-800">
                              {p.fullName}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {p.email}
                            </span>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="py-2 text-gray-500 text-center">
                        No attendees yet
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <span className="bg-green-100 text-green-600 p-1 rounded-md mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </span>
                  Event Team ({event?.eventStaff?.length || 0})
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {event?.eventStaff?.length > 0 ? (
                      event.eventStaff.map((p: any, index: any) => (
                        <li key={index} className="py-2">
                          <div>
                            <div className="font-medium text-gray-800">
                              {p.fullName}
                            </div>
                            <div className="text-gray-500 text-sm flex items-center justify-between">
                              <span>{p.ngoRole}</span>
                              <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                                {p.eventRole}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="py-2 text-gray-500 text-center">
                        No event team assigned
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feedback Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Feedback Overview
            </h2>
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              {feedbackChartData !== {} ? (
                <div className="w-full max-w-3xl mx-auto h-64">
                  <PieChart feedbackAnalysis={feedbackChartData} />
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No feedback data available
                </p>
              )}
            </div>
          </motion.div>

          {/* Feedback Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Feedback Comments
            </h2>
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              {event?.feedback &&
              event?.feedback?.length > 0 &&
              event?.feedback?.some((fb: any) => Object.keys(fb).length > 0) ? (
                <div className="space-y-4">
                  {event?.feedback
                    ?.filter((fb: any) => Object.keys(fb).length > 0)
                    .map((fb: any, index: any) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                      >
                        <div className="flex items-start">
                          <div className="mr-3 bg-blue-50 p-2 rounded-full text-blue-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 mb-2">
                              "{fb?.feedbackText}"
                            </p>
                            <div className="flex justify-between text-sm">
                              <div className="text-yellow-500">
                                {Array(5)
                                  .fill(0)
                                  .map((_, i) => (
                                    <span key={i}>
                                      {i < fb?.rating ? "★" : "☆"}
                                    </span>
                                  ))}
                              </div>
                              <span className="text-gray-500">
                                {new Date(fb.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No feedback comments available
                </p>
              )}
            </div>
          </motion.div>

          {/* Report Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white">
                  <h3 className="text-xl font-semibold mb-2">Event Report</h3>
                  <p className="text-gray-300 max-w-md">
                    {event?.eventReport
                      ? "Download the generated report or create a new one"
                      : "Generate a comprehensive report for this event"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleReportGeneration}
                    className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition shadow"
                  >
                    <Assessment className="h-5 w-5" />
                    {event?.eventReport
                      ? "Generate New Report"
                      : "Generate Report"}
                  </button>

                  {event?.eventReport && (
                    <a
                      href={`${event.eventReport}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow"
                    >
                      <Download className="h-5 w-5" />
                      Download Report
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {isModalOpen && (
        <EditEventModal onClose={() => setModalOpen(false)} event={event} />
      )}
    </div>
  );
};

export default EventDetails;
