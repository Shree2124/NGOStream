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
  Divider,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
} from "@mui/material";
import {
  Add,
  //  Edit, Delete, BarChart,
  Close,
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
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";

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

  // const [loading, setLoading] = useState(false);

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

  function generateReport(selectedRange: any, fileType: string) {
    console.log(selectedRange, fileType);
  }

  return (
    <Box p={3} sx={{
      height: "100%",
      width: "100%"
    }}>
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
          <InputLabel>Participants</InputLabel>
          <Select
            multiple
            value={participantIds} // Ensure this is always an array
            onChange={handleParticipantsChange}
            renderValue={(selected) => selected.join(", ")} // Display selected values
          >
            {systemParticipants.map((participant) => (
              <MenuItem key={participant._id} value={participant._id}>
                <Checkbox checked={participantIds.includes(participant._id)} />
                <ListItemText primary={participant.fullName} />
              </MenuItem>
            ))}
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
              sx={{ height: "100%", cursor: "pointer" }}
              onClick={() => handleNavigation(event._id)}
            >
              <CardContent>
                <Typography variant="h6">{event.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {event.description}
                </Typography>
                <Typography variant="body2">
                  <strong>start date:</strong> {event.startDate}
                </Typography>
                <Typography variant="body2">
                  <strong>end date:</strong> {event.endDate}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong>
                  {"  "}
                  <Badge
                    variant={
                      event.status.toLowerCase() as
                        | "outline"
                        | "upcoming"
                        | "happening"
                        | "completed"
                        | undefined
                    }
                  >
                    {event.status}
                  </Badge>
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* <Box display="flex" justifyContent="space-evenly">
                  {event?.status?.toLowerCase() === "completed" && (
                    <Tooltip title="Show Visuals">
                      <IconButton
                        color="primary"
                        onClick={() => handleShowVisuals(event)}
                      >
                        <BarChart />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Box>
                    {event?.status?.toLowerCase() === "upcoming" && (
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleDialogOpen(event)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box> */}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* <Dialog open={visualModalOpen} onClose={handleCloseVisuals}>
        <DialogTitle>Event Visual Representation</DialogTitle>
        <DialogContent>
          {currentEvent && (
            <>
              <Typography variant="h6" gutterBottom>
                Attendance for {currentEvent.name}
              </Typography>
              <Bar data={getEventChartData(currentEvent)} />
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Success Metrics Distribution
              </Typography>
              <Pie data={getSuccessMetricsChartData(currentEvent)} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVisuals}>Close</Button>
        </DialogActions>
      </Dialog> */}
      

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
            label="Start Date"
            variant="outlined"
            fullWidth
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ my: 2 }}
            required
          />
          <TextField
            label="End Date"
            variant="outlined"
            fullWidth
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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
                    const participant = systemParticipants?.find(
                      (member: IMember) =>
                        member._id === id && member?.role !== "Attendee"
                    );
                    return participant ? participant?.fullName : "";
                  })
                  .join(",")
              }
            >
              {systemParticipants?.map((member: IMember) => (
                <MenuItem key={member._id} value={member._id}>
                  <Checkbox checked={participantIds?.includes(member._id)} />
                  <ListItemText primary={member.fullName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
      >
        <DialogTitle>Select Report Period</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Period Selection */}
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select value={selectedPeriod} onChange={handlePeriodChange}>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>

            {/* Range Selection (Appears only if a period is selected) */}
            {selectedPeriod && (
              <FormControl fullWidth>
                <InputLabel>Select Range</InputLabel>
                <Select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value!)}
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
            <FormControl fullWidth>
              <InputLabel>Report File Type</InputLabel>
              <Select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                <MenuItem value="word">Word</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleGenerateReportModalClose}
            sx={{ color: "gray" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (!selectedRange) {
                alert("Please select a range.");
                return;
              }
              generateReport(selectedRange, fileType);
            }}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

      <div className="text-right">
        <Button
        onClick={()=>setOpenGenerateReportModal(true)}
          sx={{
            bgcolor: "#1450ac",
            color: "#fff",
            p: 2,
            cursor: "pointer",
            position: "fixed",
            bottom: "2rem",
            right: "3rem"
          }}
        >
          Generate Report
        </Button>
      </div>
    </Box>
  );
};

export default Events;
