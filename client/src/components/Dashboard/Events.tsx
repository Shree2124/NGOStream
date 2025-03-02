/* eslint-disable @typescript-eslint/no-explicit-any */
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
  // Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Assignment,
  Build,
  CalendarToday,
  Category,
  //  Edit, Delete, BarChart,
  Close,
  DescriptionOutlined,
  Download,
  EventAvailable,
  FitnessCenter,
  LocationOn,
  MonetizationOn,
  People,
  PersonAdd,
  PictureAsPdfOutlined,
  Public,
  TableChartOutlined,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { School } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface IMember {
  _id: string;
  role: string;
  fullName: string;
}

interface IParticipant {
  memberId: string;
  role: string;
}

interface IEvent {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  eventType: string;
  status: "upcoming" | "happening" | "completed";
  participants: IParticipant[];
  kpis: {
    attendance: number;
    fundsRaised?: number;
    successMetrics?: string[];
  };
}

const Events: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [events, setEvents] = useState<IEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<IEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<IEvent | null>(null);
  const [systemParticipants, setSystemParticipants] = useState<IMember[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assignedRoles, setAssignedRoles] = useState<string | any>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [openGenerateReportModal, setOpenGenerateReportModal] = useState<
    boolean
  >(false);

  const navigate = useNavigate();

  const firstEventStartDate = new Date(
    Math.min(...events.map((event) => new Date(event.startDate).getTime()))
  );

  const lastEventEndDate = new Date(
    Math.max(...events.map((event) => new Date(event.endDate).getTime()))
  );

  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [fileType, setFileType] = useState("pdf");
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const handleDownload = () => {
    setSelectedRange(null);
    setOpenGenerateReportModal(false);
  };

  const handlePeriodChange = (event: any) => {
    setSelectedPeriod(event.target.value);
    setSelectedRange(null);
  };

  const generateSelectableRanges = () => {
    const ranges = [];
    const start = new Date(firstEventStartDate);
    const end = new Date(lastEventEndDate);

    if (selectedPeriod === "week") {
      const current = new Date(start);
      while (current <= end) {
        const weekStart = new Date(current);
        let weekEnd = new Date(current);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekEnd > end) weekEnd = new Date(end);
        ranges.push({
          label: `${weekStart.toDateString()} - ${weekEnd.toDateString()}`,
          value: { from: weekStart, to: weekEnd },
        });
        current.setDate(current.getDate() + 7);
      }
    } else if (selectedPeriod === "month") {
      const current = new Date(start);
      while (current <= end) {
        const monthStart = new Date(
          current.getFullYear(),
          current.getMonth(),
          1
        );
        let monthEnd = new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          0
        );
        if (monthEnd > end) monthEnd = new Date(end);
        ranges.push({
          label: `${monthStart.toDateString()} - ${monthEnd.toDateString()}`,
          value: { from: monthStart, to: monthEnd },
        });
        current.setMonth(current.getMonth() + 1);
      }
    } else if (selectedPeriod === "year") {
      const current = new Date(start);
      while (current <= end) {
        const yearStart = new Date(current.getFullYear(), 0, 1);
        let yearEnd = new Date(current.getFullYear(), 11, 31);
        if (yearEnd > end) yearEnd = new Date(end);
        ranges.push({
          label: `${yearStart.getFullYear()}`,
          value: { from: yearStart, to: yearEnd },
        });
        current.setFullYear(current.getFullYear() + 1);
      }
    }
    return ranges;
  };

  // useEffect(() => {
  //   console.log("Updated startDate: ", startDate);
  // }, [startDate]);

  // useEffect(() => {
  //   console.log("Updated endDate: ", endDate);
  // }, [endDate]);

  const handleGenerateReportModalClose = () => {
    setOpenGenerateReportModal(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setEventType("");
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get("/users/all-members");
      const participants = res.data?.data?.filter(
        (member: IMember) => member.role !== "Attendee"
      );
      console.log("p", participants);
      setSystemParticipants(participants);
      console.log(systemParticipants);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };
  const fetchEvents = async () => {
    const res = await api.get("/event/");
    console.log(res.data.data);
    setEvents(res.data.data);
    console.log("E", events);
    setFilteredEvents(res.data.data);
  };
  useEffect(() => {
    fetchEvents();
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

  const handleRoleChange = (participantId: string, newRole: string) => {
    setAssignedRoles((prevRoles: string[]) => ({
      ...prevRoles,
      [participantId]: newRole,
    }));
  };

  const generatePDFReport = async (filteredIds: any[], fileType: string) => {
    try {
      const res = await api.post("/event/generate-report", {
        ids: filteredIds,
        fileType: fileType,
        type: "event",
      });
      console.log(res.data.data);
      if (res.data?.data) {
        setReportUrl(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setReportLoading(false);
    }
  };

  function generateReport(selectedRange: string, fileType: string) {
    console.log("Selected Range:", selectedRange);

    if (!selectedRange || typeof selectedRange !== "string") {
      console.error("Invalid date range selected.");
      return;
    }

    let from: Date, to: Date;

    if (/^\d{4}$/.test(selectedRange)) {
      const year = parseInt(selectedRange);
      from = new Date(year, 0, 1);
      to = new Date(year, 11, 31, 23, 59, 59, 999);
    } else {
      const dateParts = selectedRange.split(" - ");
      if (dateParts.length !== 2) {
        console.error("Invalid date format.");
        return;
      }

      from = new Date(dateParts[0]);
      to = new Date(dateParts[1]);

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
    }

    const filteredIds = events
      .filter((e) => {
        const createdAt = new Date(e.startDate);
        return createdAt >= from && createdAt <= to;
      })
      .map((e) => e._id);

    console.log("Filtered events IDs:", filteredIds);
    console.log("File Type:", fileType);

    generatePDFReport(filteredIds, fileType);
  }

  const handleParticipantsChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target; // value is a string[] now
    setParticipantIds(Array.isArray(value) ? value : [value]);

    // Update assigned roles based on the selected participants
    setAssignedRoles((prev: Record<string, string> = {}) =>
      Object.keys(prev) // Now prev is always at least an empty object
        ?.filter((id) => value.includes(id))
        ?.reduce<Record<string, string>>(
          (acc, id) => ({ ...acc, [id]: prev[id] }),
          {}
        )
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
    console.log("f", filtered);

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

  const handleDialogOpen = (event: IEvent | null) => {
    setCurrentEvent(event);
    console.log("visual ", event);

    if (event) {
      setName(event.name);
      setDescription(event.description);
      setStartDate(event.startDate);
      setEndDate(event.endDate);
      setLocation(event.location);
      setEventType(event.eventType);
      const roles = event.participants.reduce(
        (acc: { [key: string]: string }, participant) => {
          acc[participant.memberId] = participant.role;
          return acc;
        },
        {}
      );
      setAssignedRoles(roles);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
    setCurrentEvent(null);
  };

  const handleSaveEvent = async () => {
    if (participantIds?.some((id: string) => !assignedRoles[id])) {
      alert("All participants must have a role assigned.");
      return;
    }

    try {
      const participantsWithRoles = participantIds?.map((id) => ({
        memberId: id,
        role: assignedRoles[id],
      }));

      if (currentEvent) {
        console.log(currentEvent._id);
        const res = await api.put(`/event/edit/${currentEvent._id}`, {
          name,
          startDate,
          endDate,
          description,
          location,
          eventType,
          participants: participantsWithRoles,
        });
        console.log(res.data.data);

        setEvents((prev) =>
          prev.map((event) =>
            event._id === currentEvent._id ? res.data.data : event
          )
        );
      } else {
        const res = await api.post("/event/create", {
          name,
          startDate,
          endDate,
          description,
          location,
          eventType,
          participants: participantsWithRoles,
        });
        setEvents((prev) => [...prev, res.data.data]);
      }
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
    }
    setDialogOpen(false);
  };

  const handleNavigation = (id: string) => {
    navigate(`/dashboard/event-details/${id}`);
  };

  return (
    <Box
      p={3}
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
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

        <Button
          sx={{
            width: "40%",
            // padding: "1rem",
            display: "flex",
          }}
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleDialogOpen(null)}
        >
          Add Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredEvents?.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "transform 0.3s ease",
                  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
                },
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(229, 231, 235, 0.8)",
              }}
              onClick={() => handleNavigation(event._id)}
            >
              {/* Colorful status indicator at the top */}
              <Box
                sx={{
                  height: 6,
                  width: "100%",
                }}
              />

              <CardContent
                sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}
              >
                {/* Event name with better typography */}
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{
                    fontSize: "1.1rem",
                    lineHeight: 1.3,
                    mb: 1,
                  }}
                >
                  {event.name}
                </Typography>

                {/* Description with better spacing and line clamping */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {event.description}
                </Typography>

                {/* Dates section with improved visual hierarchy */}
                <Box
                  sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 2,
                    p: 1.5,
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CalendarToday
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontWeight: 500 }}
                    >
                      Start:
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ ml: 0.5 }}
                    >
                      {new Date(event.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <EventAvailable
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontWeight: 500 }}
                    >
                      End:
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ ml: 0.5 }}
                    >
                      {new Date(event.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Typography>
                  </Box>
                </Box>

                {/* Status badge with improved design */}
                <Box sx={{ mt: "auto", display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ fontWeight: 500 }}
                  >
                    Status:
                  </Typography>
                  <Typography
                    sx={{
                      ml: 1,
                      px: 1.2,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "capitalize",
                      backgroundColor:
                        event.status.toLowerCase() === "upcoming"
                          ? "rgba(63, 81, 181, 0.1)"
                          : event.status.toLowerCase() === "happening"
                          ? "rgba(76, 175, 80, 0.1)"
                          : event.status.toLowerCase() === "completed"
                          ? "#4caf50"
                          : "rgba(255, 152, 0, 0.1)",

                      border: "1px solid",
                      borderColor:
                        event.status.toLowerCase() === "upcoming"
                          ? "rgba(63, 81, 181, 0.2)"
                          : event.status.toLowerCase() === "happening"
                          ? "rgba(76, 175, 80, 0.2)"
                          : event.status.toLowerCase() === "completed"
                          ? "rgba(158, 158, 158, 0.2)"
                          : "rgba(255, 152, 0, 0.2)",
                    }}
                  >
                    {event.status}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: "primary.main",
                  fontSize: "0.95rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Basic Information
              </Typography>

              <TextField
                label="Event Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter event name"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                multiline
                rows={3}
                placeholder="Describe the event purpose and activities"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
            </Grid>

            {/* Date and Time Section */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  mt: 1,
                  color: "primary.main",
                  fontSize: "0.95rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Date and Time
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography>Start Date</Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Normalize to the beginning of today

                      if (selectedDate < today) {
                        alert("Start date cannot be earlier than today.");
                        return;
                      }

                      setStartDate(e.target.value);
                    }}
                    required
                    inputProps={{
                      min: new Date().toISOString().slice(0, 16), // Prevents selecting past dates
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography>End Date</Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => {
                      const selectedEndDate = new Date(e.target.value);
                      const selectedStartDate = new Date(startDate);

                      if (!startDate) {
                        alert("Please select a start date first.");
                        return;
                      }

                      if (selectedEndDate < selectedStartDate) {
                        alert(
                          "End date cannot be earlier than the start date."
                        );
                        return;
                      }

                      setEndDate(e.target.value);
                    }}
                    required
                    inputProps={{
                      min: startDate || new Date().toISOString().slice(0, 16), // Prevents selecting dates before the start date
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Event Details Section */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  mt: 1,
                  color: "primary.main",
                  fontSize: "0.95rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Event Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location"
                    variant="outlined"
                    fullWidth
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="Where will this event take place?"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      label="Event Type"
                      required
                      sx={{ borderRadius: 1.5 }}
                      startAdornment={
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          <Category fontSize="small" color="action" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="Fundraiser">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <MonetizationOn
                            fontSize="small"
                            sx={{ mr: 1, color: "success.main" }}
                          />
                          Fundraiser
                        </Box>
                      </MenuItem>
                      <MenuItem value="Workshop">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Build
                            fontSize="small"
                            sx={{ mr: 1, color: "warning.main" }}
                          />
                          Workshop
                        </Box>
                      </MenuItem>
                      <MenuItem value="Outreach">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Public
                            fontSize="small"
                            sx={{ mr: 1, color: "info.main" }}
                          />
                          Outreach
                        </Box>
                      </MenuItem>
                      <MenuItem value="Seminar">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <School
                            fontSize="small"
                            sx={{ mr: 1, color: "primary.main" }}
                          />
                          Seminar
                        </Box>
                      </MenuItem>
                      <MenuItem value="Training">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FitnessCenter
                            fontSize="small"
                            sx={{ mr: 1, color: "error.main" }}
                          />
                          Training
                        </Box>
                      </MenuItem>
                      <MenuItem value="Training">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          Other
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Participants Section */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  mt: 1,
                  color: "primary.main",
                  fontSize: "0.95rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Participants & Roles
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Participants</InputLabel>
                <Select
                  multiple
                  value={participantIds}
                  onChange={handleParticipantsChange}
                  renderValue={(selected) =>
                    selected
                      .map((id) => {
                        const participant = systemParticipants?.find(
                          (member) =>
                            member._id === id && member?.role !== "Attendee"
                        );
                        return participant ? participant?.fullName : "";
                      })
                      .join(", ")
                  }
                  sx={{ borderRadius: 1.5 }}
                  startAdornment={
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      <People fontSize="small" color="action" />
                    </InputAdornment>
                  }
                >
                  {systemParticipants?.map((member) => (
                    <MenuItem key={member._id} value={member._id}>
                      <Checkbox
                        checked={participantIds?.includes(member._id)}
                      />
                      <ListItemText
                        primary={member.fullName}
                        secondary={member.role}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "background.paper",
                  p: 2,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Assignment color="primary" sx={{ mr: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Assign Roles to Participants
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={openAssignRolesModal}
                  startIcon={<PersonAdd />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1.5,
                    boxShadow: "none",
                  }}
                >
                  Assign Roles
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <Dialog open={rolesModalOpen} onClose={closeAssignRolesModal}>
          <DialogTitle>Assign Roles to Participants</DialogTitle>
          <DialogContent>
            {participantIds?.map((id) => {
              const participant = systemParticipants?.find(
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

        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveEvent} variant="contained">
            {currentEvent ? "Save Changes" : "Add Event"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openGenerateReportModal}
        onClose={handleGenerateReportModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            pt: 3,
            px: 3,
            typography: "h5",
            fontWeight: 600,
          }}
        >
          Generate Report
        </DialogTitle>

        <DialogContent sx={{ p: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Period Selection */}
            <FormControl fullWidth variant="outlined" sx={{ mt: 3 }}>
              <InputLabel id="period-label">Time Period</InputLabel>
              <Select
                labelId="period-label"
                value={selectedPeriod}
                onChange={handlePeriodChange}
                label="Time Period"
              >
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="year">Yearly</MenuItem>
              </Select>
            </FormControl>

            {/* Range Selection */}
            {selectedPeriod && (
              <FormControl fullWidth variant="outlined">
                <InputLabel id="range-label">Date Range</InputLabel>
                <Select
                  labelId="range-label"
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value!)}
                  label="Date Range"
                >
                  {generateSelectableRanges()?.map((range, index) => (
                    <MenuItem key={index} value={range.label}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Report File Type */}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="file-type-label">File Format</InputLabel>
              <Select
                labelId="file-type-label"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                label="File Format"
              >
                <MenuItem value="word">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionOutlined color="primary" fontSize="small" />
                    <span>Word Document</span>
                  </Box>
                </MenuItem>
                <MenuItem value="excel">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TableChartOutlined color="success" fontSize="small" />
                    <span>Excel Spreadsheet</span>
                  </Box>
                </MenuItem>
                <MenuItem value="pdf">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PictureAsPdfOutlined color="error" fontSize="small" />
                    <span>PDF Document</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={handleGenerateReportModalClose}
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => {
              if (!selectedRange) {
                alert("Please select a date range.");
                return;
              }
              generateReport(selectedRange, fileType);
            }}
            disabled={reportLoading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {!reportUrl && "Generate Report"}
            {reportUrl && (
              <a
                onClick={handleDownload}
                href={reportUrl}
                download
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 mt-4 px-4 py-2 rounded-md text-white"
                target="blank"
              >
                <Download />
                Download Report
              </a>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <div className="text-right">
        <Button
          onClick={() => setOpenGenerateReportModal(true)}
          sx={{
            bgcolor: "#1450ac",
            color: "#fff",
            p: 2,
            cursor: "pointer",
            position: "fixed",
            bottom: "2rem",
            right: "3rem",
          }}
        >
          Generate Report
        </Button>
      </div>
    </Box>
  );
};

export default Events;
