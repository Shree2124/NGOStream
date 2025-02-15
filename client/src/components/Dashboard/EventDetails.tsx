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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const EventDetails: React.FC = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  useEffect(() => {
    const getEventDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/event/${eventId}`);
        setEvent(res.data.data);

        setEventName(res.data.data.name);
        setEventLocation(res.data.data.location);
        setEventDate(res.data.data.startDate);
        setEventDescription(res.data.data.description);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error:any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getEventDetails();
  }, [eventId]);

  const handleUpdateEvent = async () => {
    try {
      const updatedEvent = {
        name: eventName,
        location: eventLocation,
        startDate: eventDate,
        description: eventDescription,
      };

      await api.put(`/admin/event/${eventId}`, updatedEvent);
      setShowEditModal(false);
      // setEvent({ ...event, ...updatedEvent }); // Update state locally
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  if (loading) return <p className="text-lg text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;
  if (!event) return <p className="text-center">Event not found.</p>;

  const kpiData = {
    labels: ["Attendance", "Funds Raised"],
    datasets: [
      {
        label: "Event KPIs",
        data: [event?.attendees, event?.donations || 0],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="space-y-6 bg-white shadow-lg mx-auto mt-6 p-6 rounded-2xl max-w-4xl">
      {/* Event Header */}
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
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-md px-4 py-2 rounded-lg text-white transition"
            >
              <Edit />
            </button>
          )}
        </div>
      </motion.div>

      {/* Event Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-700 leading-relaxed"
      >
        {event?.description}
      </motion.p>

      {/* KPIs Chart */}
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

      {/* Participants */}
      <div>
        <h2 className="mb-2 font-semibold text-lg">Participants</h2>
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="mb-1 font-medium text-gray-600">Attendees</h3>
            <ul className="bg-gray-50 rounded-lg divide-y">
              {event?.attendees?.map((p: any, index) => (
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
              {event?.eventStaff?.map((p, index) => (
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

      {/* Feedback Section */}
      {/* Feedback Section */}
      {event.feedback &&
      event.feedback.length > 0 &&
      event.feedback.some((fb) => Object.keys(fb).length > 0) ? (
        <div>
          <h2 className="mb-2 font-semibold text-lg">Feedback</h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {event?.feedback?.map(
              (fb: any, index) =>
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

      {showEditModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white shadow-lg p-6 rounded-lg w-96">
            <h2 className="mb-4 font-semibold text-xl">Edit Event</h2>
            <label className="block font-medium text-gray-700 text-sm">
              Event Name
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="mb-3 p-2 border rounded-md w-full"
            />

            <label className="block font-medium text-gray-700 text-sm">
              Location
            </label>
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="mb-3 p-2 border rounded-md w-full"
            />

            <label className="block font-medium text-gray-700 text-sm">
              Date
            </label>
            <input
              type="date"
              value={eventDate.split("T")[0]}
              onChange={(e) => setEventDate(e.target.value)}
              className="mb-3 p-2 border rounded-md w-full"
            />

            <label className="block font-medium text-gray-700 text-sm">
              Description
            </label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="mb-3 p-2 border rounded-md w-full"
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-400 px-4 py-2 rounded-md text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEvent}
                className="bg-blue-600 px-4 py-2 rounded-md text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
