import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  BarChart,
  Close,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { log } from "node:console";
import { api } from "../../api/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  eventType: string;
  status: string;
  attendance: number;
  fundsRaised: number;
  successMetrics: string[];
}

const Events: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [visualModalOpen, setVisualModalOpen] = useState<boolean>(false);
  const [visualEventId, setVisualEventId] = useState<string | null>(null);
  const [systemParticipants, setSystemParticipants] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [participantIds, setParticipantIds] = useState([]);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDate("");
    setLocation("");
    setEventType("");
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get("/users/all-members");
        setSystemParticipants(res.data.data);
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };
    fetchMembers();
  }, []);

  const openAssignRolesModal = () => {
    setRolesModalOpen(true);
  };

  const closeAssignRolesModal = () => {
    setRolesModalOpen(false);
  };

  const saveAssignedRoles = () => {
    console.log("Roles saved:", assignedRoles);
    closeAssignRolesModal();
  };

  const handleRoleChange = (participantId, newRole) => {
    setAssignedRoles((prevRoles) => ({
      ...prevRoles,
      [participantId]: newRole,
    }));
  };

  const handleParticipantsChange = (event) => {
    const { value } = event.target;
    setParticipantIds(value);
    setAssignedRoles((prev) =>
      Object.keys(prev)
        .filter((id) => value.includes(id))
        .reduce((acc, id) => ({ ...acc, [id]: prev[id] }), {})
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterEvents(query, filterStatus, filterType);
  };

  const handleFilter = (status: string, type: string) => {
    setFilterStatus(status);
    setFilterType(type);
    filterEvents(searchQuery, status, type);
  };

  const filterEvents = (query: string, status: string, type: string): void => {
    let filtered = events;
    if (status !== "All") {
      filtered = filtered.filter((event) => event.status === status);
    }
    if (type !== "All") {
      filtered = filtered.filter((event) => event.eventType === type);
    }
    if (query) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
  };

  const handleDialogOpen = (event: Event | null = null) => {
    setCurrentEvent(event);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentEvent(null);
    resetForm();
  };

  const handleSaveEvent = async () => {
    if (participantIds.some((id) => !assignedRoles[id])) {
      alert("All participants must have a role assigned.");
      return;
    }
    try {
      const participantsWithRoles = participantIds.map((id) => ({
        memberId: id,
        role: assignedRoles[id],
      }));
      const res = await api.post("/event/create", {
        name,
        date,
        description,
        location,
        eventType,
        participants: participantsWithRoles,
      });
      setEvents((prev) => [...prev, res.data.data]);
    } catch (error) {
      console.error("Error saving event:", error);
    }
    setDialogOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleShowVisuals = (eventId: string) => {
    setVisualEventId(eventId);
    setVisualModalOpen(true);
  };

  const handleCloseVisuals = () => {
    setVisualModalOpen(false);
    setVisualEventId(null);
  };

  const getEventChartData = (event: Event) => ({
    labels: ["Attendance", "Funds Raised"],
    datasets: [
      {
        label: event.name,
        data: [event.attendance, event.fundsRaised],
        backgroundColor: ["#4caf50", "#2196f3"],
      },
    ],
  });

  const getSuccessMetricsChartData = (event: Event) => ({
    labels: event.successMetrics,
    datasets: [
      {
        data: event.successMetrics.map(() => 1),
        backgroundColor: ["#f44336", "#ff9800", "#ffeb3b"],
      },
    ],
  });

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Event Management
      </Typography>

      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        gap={2}
        mb={3}
      >
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search Events"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => handleFilter(e.target.value, filterType)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Upcoming">Upcoming</MenuItem>
            <MenuItem value="Happening">Happening</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => handleFilter(filterStatus, e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Fundraiser">Fundraiser</MenuItem>
            <MenuItem value="Workshop">Workshop</MenuItem>
            <MenuItem value="Outreach">Outreach</MenuItem>
          </Select>
        </FormControl>
        <Button
          sx={{
            width: "40%",
            // padding: "1rem",
            display: "flex",
          }}
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleDialogOpen()}
        >
          Add Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{event.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {event.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {event.date}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {event.status}
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Visuals Icon Button */}
                <Box display="flex" justifyContent="space-between">
                  <Tooltip title="Show Visuals">
                    <IconButton
                      color="primary"
                      onClick={() => handleShowVisuals(event.id)}
                    >
                      <BarChart />
                    </IconButton>
                  </Tooltip>

                  {/* Edit and Delete Buttons */}
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => handleDialogOpen(event)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={visualModalOpen} onClose={handleCloseVisuals}>
        <DialogTitle>Event Visual Representation</DialogTitle>
        <DialogContent>
          {visualEventId && (
            <>
              <Typography variant="h6" gutterBottom>
                Attendance and Funds Raised for{" "}
                {filteredEvents.find((e) => e.id === visualEventId)?.name}
              </Typography>
              <Bar
                data={getEventChartData(
                  filteredEvents.find((e) => e.id === visualEventId)!
                )}
              />

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Success Metrics Distribution
              </Typography>
              <Pie
                data={getSuccessMetricsChartData(
                  filteredEvents.find((e) => e.id === visualEventId)!
                )}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVisuals}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{currentEvent ? "Edit Event" : "Add Event"}</span>
          <IconButton onClick={handleDialogClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Event Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ my: 2 }}
            required
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ my: 2 }}
            required
          />
          <TextField
            label="Date"
            variant="outlined"
            fullWidth
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            sx={{ my: 2 }}
            required
          />
          <TextField
            label="Location"
            variant="outlined"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={{ my: 2 }}
            required
          />
          <FormControl fullWidth sx={{ my: 2 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              label="Event Type"
              required
            >
              <MenuItem value="Fundraiser">Fundraiser</MenuItem>
              <MenuItem value="Workshop">Workshop</MenuItem>
              <MenuItem value="Outreach">Outreach</MenuItem>
              <MenuItem value="Seminar">Seminar</MenuItem>
              <MenuItem value="Training">Training</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ my: 2 }}>
            <InputLabel>Participants</InputLabel>
            <Select
              multiple
              value={participantIds}
              onChange={handleParticipantsChange}
              renderValue={(selected) =>
                selected
                  .map((id) => {
                    const participant = systemParticipants.find(
                      (member) => member._id === id
                    );
                    return participant ? participant.fullName : "";
                  })
                  .join(", ")
              }
            >
              {systemParticipants?.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  <Checkbox checked={participantIds.includes(member._id)} />
                  <ListItemText primary={member.fullName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Assign Roles Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h6">Assign Roles</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={openAssignRolesModal}
              sx={{ textTransform: "none" }}
            >
              Assign Roles
            </Button>
          </Box>
        </DialogContent>


        <Dialog open={rolesModalOpen} onClose={closeAssignRolesModal}>
          <DialogTitle>Assign Roles to Participants</DialogTitle>
          <DialogContent>
            {participantIds.map((id) => {
              const participant = systemParticipants.find(
                (member) => member._id === id
              );
              return (
                <Box
                  key={id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    my: 1,
                  }}
                >
                  <Typography>{participant?.fullName}</Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={assignedRoles[id] || ""}
                      onChange={(e) => handleRoleChange(id, e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Role
                      </MenuItem>
                      <MenuItem value="Organizer">Organizer</MenuItem>
                      <MenuItem value="Volunteer">Volunteer</MenuItem>
                      <MenuItem value="Attendee">Attendee</MenuItem>
                      <MenuItem value="Speaker">Speaker</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              );
            })}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={closeAssignRolesModal}
              color="error"
              sx={{ textTransform: "none" }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={saveAssignedRoles}
              color="primary"
              sx={{ textTransform: "none" }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
        >
          <Button
            onClick={handleDialogClose}
            variant="outlined"
            color="error"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSaveEvent()}
            variant="contained"
            color="primary"
            sx={{ textTransform: "none" }}
          >
            {currentEvent ? "Save Changes" : "Add Event"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Events;
