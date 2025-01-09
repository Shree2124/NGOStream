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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../../api/api";

const Goals: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [goals, setGoals] = useState<any | unknown>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<number>();
  const [startDate, setStartDate] = useState<Date | string>(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<string>("Active");
  //   const isMobile = useMediaQuery('(max-width:600px)');

  const handleAddGoal = async () => {
    if (name.trim() && description.trim() && typeof targetAmount === "number") {
        console.log({name, description, startDate, targetAmount, status});
        
        const res = await api.post("/goals/create",{name, description, targetAmount, startDate,status})
        console.log(res.data.data);
        
    //   setGoals([...goals, name]);
      setName("");
      setDescription("");
      setTargetAmount(0);
      setStartDate(new Date().toISOString().split("T")[0]);
      setStatus("Active");
      setIsModalOpen(false);
    }
  };

  const filteredGoals = goals.filter((goal) =>
    goal.toLowerCase().includes(searchQuery.toLowerCase())
  );


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
            display: { xs: "block", md: "none", lg: "none" },
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
            display: { xs: "none", md: "block", lg: "block" },
          }}
        />
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
            <ListItemText primary={goal} />
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
            placeholder="Enter goal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Description"
            placeholder="Enter goal description"
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
            placeholder="Enter target amount"
            value={targetAmount}
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
