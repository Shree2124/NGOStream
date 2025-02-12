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
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  useMediaQuery,
  Container,
  CircularProgress,
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
  const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<IGoal | null>(null);

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
        const res = await api.get("/goals/all-goals");
        setGoals(res.data.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      } catch (error: any) {
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
    <Container maxWidth={false} disableGutters>
      <Box
        sx={{
          p: isMobile ? 1 : 2,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          sx={{
            mb: 2,
            width: "100%",
            justifyContent: "space-between",
          }}
          alignItems="center"
        >
          {isMobile && (
            <IconButton
              onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
            >
              <SearchIcon />
            </IconButton>
          )}

          {(!isMobile || isSearchBarVisible) && (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size={isMobile ? "small" : "medium"}
              sx={{ flex: 2 }}
            />
          )}

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: isMobile ? "100%" : 200,
              flex: isMobile ? 1 : 0.5,
            }}
            size={isMobile ? "small" : "medium"}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Complete">Complete</MenuItem>
          </Select>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal(null)}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
            sx={{
              paddingTop: isMobile ? "auto" : 2,
              paddingBottom: isMobile ? "auto" : 2,
            }}
          >
            Add Goal
          </Button>
        </Stack>

        <List
          sx={{
            p: 0,
            width: "100%",
            bgcolor: "background.paper",
          }}
        >
          {filteredGoals.map((goal) => (
            <ListItem
              key={goal._id}
              sx={{
                borderBottom: "1px solid #ccc",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? 1 : 0,
                padding: isMobile ? 1 : 2,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: isMobile ? "100%" : "auto",
                  gap: 2,
                  flex: 1,
                }}
              >
                <img
                  src={goal.image}
                  alt="Goal"
                  style={{
                    width: isMobile ? "3rem" : "2rem",
                    height: isMobile ? "3rem" : "2rem",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
                <ListItemText
                  primary={goal.name}
                  secondary={`Description: ${goal.description}, Status: ${goal.status}`}
                  sx={{
                    flex: 1,
                    "& .MuiListItemText-primary": {
                      fontSize: isMobile ? "0.9rem" : "1rem",
                    },
                    "& .MuiListItemText-secondary": {
                      fontSize: isMobile ? "0.8rem" : "0.875rem",
                    },
                  }}
                />
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
                >
                  {!isMobile && "View"}
                </Button>
                <Button
                  startIcon={<Edit />}
                  onClick={() => handleOpenModal(goal)}
                  size={isMobile ? "small" : "medium"}
                  variant="outlined"
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
                >
                  {!isMobile && "Delete"}
                </Button>
              </Stack>
            </ListItem>
          ))}
        </List>

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box
            sx={{
              ...modalStyles,
              width: isMobile ? "90%" : isTablet ? "70%" : "60%",
              maxWidth: "1200px",
            }}
          >
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
                <Button
                  variant="contained"
                  component="label"
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
              )}

              {imagePreview && isEditing && (
                <Box>
                  <img
                    src={imagePreview}
                    alt="Goal"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}
            </Stack>
            <Stack
              direction={isMobile ? "column" : "row"}
              justifyContent="flex-end"
              spacing={2}
              mt={3}
            >
              <Button
                variant="outlined"
                onClick={() => setIsModalOpen(false)}
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddOrEditGoal}
                color="primary"
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                disabled={isSaving}
                startIcon={isSaving && <Loader2 className="animate-spin" />}
              >
                {isEditing ? "Save Changes" : "Add Goal"}
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Modal open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <Box
            sx={{
              ...modalStyles,
              width: isMobile ? "95%" : isTablet ? "80%" : "70%",
              maxWidth: "1400px",
              maxHeight: "90vh",
              overflowY: "auto",
              bgcolor: "background.paper",
              borderRadius: "1rem",
              padding: isMobile ? "1rem" : "2rem",
            }}
          >
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
              <>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  align="center"
                  sx={{ mb: 2 }}
                >
                  {selectedGoal?.name}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: isMobile ? "200px" : "300px",
                      position: "relative",
                      margin: "0 auto",
                    }}
                  >
                    <Pie data={chartData} options={chartOptions} />
                  </Box>

                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    sx={{ mt: 2 }}
                  >
                    Donor Information
                  </Typography>

                  <TableContainer
                    component={Paper}
                    sx={{
                      maxHeight: isMobile ? "300px" : "400px",
                      overflowY: "auto",
                    }}
                  >
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
                              (donation: IDonations, donationIndex: number) => {
                                const donorName =
                                  donation.donorName?.trim() || "Unknown";
                                const donorEmail =
                                  donation.donorEmail?.trim() || "Unknown";
                                const donatedAmount =
                                  donation.amount !== null &&
                                  donation.amount !== undefined &&
                                  typeof donation.amount === "number"
                                    ? donation.amount
                                    : "Unknown";

                                return (
                                  <TableRow
                                    key={`${goalIndex}-${donationIndex}`}
                                  >
                                    <TableCell
                                      sx={{
                                        maxWidth: isMobile ? "100px" : "200px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {donorName}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        maxWidth: isMobile ? "100px" : "200px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {donorEmail}
                                    </TableCell>
                                    <TableCell>{donatedAmount}</TableCell>
                                  </TableRow>
                                );
                              }
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
                </Box>
              </>
            )}
          </Box>
        </Modal>

        <Modal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <Box
            sx={{
              ...modalStyles,
              width: isMobile ? "90%" : "400px",
            }}
          >
            <Typography variant={isMobile ? "subtitle1" : "h6"}>
              Confirm Delete
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Are you sure you want to delete this goal?
            </Typography>
            <Stack
              direction={isMobile ? "column" : "row"}
              justifyContent="flex-end"
              spacing={2}
              mt={2}
            >
              <Button
                variant="outlined"
                onClick={() => setIsDeleteModalOpen(false)}
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteGoal}
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                disabled={isDeleting}
                startIcon={isDeleting && <Loader2 className="animate-spin" />}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </Container>
  );
};

export default Goals;
