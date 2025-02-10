import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  // Card,
  CardContent,
  CircularProgress,
  Container,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Fade,
  Backdrop,
  SelectChangeEvent,
} from "@mui/material";
import { motion } from "framer-motion";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

interface Event {
  _id: string;
  name: string;
  endDate: string;
  startDate: string;
  location: string;
  description: string;
  status: string;
  attendees?: number;
  organizer?: string;
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await api.get("/event/");
        setEvents(res.data.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilter(event.target.value as string);
  };

  const handleRegister = (eventId: string) => {
    console.log(eventId);
    navigate(`/events/${eventId}`);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const filteredEvents =
    filter === "All"
      ? events
      : events.filter((event) => event.status === filter);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" textAlign="center" mt={4} gutterBottom>
        Events
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <FormControl variant="outlined" sx={{ width: "200px" }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filter}
            onChange={handleFilterChange}
            label="Filter by Status"
            fullWidth
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Upcoming">Upcoming</MenuItem>
            <MenuItem value="Happening">Happening</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredEvents.length === 0 ? (
        <Typography variant="body1" textAlign="center" color="text.secondary">
          No events available for the selected filter.
        </Typography>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
          gap={3}
          mt={4}
          sx={{
            padding: 2,
            borderRadius: 3,
            backgroundColor: "#f7f7f7",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          {filteredEvents.map((event: Event) => (
            <motion.div
              key={event._id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
              style={{
                padding: 2,
                borderRadius: 3,
                backgroundColor: "#fff",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontSize: 18, fontWeight: 600 }}
                >
                  {event.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 14 }}
                >
                  <strong>Start Date:</strong>{" "}
                  {new Date(event.startDate).toLocaleDateString()}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 14 }}
                >
                  <strong>End Date:</strong>{" "}
                  {new Date(event.endDate).toLocaleDateString()}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 14 }}
                >
                  <strong>Location:</strong> {event.location}
                </Typography>
                <Typography variant="body2" mt={2} sx={{ fontSize: 14 }}>
                  <strong>Description:</strong> {event.description}
                </Typography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                  sx={{
                    padding: 2,
                    backgroundColor: "#f7f7f7",
                    borderRadius: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ marginRight: 1 }}
                    onClick={() => handleViewDetails(event)}
                  >
                    View Details
                  </Button>
                  {event.status === "Upcoming" && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ marginRight: 1 }}
                    onClick={() => handleRegister(event._id)}
                  >
                    Register
                  </Button>
                  )}
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ backgroundColor: "#4CAF50", color: "#fff" }}
                    onClick={() => navigate(`/feedback/${event._id}`)}
                  >
                    Give Feedback
                  </Button>
                </Box>
              </CardContent>
            </motion.div>
          ))}
        </Box>
      )}

      {/* Modal for viewing details */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            {selectedEvent && (
              <>
                <Typography variant="h5" gutterBottom>
                  {selectedEvent.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Start Date:</strong>{" "}
                  {new Date(selectedEvent.startDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>End Date:</strong>{" "}
                  {new Date(selectedEvent.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Location:</strong> {selectedEvent.location}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Status:</strong> {selectedEvent.status}
                </Typography>
                {selectedEvent.organizer && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Organizer:</strong> {selectedEvent.organizer}
                  </Typography>
                )}
                {selectedEvent.attendees && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Attendees:</strong> {selectedEvent.attendees}
                  </Typography>
                )}
                <Typography variant="body2" mt={2}>
                  <strong>Description:</strong> {selectedEvent.description}
                </Typography>
                <Box mt={3} textAlign="right">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCloseModal}
                  >
                    Close
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};
