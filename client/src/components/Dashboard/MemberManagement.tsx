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
import { api } from "../../api/api";

interface NewUser {
  avatar?: File | string;
  gender: string;
  age: string;
  bio?: string;
  fullName: string;
  email: string;
  address: string;
  phone: string;
  role: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
}

const addUser = async (userData: NewUser) => {
  try {
    const formData = new FormData();

    if (userData.avatar && typeof userData.avatar === "object") {
      formData.append("avatar", userData.avatar);
    }
    if (userData.gender) formData.append("gender", userData.gender);
    if (userData.age) formData.append("age", userData.age.toString());
    if (userData.bio) formData.append("bio", userData.bio);
    if (userData.fullName) formData.append("fullName", userData.fullName);
    if (userData.email) formData.append("email", userData.email);
    if (userData.address) formData.append("address", userData.address);
    if (userData.phone) formData.append("phone", userData.phone);
    if (userData.role) formData.append("role", userData.role);

    const response = await api.post("/users/add-member", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status !== 200) {
      throw new Error("Failed to add member. Please try again.");
    }

    return response.data?.data;
  } catch (error: any) {
    console.error("Error adding user:", error?.message || error);
    throw new Error(error?.response?.data?.message || "An error occurred while adding the user.");
  }
};



const MemberManagement: React.FC = () => {
  const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<string>("All");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    setNewUser({
      gender: "",
      age: "",
      fullName: "",
      email: "",
      address: "",
      phone: "",
      role: "",
    });
    setImagePreview(null);
  };

  const handleAddUser = async () => {
    try {
      const result = await addUser(newUser);
      console.log("User added successfully:", result);
      setMembers((prev) => [...prev, result]);
      handleCloseModal();
    } catch (error) {
      console.error("Error adding user:", error);
    }
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
            <Box
              sx={{
                width: "10rem",
                height: "10rem",
                border: "1px dashed gray",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                borderRadius: 2,
                cursor: "pointer",
                backgroundColor: "background.default",
              }}
              onClick={() => document.getElementById("avatarUpload")?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "inherit",
                  }}
                />
              ) : (
                <Typography variant="h6" color="primary">
                  +
                </Typography>
              )}
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewUser({ ...newUser, avatar: file });
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </Box>

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
