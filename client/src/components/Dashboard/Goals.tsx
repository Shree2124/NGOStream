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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../../api/api";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

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

  const fetchGoalInfo = async (id: string) => {
    try {
      console.log(selectedGoal);

      const res = await api.get(`/goals/goal/${id}`);
      // console.log("res", res.data);
      setGoal(res.data.data);
      console.log(goal);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (selectedGoal?._id) {
      console.log("if ", selectedGoal);
      fetchGoalInfo(selectedGoal?._id?.toString());
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
      } else {
        const res = await api.post("/goals/create", {
          name,
          description,
          status,
          startDate,
          targetAmount,
        });
        setGoals((prevGoals) => [...prevGoals, res.data.data]);
      }
      setIsModalOpen(false);
      setCurrentGoal(null);
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleDeleteGoal = async () => {
    if (selectedGoal) {
      try {
        await api.delete(`/goals/delete/${selectedGoal._id}`);
        setGoals((prevGoals) =>
          prevGoals.filter((goal) => goal._id !== selectedGoal._id)
        );
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Error deleting goal:", error);
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
      try {
        const res = await api.get("/goals/all-goals");
        setGoals(res.data.data);
      } catch (error) {
        console.error("Error fetching goals:", error);
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
    plugins: {
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (tooltipItem: any) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
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

  return (
    <Box sx={{ p: 2, maxWidth: "100%", margin: "0" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          mb: 2,
        }}
      >
        <IconButton
          sx={{ display: { xs: "block", md: "none" } }}
          onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
        >
          <SearchIcon />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ display: { xs: "none", md: "block", lg: "block" } }}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 120 }}
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
        >
          Add Goal
        </Button>
      </Box>

      {isSearchBarVisible && (
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2, display: { md: "none", lg: "none", sx: "block" } }}
        />
      )}

      <List>
        {filteredGoals.map((goal) => (
          <ListItem key={goal._id} sx={{ borderBottom: "1px solid #ccc" }}>
            <Box sx={{ mr: "1.5rem" }}>
              <img
                src={goal.image}
                alt="Goal"
                style={{
                  width: "2rem",
                  height: "2rem",
                  objectFit: "cover",
                }}
              />
            </Box>
            <ListItemText
              primary={goal.name}
              secondary={`Description: ${goal.description}, Status: ${goal.status}`}
            />
            <Stack direction="row" spacing={1}>
              <IconButton onClick={() => handleViewGoal(goal)} title="View">
                <Visibility />
              </IconButton>
              <IconButton onClick={() => handleOpenModal(goal)} title="Edit">
                <Edit />
              </IconButton>
              <IconButton
                title="Delete"
                color="error"
                onClick={() => {
                  setSelectedGoal(goal);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Delete />
              </IconButton>
            </Stack>
          </ListItem>
        ))}
      </List>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ ...modalStyles, width: "50%" }}>
          <Typography variant="h6" mb={2}>
            {isEditing ? "Edit Goal" : "Add Goal"}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Target Amount"
              type="number"
              value={targetAmount || ""}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Start Date"
              type="date"
              value={startDate.split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Complete">Complete</MenuItem>
            </Select>

            {isEditing && (
              <Button variant="contained" component="label">
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
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
            <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddOrEditGoal}
              color="primary"
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
            width: "90%",
            maxWidth: "50rem", 
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: "1rem", 
            boxShadow: 24,
            padding: "2rem",
          }}
        >
          <Typography variant="h6" align="center">
            {selectedGoal?.name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              marginTop: "1.5rem",
            }}
          >
            
            <Box
              sx={{
                width: "100%",
                maxWidth: "25rem",
                height: "auto",
                margin: "0 auto",
                marginTop: "1.5rem",
              }}
            >
              <Pie data={chartData} options={chartOptions} />
            </Box>

            <Typography variant="h6" marginTop="2rem">
              Donor Information
            </Typography>
            <Box marginTop="1rem">
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: "25rem",
                  overflowY: "auto",
                }}
              >
                <Table stickyHeader>
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
                      
                      goal?.map((goalItem:IGoal, goalIndex: number) =>
                        goalItem?.donations?.map((donation:IDonations, donationIndex: number) => {
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
                            <TableRow key={`${goalIndex}-${donationIndex}`}>
                              <TableCell>{donorName}</TableCell>
                              <TableCell>{donorEmail}</TableCell>
                              <TableCell>{donatedAmount}</TableCell>
                            </TableRow>
                          );
                        })
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
          </Box>
        </Box>
      </Modal>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box sx={{ ...modalStyles }}>
          <Typography variant="h6">Confirm Delete</Typography>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to delete this goal?
          </Typography>
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
            <Button
              variant="outlined"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteGoal}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default Goals;
