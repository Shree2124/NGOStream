/*TODO:Duplicate key error yetoy solve krshil  */

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
  // ListItemText,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../../api/api";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentGoal, setCurrentGoal] = useState<IGoal | null>(null);
  // const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
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
  };

  const fetchGoalInfo = async (id: string) => {
    setIsLoadingGoal(true);
    try {
      const res = await api.get(`/goals/goal/${id}`);
      setGoal(res.data.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Failed to fetch goals. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const modalStyles = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
    width: isMobile ? "90%" : isTablet ? "70%" : "50%",
    maxHeight: "90vh",
    overflowY: "auto",
  };

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (tooltipItem: any) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
      legend: {
        position: isMobile ? ("bottom" as const) : ("right" as const),
      },
    },
    rotation: 45,
    animation: {
      animateScale: true,
      animateRotate: true,
    },
    cutout: "50%",
    elements: {
      arc: {
        borderWidth: 5,
        borderColor: "rgba(0, 0, 0, 0.2)",
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
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
              size={isMobile ? "small" : "medium"}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Complete">Complete</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal(null)}
              sx={{
                padding: (!isMobile && 2) || 0.75,
                display: "flex",
                flexDirection: "row",
                fontSize: isMobile ? "0.75rem" : "1rem",
              }}
            >
              Add Goal
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Goals List */}
      <Card>
        <List sx={{ p: 0 }}>
          {filteredGoals.map((goal, index) => (
            <React.Fragment key={goal._id}>
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 2, sm: 0 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: { xs: "100%", sm: "auto" },
                    flex: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={goal.image}
                    alt={goal.name}
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 500, mb: 0.5 }}
                    >
                      {goal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {goal.status} • Target: ${goal.targetAmount}
                    </Typography>
                  </Box>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    width: isMobile ? "100%" : "auto",
                    justifyContent: isMobile ? "center" : "flex-end",
                  }}
                >
                  <Button
                    startIcon={<Visibility />}
                    onClick={() => handleViewGoal(goal)}
                    size={isMobile ? "small" : "medium"}
                    variant="outlined"
                    sx={{ flex: { xs: 1, sm: "none" } }}
                  >
                    {!isMobile && "View"}
                  </Button>
                  <Button
                    startIcon={<Edit />}
                    onClick={() => handleOpenModal(goal)}
                    size={isMobile ? "small" : "medium"}
                    variant="outlined"
                    sx={{ flex: { xs: 1, sm: "none" } }}
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
                    sx={{ flex: { xs: 1, sm: "none" } }}
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

      {/* Add/Edit Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={modalStyles}>
          <Typography variant="h6" mb={2}>
            {isEditing ? "Edit Goal" : "Add Goal"}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Target Amount"
              type="number"
              value={targetAmount || ""}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Start Date"
              type="date"
              value={startDate.split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              size={isMobile ? "small" : "medium"}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Complete">Complete</MenuItem>
            </Select>

            {isEditing && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  size={isMobile ? "small" : "medium"}
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
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Stack>
          <Box
            sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddOrEditGoal}
              disabled={isSaving}
              startIcon={isSaving && <Loader2 className="animate-spin" />}
            >
              {isEditing ? "Save Changes" : "Add Goal"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* View Modal */}
      <Modal open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
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
            <Stack spacing={3}>
              <Typography variant="h6" align="center">
                {selectedGoal?.name}
              </Typography>

              <Box
                sx={{
                  height: isMobile ? "200px" : "300px",
                  position: "relative",
                }}
              >
                <Pie data={chartData} options={chartOptions} />
              </Box>

              <Typography variant="h6">Donor Information</Typography>

              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Donor Name</TableCell>
                      <TableCell>Donor Email</TableCell>
                      <TableCell>Donated Amount</TableCell>
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
                              <TableCell>
                                {donation.donorName?.trim() || "Unknown"}
                              </TableCell>
                              <TableCell>
                                {donation.donorEmail?.trim() || "Unknown"}
                              </TableCell>
                              <TableCell>${donation.amount}</TableCell>
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
            </Stack>
          )}
          <div className="text-right">
            <Button
              onClick={() => generateReport()}
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
      </Modal>

      <Dialog
        open={fileTypeModal}
        onClose={() => {
          setFileTypeModal(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Report Period</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
            onClick={() => setFileTypeModal(false)}
            sx={{ color: "gray" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (fileType) generateGoalReport(fileType, selectedGoal!._id);
              else {
                alert("Select file type");
                setFileTypeModal(true);
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
      >
        <Box sx={{ ...modalStyles, width: isMobile ? "90%" : 400 }}>
          <Typography variant="h6" mb={2}>
            Confirm Delete
          </Typography>
          <Typography>Are you sure you want to delete this goal?</Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
            <Button
              variant="outlined"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteGoal}
              disabled={isDeleting}
              startIcon={isDeleting && <Loader2 className="animate-spin" />}
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
