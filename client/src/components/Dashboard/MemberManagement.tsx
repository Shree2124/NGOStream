import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";

interface Member {
  id: number;
  name: string;
  role: string;
}

interface NewUser {
  avatar?: string;
  gender: string;
  age: string;
  bio?: string;
  fullName: string;
  email: string;
  address: string;
  phone: string; // Changed to string for form input handling
  role: string;
}

const MemberManagement: React.FC = () => {
  const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<string>("All");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "John Doe", role: "Staff" },
    { id: 2, name: "Jane Smith", role: "Volunteer" },
    { id: 3, name: "Alice Brown", role: "Staff" },
    { id: 4, name: "Bob Green", role: "Volunteer" },
  ]);
  const [newMember, setNewMember] = useState<Member>({
    id: 0,
    name: "",
    role: "Staff",
  });

  const [newUser, setNewUser] = useState<NewUser>({
    gender: "",
    age: "",
    fullName: "",
    email: "",
    address: "",
    phone: "",
    role: "",
  });

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewMember({ id: 0, name: "", role: "Staff" });
  };

  const handleAddUser = () => {
    console.log("New User Data:", newUser);
    handleCloseModal();
  };

  const isFormValid =
    newUser.gender &&
    newUser.age &&
    newUser.fullName &&
    newUser.email &&
    newUser.address &&
    newUser.phone &&
    newUser.role;

  const filteredMembers = members.filter((member) => {
    return (
      (filter === "All" || member.role === filter) &&
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
          <Search />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            display: isSearchBarVisible ? "block" : { xs: "none", md: "block" },
          }}
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Staff">Staff</MenuItem>
          <MenuItem value="Volunteer">Volunteer</MenuItem>
        </Select>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenModal}
        >
          Add Member
        </Button>
      </Box>

      <List>
        {filteredMembers.map((member) => (
          <ListItem key={member.id}>
            <ListItemText
              primary={member.name}
              secondary={`Role: ${member.role}`}
            />
          </ListItem>
        ))}
      </List>

      <Modal open={showModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2}>
            Add New User
          </Typography>

          <Box sx={{ display: "flex", gap: 5, alignItems: "center", mb: 2 }}>
            {/* Image Upload Box */}
            <Box
              sx={{
                width: "10rem",
                height: "10.5rem",
                border: "1px dashed gray",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                borderRadius: 2,
                cursor: "pointer",
                backgroundColor: "background.default",
              }}
              onClick={() => {
                // Trigger file upload logic here
                document.getElementById("avatarUpload")?.click();
              }}
            >
              <Typography variant="h6" color="primary" fontWeight="bold">
                +
              </Typography>
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Update state with uploaded file or its URL
                    setNewUser({
                      ...newUser,
                      avatar: URL.createObjectURL(file),
                    });
                  }
                }}
              />
            </Box>

            {/* Name, Age, Gender */}
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
                }
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Age"
                type="number"
                variant="outlined"
                value={newUser.age}
                onChange={(e) =>
                  setNewUser({ ...newUser, age: e.target.value })
                }
                sx={{ mb: 2 }}
                required
              />
              <Select
                fullWidth
                value={newUser.gender}
                onChange={(e) =>
                  setNewUser({ ...newUser, gender: e.target.value })
                }
                sx={{ mb: 2 }}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Gender
                </MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Remaining Details */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Phone"
            type="tel"
            variant="outlined"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Address"
            variant="outlined"
            value={newUser.address}
            onChange={(e) =>
              setNewUser({ ...newUser, address: e.target.value })
            }
            sx={{ mb: 2 }}
            required
          />
          <Select
            fullWidth
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Role
            </MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
            <MenuItem value="Volunteer">Volunteer</MenuItem>
          </Select>
          <TextField
            fullWidth
            label="Bio"
            variant="outlined"
            value={newUser.bio || ""}
            onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
            sx={{ mb: 2 }}
            multiline
            rows={3}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddUser}
            disabled={!isFormValid}
          >
            Add User
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default MemberManagement;
