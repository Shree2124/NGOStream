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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../../api/api";

const Goals: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<string>("Active");

  const handleAddGoal = async () => {
    if (name.trim() && description.trim() && typeof targetAmount === "number") {
      const newGoal = { name, description, targetAmount, startDate, status };

      const res = await api.post("/goals/create", newGoal);
      setGoals((prevGoals) => [...prevGoals, res.data.data]);

      setName("");
      setDescription("");
      setTargetAmount(undefined);
      setStartDate(new Date().toISOString().split("T")[0]);
      setStatus("Active");
      setIsModalOpen(false);
    }
  };

  const filteredGoals = goals.filter((goal) => {
    const matchesSearchQuery =
      goal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || goal.status === statusFilter;
    return matchesSearchQuery && matchesStatus;
  });

  useEffect(() => {
    const fetchGoals = async () => {
      const res = await api.get("/goals/all-goals");
      setGoals(res.data.data);
    };
    fetchGoals();
  }, []);

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
          sx={{
            display: { xs: "block", md: "none" },
          }}
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
          sx={{
            display: { xs: "none", md: "block" },
          }}
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
          onClick={() => setIsModalOpen(true)}
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
          sx={{ mb: 2 }}
        />
      )}

      <List>
        {filteredGoals.map((goal, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={goal.name}
              secondary={`Description: ${goal.description}, Status: ${goal.status}`}
            />
          </ListItem>
        ))}
      </List>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add a New Goal
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Target Amount"
            value={targetAmount || ""}
            onChange={(e) => setTargetAmount(Number(e.target.value))}
            type="number"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Status"
            select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Complete">Complete</MenuItem>
          </TextField>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddGoal}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Goals;
