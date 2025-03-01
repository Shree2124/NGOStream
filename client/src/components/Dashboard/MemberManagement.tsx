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
  Grid,
  useMediaQuery,
  useTheme,
  Card,
  Divider,
  Container,
} from "@mui/material";
import { Add, Delete, Edit, Search, Visibility } from "@mui/icons-material";
import { api } from "../../api/api";
import toast from "react-hot-toast";

interface NewUser {
  _id?: string;
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

    if (response.status !== 201) {
      throw new Error("Failed to add member. Please try again.");
    }

    return response.data?.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.error("Something went wrong while adding the user!");
    console.error("Error adding user:", error.message || error);
  }
};

const updateUser = async (
  userId: string,
  updatedUser: NewUser,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingUser: NewUser | any
) => {
  try {
    const updatedFields = Object.entries(updatedUser).reduce(
      (acc, [key, value]) => {
        if (existingUser[key as keyof NewUser] !== value) {
          acc[key as keyof NewUser] = value;
        }
        return acc;
      },
      {} as Partial<NewUser>
    );

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

    if (response.status !== 200) {
      throw new Error("Failed to update user. Please try again.");
    }

    toast.success("User updated successfully!");
    return response.data?.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.error("Something went wrong while updating the user!");
    console.error("Error updating user:", error.message || error);
  }
};

const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/users/delete-member/${userId}`);
    if (response.status !== 200) {
      throw new Error("Failed to delete user. Please try again.");
    }

    toast.success("User deleted successfully!");
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.error("Something went wrong while deleting the user!");
    console.error("Error deleting user:", error.message || error);
  }
};

const MemberManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
  const [selectedMember, setSelectedMember] = useState<NewUser | null>(null);

  const handleViewDetails = (member: NewUser) => {
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
      const participants = res.data?.data?.filter(
        (member: NewUser) => member.role !== "Attendee"
      );
      setMembers(participants);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleConfirmDelete = (userId: string | null) => {
    if (userId) {
      setDeleteMemberId(userId);
      setShowDeleteModal(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteMemberId(null);
  };

  const handleOpenModal = (user?: NewUser, id?: string) => {
    if (user && id) {
      setIsEdit(true);
      setCurrentUserId(id);

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
        toast.success("User added successfully!");
        setMembers((prev) => [...prev, addedUser]);
        setShowModal(false);
        await fetchUsers();
      }
      handleCloseModal();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await deleteUser(userId);
      if (res?.status === 200) setShowDeleteModal(false);
      setMembers((prev) => prev.filter((member) => member._id !== userId));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
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
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* Search and Filter Section */}
      <Card
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          transition: "box-shadow 0.3s ease",
          backdropFilter: "blur(10px)",
          boxShadow: "0 5px 5px rgba(71, 117, 234, 0.12)",
          border: "1px solid rgba(229, 231, 235, 0.5)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <IconButton>
                    <Search />
                  </IconButton>
                ),
              }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              fullWidth
              size={isMobile ? "small" : "medium"}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Volunteer">Volunteer</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setShowModal(true)}
              sx={{
                padding: (!isMobile && 2) || 0,
                display: "flex",
                flexDirection: "row",
                fontSize: isMobile ? "0.75rem" : "1rem",
                gap: 1,
              }}
            >
              <Add />
              Add Member
            </Button>
          </Grid>
        </Grid>
      </Card>
      {/* Members List */}
      <Card
        sx={{
          borderRadius: 2,
          transition: "box-shadow 0.3s ease",
          backdropFilter: "blur(10px)",
          boxShadow: "0 12px 20px rgba(71, 117, 234, 0.12)",
          border: "1px solid rgba(229, 231, 235, 0.5)",
        }}
      >
        <List sx={{ p: 0 }}>
          {filteredMembers.map((member: NewUser, index) => (
            <React.Fragment key={member._id}>
              <ListItem
                sx={{
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  py: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    mb: isMobile ? 2 : 0,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={
                        member?.avatar instanceof File
                          ? URL.createObjectURL(member.avatar)
                          : member?.avatar || ""
                      }
                      alt={member.fullName}
                      sx={{ width: 50, height: 50 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant={isMobile ? "subtitle1" : "h6"}>
                        {member.fullName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {member.role} • {member.email}
                      </Typography>
                    }
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
                    onClick={() => handleViewDetails(member)}
                    size={isMobile ? "small" : "medium"}
                    variant="outlined"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 1,
                    }}
                  >
                    <Visibility />
                    {!isMobile && "View"}
                  </Button>
                  <Button
                    onClick={() => handleOpenModal(member, member._id)}
                    size={isMobile ? "small" : "medium"}
                    variant="outlined"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 1,
                    }}
                  >
                    <Edit />
                    {!isMobile && "Edit"}
                  </Button>
                  <Button
                    onClick={() =>
                      handleConfirmDelete(member?._id?.toString() || "")
                    }
                    size={isMobile ? "small" : "medium"}
                    variant="outlined"
                    color="error"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 1,
                    }}
                  >
                    <Delete />
                    {!isMobile && "Delete"}
                  </Button>
                </Stack>
              </ListItem>
              {index < filteredMembers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Card>

      {/* View Modal */}
      <Modal open={showViewModal} onClose={handleCloseViewModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 500,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2}>
            Member Details
          </Typography>
          {selectedMember && (
            <Box>
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                mb={2}
                alignItems={isMobile ? "center" : "flex-start"}
              >
                <Avatar
                  src={
                    selectedMember?.avatar instanceof File
                      ? URL.createObjectURL(selectedMember.avatar)
                      : selectedMember?.avatar || ""
                  }
                  alt={selectedMember?.fullName}
                  sx={{ width: 100, height: 100 }}
                />
                <Box sx={{ width: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedMember.fullName}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Gender: {selectedMember.gender}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Age: {selectedMember.age}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Email: {selectedMember.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {selectedMember.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Address: {selectedMember.address}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Role: {selectedMember.role}
                      </Typography>
                    </Grid>
                    {selectedMember.bio && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Bio: {selectedMember.bio}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Stack>
              <Button
                fullWidth
                variant="contained"
                onClick={handleCloseViewModal}
              >
                Close
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 500,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2}>
            {isEdit ? "Edit User" : "Add New User"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1",
                  border: "1px dashed gray",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  borderRadius: 1,
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
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <Add />
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
            </Grid>
            <Grid item xs={12} sm={8}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullName: e.target.value })
                  }
                  required
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={newUser.age}
                  onChange={(e) =>
                    setNewUser({ ...newUser, age: e.target.value })
                  }
                  required
                  size={isMobile ? "small" : "medium"}
                />
                <Select
                  fullWidth
                  value={newUser.gender}
                  onChange={(e) =>
                    setNewUser({ ...newUser, gender: e.target.value })
                  }
                  displayEmpty
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="" disabled>
                    Select Gender
                  </MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  required
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  label="Address"
                  value={newUser.address}
                  onChange={(e) =>
                    setNewUser({ ...newUser, address: e.target.value })
                  }
                  required
                  size={isMobile ? "small" : "medium"}
                />
                <Select
                  fullWidth
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  displayEmpty
                  size={isMobile ? "small" : "medium"}
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
                  value={newUser.bio || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, bio: e.target.value })
                  }
                  multiline
                  rows={3}
                  size={isMobile ? "small" : "medium"}
                />
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              {isEdit ? "Update" : "Add"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={handleCancelDelete}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 400,
            bgcolor: "background.paper",
            p: 3,
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
    </Container>
  );
};

export default MemberManagement;
