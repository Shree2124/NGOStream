import React, { useEffect, useState } from "react";
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
  ListItemAvatar,
  Avatar,
  Stack,
} from "@mui/material";
import { Add, Delete, Edit, Search, Visibility } from "@mui/icons-material";
import { api } from "../../api/api";

interface NewUser {
  _id?: any;
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

interface Member extends NewUser {
  _id: string;
}

const addUser = async (userData: NewUser) => {
  try {
    const formData = new FormData();

    if (userData.avatar && typeof userData.avatar === "object") {
      formData.append("avatar", userData.avatar);
    }
    formData.append("gender", userData.gender);
    formData.append("age", userData.age);
    if (userData.bio) formData.append("bio", userData.bio);
    formData.append("fullName", userData.fullName);
    formData.append("email", userData.email);
    formData.append("address", userData.address);
    formData.append("phone", userData.phone);
    formData.append("role", userData.role);

    const response = await api.post("/users/add-member", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status !== 200) {
      throw new Error("Failed to add member. Please try again.");
    }

    return response.data?.data;
  } catch (error) {
    console.error("Error adding user:", error.message || error);
    throw new Error(error.response?.data?.message || "Error adding the user.");
  }
};

const updateUser = async (
  userId: string,
  updatedUser: NewUser,
  existingUser: NewUser | any
) => {
  try {
    console.log(userId);

    const updatedFields = Object.entries(updatedUser).reduce(
      (acc, [key, value]) => {
        if (existingUser[key as keyof NewUser] !== value) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Partial<NewUser>
    );

    console.log(updatedFields);

    const response = await api.put(
      `/users/edit-member/${userId}`,
      updatedFields,
      {
        headers: {
          "Content-Type": updatedFields.avatar
            ? "multipart/form-data"
            : "application/json",
        },
      }
    );

    console.log(response.data.data);

    if (response.status !== 200) {
      throw new Error("Failed to update user. Please try again.");
    }
    return response.data?.data;
  } catch (error) {
    console.error("Error updating user:", error.message || error);
    throw new Error(
      error.response?.data?.message || "Error updating the user."
    );
  }
};

const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/users/delete-member/${userId}`);
    if (response.status !== 200) {
      throw new Error("Failed to delete user. Please try again.");
    }
    return response;
  } catch (error) {
    console.error("Error deleting user:", error.message || error);
    throw new Error(
      error.response?.data?.message || "Error deleting the user."
    );
  }
};

const MemberManagement: React.FC = () => {
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedMember(null);
  };

  const [newUser, setNewUser] = useState<NewUser>({
    gender: "",
    age: "",
    fullName: "",
    email: "",
    address: "",
    phone: "",
    role: "",
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/all-members");
      setMembers(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleConfirmDelete = (userId: string) => {
    console.log(userId);

    setDeleteMemberId(userId);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteMemberId(null);
  };

  const handleOpenModal = (user?: Member, id?: string) => {
    console.log("Incoming ID:", id);

    if (user && id) {
      setIsEdit(true);
      setCurrentUserId(id);
      console.log("Set Current User ID:", id);
      setNewUser(user);
      setSelectedMember(user);
      setImagePreview(
        user.avatar && typeof user.avatar === "string" ? user.avatar : null
      );
    } else {
      setIsEdit(false);
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
    }

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
    setIsEdit(false);
    setCurrentUserId(null);
  };

  const handleSubmit = async () => {
    console.log("submitting", isEdit, currentUserId);

    try {
      if (isEdit && currentUserId) {
        const updatedUser = await updateUser(
          currentUserId,
          newUser,
          selectedMember
        );
        setMembers((prev) =>
          prev.map((member) =>
            member._id === currentUserId ? updatedUser : member
          )
        );
      } else {
        const addedUser = await addUser(newUser);
        setMembers((prev) => [...prev, addedUser]);
        setShowModal(false)
        fetchUsers()

      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await deleteUser(userId);
      if (res.status === 200) setShowDeleteModal(false);
      setMembers((prev) => prev.filter((member) => member.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      (filter === "All" || member.role === filter) &&
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFormValid =
    newUser.gender &&
    newUser.age &&
    newUser.fullName &&
    newUser.email &&
    newUser.address &&
    newUser.phone &&
    newUser.role;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <IconButton onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}>
          <Search />
        </IconButton>
        <TextField
          fullWidth
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            display: isSearchBarVisible ? "block" : { xs: "none", md: "block" },
          }}
        />
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Staff">Staff</MenuItem>
          <MenuItem value="Volunteer">Volunteer</MenuItem>
        </Select>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Add Member
        </Button>
      </Box>

      <List>
        {filteredMembers.map((member) => (
          <ListItem key={member.id}>
            <ListItemAvatar>
              <Avatar src={member.avatar || ""} alt={member.fullName} />
            </ListItemAvatar>
            <ListItemText
              primary={member.fullName}
              secondary={`Role: ${member.role}`}
            />
            <Stack direction="row" spacing={1}>
              <IconButton
                title="View"
                onClick={() => handleViewDetails(member)}
              >
                <Visibility />
              </IconButton>
              <IconButton
                title="Edit"
                onClick={() => handleOpenModal(member, member._id)}
              >
                <Edit />
              </IconButton>
              <IconButton
                title="Delete"
                onClick={() => handleConfirmDelete(member._id)}
                color="error"
              >
                <Delete />
              </IconButton>
            </Stack>
          </ListItem>
        ))}
      </List>

      <Modal open={showViewModal} onClose={handleCloseViewModal}>
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
            Member Details
          </Typography>
          {selectedMember && (
            <Box>
              <Stack direction="row" spacing={2} mb={2}>
                <Avatar
                  src={
                    selectedMember?.avatar ||
                    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                  }
                  alt={selectedMember.fullName}
                  sx={{ width: 100, height: 100 }}
                />
                <Box>
                  <Typography variant="body1">
                    <strong>Full Name:</strong> {selectedMember.fullName}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Gender:</strong> {selectedMember.gender}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Age:</strong> {selectedMember.age}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="body1" mb={1}>
                <strong>Email:</strong> {selectedMember.email}
              </Typography>
              <Typography variant="body1" mb={1}>
                <strong>Phone:</strong> {selectedMember.phone}
              </Typography>
              <Typography variant="body1" mb={1}>
                <strong>Address:</strong> {selectedMember.address}
              </Typography>
              <Typography variant="body1" mb={1}>
                <strong>Role:</strong> {selectedMember.role}
              </Typography>
              {selectedMember.bio && (
                <Typography variant="body1" mb={1}>
                  <strong>Bio:</strong> {selectedMember.bio}
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleCloseViewModal}
              >
                Close
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

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
            {isEdit ? "Edit User" : "Add New User"}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: "100px",
                height: "100px",
                border: "1px dashed gray",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("avatarUpload")?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                "+"
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
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            {isEdit ? "Update" : "Add"}
          </Button>
        </Box>
      </Modal>

      <Modal open={showDeleteModal} onClose={handleCancelDelete}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2}>
            Confirm Delete
          </Typography>
          <Typography variant="body1" mb={3}>
            Are you sure you want to delete this member? This action cannot be
            undone.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => deleteMemberId && handleDelete(deleteMemberId)}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default MemberManagement;
