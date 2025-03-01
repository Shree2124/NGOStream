import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  IconButton,
  List,
  ListItem,
  MenuItem,
  Select,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  useMediaQuery,
  Container,
  CircularProgress,
  Card,
  Grid,
  Divider,
  FormControl,
  DialogContent,
  DialogTitle,
  Dialog,
  InputLabel,
  DialogActions,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../../api/api";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import CampaignImage from "./../../assets/campaign.jpg";
ChartJS.register(ArcElement, Tooltip, Legend);

interface IDonations {
  donorName: string;
  donorEmail: string;
  amount: number | null;
}

interface IGoal {
  donations: IDonations[];
  _id: string;
  name: string;
  description: string;
  targetAmount: number;
  startDate: string;
  status: string;
  image?: string;
  currentAmount?: number;
}

const Goals: React.FC = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isLandscape = useMediaQuery("(orientation: landscape)");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentGoal, setCurrentGoal] = useState<IGoal | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<IGoal>();

  const [goals, setGoals] = useState<IGoal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<string>("Active");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [goal, setGoal] = useState<IGoal[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoadingGoal, setIsLoadingGoal] = useState<boolean>(false);
  const [fileTypeModal, setFileTypeModal] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string>("pdf");

  const generateReport = () => {
    setFileTypeModal(true);
  };

  const generateGoalReport = async (fileType: string, id: string) => {
    console.log(fileType, id);
    setFileTypeModal(false);
  };

  const fetchGoalInfo = async (id: string) => {
    setIsLoadingGoal(true);
    try {
      const res = await api.get(`/goals/goal/${id}`);
      setGoal(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch goal details. Please try again.");
    } finally {
      setIsLoadingGoal(false);
    }
  };

  useEffect(() => {
    if (selectedGoal?._id) {
      fetchGoalInfo(selectedGoal._id.toString());
    }
  }, [selectedGoal]);

  const handleOpenModal = (goal: IGoal | null) => {
    if (goal) {
      setIsEditing(true);
      setCurrentGoal(goal);
      setName(goal.name);
      setDescription(goal.description);
      setTargetAmount(goal.targetAmount);
      setStartDate(goal.startDate);
      setStatus(goal.status);
    } else {
      setIsEditing(false);
      setName("");
      setDescription("");
      setTargetAmount("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setStatus("Active");
      setImage(null);
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddOrEditGoal = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (targetAmount) formData.append("targetAmount", targetAmount.toString());
    formData.append("startDate", startDate);
    formData.append("status", status);
    if (image) formData.append("image", image);

    try {
      if (isEditing && currentGoal) {
        const res = await api.put(`/goals/edit/${currentGoal._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setImagePreview(null);
        setGoals((prevGoals) =>
          prevGoals.map((goal) =>
            goal._id === currentGoal._id ? res.data.data : goal
          )
        );
        toast.success("Goal updated successfully");
      } else {
        const res = await api.post("/goals/create", {
          name,
          description,
          status,
          startDate,
          targetAmount,
        });
        setGoals((prevGoals) => [...prevGoals, res.data.data]);
        toast.success("New goal created successfully");
      }
      setIsModalOpen(false);
      setCurrentGoal(null);
    } catch (error) {
      toast.error("Failed to save goal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (selectedGoal) {
      setIsDeleting(true);
      try {
        await api.delete(`/goals/delete/${selectedGoal._id}`);
        setGoals((prevGoals) =>
          prevGoals.filter((goal) => goal._id !== selectedGoal._id)
        );
        setIsDeleteModalOpen(false);
        toast.success("Goal deleted successfully!");
      } catch (error) {
        toast.error("Something went wrong while deleting the Goal");
        console.error("Error deleting goal:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleViewGoal = async (goal: IGoal) => {
    setSelectedGoal(goal);
    setIsViewModalOpen(true);
  };

  const filteredGoals = goals.filter((goal) => {
    const matchesSearchQuery = goal.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || goal.status === statusFilter;
    return matchesSearchQuery && matchesStatus;
  });

  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/admin/all-goals");
        setGoals(res.data.data);
      } catch (error) {
        toast.error("Failed to fetch goals. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  // Improved modal styles with better handling of mobile/landscape views
  const modalStyles = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: { xs: 2, sm: 3 },
    borderRadius: 2,
    width: isMobile ? "90%" : isTablet ? "70%" : "50%",
    maxHeight: isMobile && !isLandscape ? "80vh" : "90vh",
    overflowY: "auto",
  };

  // For small dialog modals
  const smallModalStyles = {
    ...modalStyles,
    width: isMobile ? "90%" : 400,
    maxHeight: "80vh",
  };

  // Improved chart data and options
  const chartData = {
    labels: ["Raised", "Remaining"],
    datasets: [
      {
        data: [
          selectedGoal?.currentAmount || 0,
          (selectedGoal?.targetAmount || 0) -
            (selectedGoal?.currentAmount || 0),
        ],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Chart options with better responsive handling
  const chartOptions = {
    devicePixelRatio: window.devicePixelRatio || 3,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: $${tooltipItem.raw}`;
          },
        },
      },
      legend: {
        position: isMobile || isTablet ? "bottom" : "right",
        labels: {
          padding: 20,
          font: {
            size: isMobile ? 12 : 14,
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 800,
    },
    cutout: isMobile ? "50%" : "60%",
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    },
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      {/* Search and Filter Section */}
      <Card sx={{ mb: 3, p: { xs: 1.5, sm: 2 } }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <IconButton edge="start" size={isMobile ? "small" : "medium"}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
              size={isMobile ? "small" : "medium"}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Complete">Complete</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal(null)}
              sx={{
                py: { xs: 0.75, sm: 1, md: 1.5 },
                height: { xs: 40, sm: "auto" },
                fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
              }}
            >
              {!isMobile ? "Add Goal" : "Add"}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No goals found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or add a new goal
          </Typography>
        </Paper>
      ) : (
        <Card>
          <List sx={{ p: 0 }}>
            {filteredGoals.map((goal, index) => (
              <React.Fragment key={goal._id}>
                <ListItem
                  sx={{
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 2, sm: 3 },
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: { xs: 1.5, sm: 1 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      flex: { xs: "none", sm: 1 },
                    }}
                  >
                    <Box
                      component="img"
                      src={goal.image || CampaignImage}
                      alt={goal.name}
                      sx={{
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        objectFit: "cover",
                        borderRadius: 1,
                        mr: 2,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant={isMobile ? "subtitle2" : "subtitle1"}
                        sx={{
                          fontWeight: 500,
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {goal.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Status: {goal.status} • Target: $
                        {goal.targetAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-end",
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    <Button
                      startIcon={<Visibility />}
                      onClick={() => handleViewGoal(goal)}
                      size={isMobile ? "small" : "medium"}
                      variant="outlined"
                      sx={{
                        minWidth: { xs: 0, sm: 64 },
                        flex: { xs: 1, sm: "none" },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      {!isMobile && "View"}
                    </Button>
                    <Button
                      startIcon={<Edit />}
                      onClick={() => handleOpenModal(goal)}
                      size={isMobile ? "small" : "medium"}
                      variant="outlined"
                      sx={{
                        minWidth: { xs: 0, sm: 64 },
                        flex: { xs: 1, sm: "none" },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      {!isMobile && "Edit"}
                    </Button>
                    <Button
                      startIcon={<Delete />}
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsDeleteModalOpen(true);
                      }}
                      size={isMobile ? "small" : "medium"}
                      variant="outlined"
                      color="error"
                      sx={{
                        minWidth: { xs: 0, sm: 64 },
                        flex: { xs: 1, sm: "none" },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      {!isMobile && "Delete"}
                    </Button>
                  </Stack>
                </ListItem>
                {index < filteredGoals.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="add-edit-goal-modal"
      >
        <Box sx={modalStyles}>
          <Typography variant="h6" mb={2} id="add-edit-goal-modal">
            {isEditing ? "Edit Goal" : "Add Goal"}
          </Typography>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size={isMobile ? "small" : "medium"}
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              size={isMobile ? "small" : "medium"}
              required
            />
            <TextField
              label="Target Amount"
              type="number"
              value={targetAmount || ""}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              fullWidth
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
              }}
              required
            />
            <TextField
              label="Start Date"
              type="date"
              value={startDate.split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              size={isMobile ? "small" : "medium"}
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl
              fullWidth
              size={isMobile ? "small" : "medium"}
              required
            >
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Complete">Complete</MenuItem>
              </Select>
            </FormControl>

            {isEditing && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  sx={{ mt: 1 }}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
                {imagePreview && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        borderRadius: "4px",
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Stack>
          <Box
            sx={{
              mt: { xs: 2, sm: 3 },
              display: "flex",
              gap: { xs: 1, sm: 2 },
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              size={isMobile ? "small" : "medium"}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddOrEditGoal}
              disabled={!name || !description || !targetAmount || isSaving}
              startIcon={isSaving ? <Loader2 className="animate-spin" /> : null}
              size={isMobile ? "small" : "medium"}
            >
              {isEditing ? "Save Changes" : "Add Goal"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* View Modal */}
      <Modal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        aria-labelledby="view-goal-modal"
      >
        <Box sx={modalStyles}>
          {isLoadingGoal ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={{ xs: 2, sm: 3 }}>
              <Typography
                variant="h6"
                align="center"
                id="view-goal-modal"
                sx={{
                  wordBreak: "break-word",
                  mb: { xs: 0, sm: 1 },
                }}
              >
                {selectedGoal?.name}
              </Typography>

              <Box
                sx={{
                  height: { xs: 200, sm: 300, md: 400 },
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  px: { xs: 1, sm: 2 },
                }}
              >
                <Pie data={chartData} options={chartOptions} />
              </Box>

              <Box sx={{ pt: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  Donor Information
                </Typography>
                <Paper variant="outlined" sx={{ mb: 2 }}>
                  <TableContainer sx={{ maxHeight: { xs: 200, sm: 300 } }}>
                    <Table stickyHeader size={isMobile ? "small" : "medium"}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Donor Name
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Donor Email
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {goal?.length > 0 &&
                        goal?.some((goalItem: IGoal) =>
                          goalItem.donations?.some(
                            (donation: IDonations) =>
                              donation.donorName?.trim() &&
                              donation.donorEmail?.trim() &&
                              donation.amount !== null &&
                              donation.amount !== undefined &&
                              typeof donation.amount === "number"
                          )
                        ) ? (
                          goal?.map((goalItem: IGoal, goalIndex: number) =>
                            goalItem?.donations?.map(
                              (donation: IDonations, donationIndex: number) => (
                                <TableRow key={`${goalIndex}-${donationIndex}`}>
                                  <TableCell
                                    sx={{
                                      maxWidth: { xs: 80, sm: 150 },
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {donation.donorName?.trim() || "Unknown"}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      maxWidth: { xs: 100, sm: 200 },
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {donation.donorEmail?.trim() || "Unknown"}
                                  </TableCell>
                                  <TableCell>
                                    ${donation.amount?.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          )
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              No donations yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: { xs: 1, sm: 2 },
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setIsViewModalOpen(false)}
                  size={isMobile ? "small" : "medium"}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={generateReport}
                  size={isMobile ? "small" : "medium"}
                >
                  Generate Report
                </Button>
              </Box>
            </Stack>
          )}
        </Box>
      </Modal>

      {/* File Type Selection Dialog */}
      <Dialog
        open={fileTypeModal}
        onClose={() => {
          setFileTypeModal(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Report Format</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="report-file-type-label">
                Report File Type
              </InputLabel>
              <Select
                labelId="report-file-type-label"
                label="Report File Type"
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
          <Button onClick={() => setFileTypeModal(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (fileType && selectedGoal?._id) {
                generateGoalReport(fileType, selectedGoal._id);
              } else {
                toast.error("Please select a file type");
              }
            }}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        aria-labelledby="delete-goal-modal"
      >
        <Box sx={smallModalStyles}>
          <Typography variant="h6" mb={2} id="delete-goal-modal">
            Confirm Delete
          </Typography>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{selectedGoal?.name}</strong>? This action cannot be undone.
          </Typography>
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 2 }}
            justifyContent="flex-end"
            mt={3}
          >
            <Button
              variant="outlined"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              size={isMobile ? "small" : "medium"}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteGoal}
              disabled={isDeleting}
              startIcon={
                isDeleting ? <Loader2 className="animate-spin" /> : null
              }
              size={isMobile ? "small" : "medium"}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
};

export default Goals;
