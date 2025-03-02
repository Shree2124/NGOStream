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
  FormControl,
  InputLabel,
  DialogContent,
  DialogTitle,
  Dialog,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Delete,
  DescriptionOutlined,
  Edit,
  PictureAsPdfOutlined,
  Search,
  TableChartOutlined,
  Visibility,
  Download,
} from "@mui/icons-material";
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
  createdAt?: string; // Changed to string for consistency with API responses
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
  } catch (error: any) {
    toast.error("Something went wrong while adding the user!");
    console.error("Error adding user:", error.message || error);
  }
};

const updateUser = async (
  userId: string,
  updatedUser: NewUser,
  existingUser: NewUser
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
  } catch (error: any) {
    toast.error("Something went wrong while deleting the user!");
    console.error("Error deleting user:", error.message || error);
  }
};

const MemberManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<NewUser | null>(null);

  const [openGenerateReportModal, setOpenGenerateReportModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [fileType, setFileType] = useState("pdf");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const firstEventStartDate = new Date(
    members.length > 0
      ? Math.min(...members.map((m) => new Date(m.createdAt || new Date()).getTime()))
      : new Date().getTime()
  );

  const lastEventEndDate = new Date(
    members.length > 0
      ? Math.max(...members.map((m) => new Date(m.createdAt || new Date()).getTime()))
      : new Date().getTime()
  );

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

  const handleGenerateReportModalClose = () => {
    setOpenGenerateReportModal(false);
  };

  const handlePeriodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedPeriod(event.target.value as string);
    setSelectedRange(null);
  };

  const generateSelectableRanges = () => {
    const ranges = [];
    const start = new Date(firstEventStartDate);
    const end = new Date(lastEventEndDate);

    if (selectedPeriod === "week") {
      const current = new Date(start);
      while (current <= end) {
        const weekStart = new Date(current);
        let weekEnd = new Date(current);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekEnd > end) weekEnd = new Date(end);
        ranges.push({
          label: `${weekStart.toDateString()} - ${weekEnd.toDateString()}`,
          value: { from: weekStart, to: weekEnd },
        });
        current.setDate(current.getDate() + 7);
      }
    } else if (selectedPeriod === "month") {
      const current = new Date(start);
      while (current <= end) {
        const monthStart = new Date(
          current.getFullYear(),
          current.getMonth(),
          1
        );
        let monthEnd = new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          0
        );
        if (monthEnd > end) monthEnd = new Date(end);
        ranges.push({
          label: `${monthStart.toDateString()} - ${monthEnd.toDateString()}`,
          value: { from: monthStart, to: monthEnd },
        });
        current.setMonth(current.getMonth() + 1);
      }
    } else if (selectedPeriod === "year") {
      const current = new Date(start);
      while (current <= end) {
        const yearStart = new Date(current.getFullYear(), 0, 1);
        let yearEnd = new Date(current.getFullYear(), 11, 31);
        if (yearEnd > end) yearEnd = new Date(end);
        ranges.push({
          label: `${yearStart.getFullYear()}`,
          value: { from: yearStart, to: yearEnd },
        });
        current.setFullYear(current.getFullYear() + 1);
      }
    }
    return ranges;
  };

  const generatePDFReport = async (filteredIds: string[], fileType: string) => {
    try {
      setReportLoading(true);
      const res = await api.post("/event/generate-report", {
        ids: filteredIds,
        fileType: fileType,
        type: "member",
      });
      if (res.data?.data) {
        setReportUrl(res.data.data);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setReportLoading(false);
    }
  };

  const generateReport = (selectedRange: string, fileType: string) => {
    if (!selectedRange || typeof selectedRange !== "string") {
      console.error("Invalid date range selected.");
      return;
    }

    let from: Date, to: Date;

    if (/^\d{4}$/.test(selectedRange)) {
      const year = parseInt(selectedRange);
      from = new Date(year, 0, 1);
      to = new Date(year, 11, 31, 23, 59, 59, 999);
    } else {
      const dateParts = selectedRange.split(" - ");
      if (dateParts.length !== 2) {
        console.error("Invalid date format.");
        return;
      }

      from = new Date(dateParts[0]);
      to = new Date(dateParts[1]);

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
    }

    const filteredMembers = members.filter((member) => {
      const createdAt = new Date(member.createdAt || new Date());
      return createdAt >= from && createdAt <= to;
    });

    const filteredIds = filteredMembers.map((member) => member._id);

    console.log("Filtered Member IDs:", filteredIds);
    console.log("File Type:", fileType);

    generatePDFReport(filteredIds, fileType);
  };

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
          selectedMember!
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
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await deleteUser(userId);
      if (res?.status === 200) setShowDeleteModal(false);
      setMembers((prev) => prev.filter((member) => member._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      (filter === "All" || member.role === filter) &&
      member?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
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
              onChange={(e) => setFilter(e.target.value as string)}
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
                          Description: {selectedMember.bio}
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
                    setNewUser({ ...newUser, gender: e.target.value as string })
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
                    setNewUser({ ...newUser, role: e.target.value as string })
                  }
                  displayEmpty
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="" disabled>
                    Select Role
                  </MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="Volunteer">Volunteer</MenuItem>
                </Select>
                <TextField
                  fullWidth
                  label="Description"
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

      {/* Generate Report Modal */}
      <Dialog
        open={openGenerateReportModal}
        onClose={handleGenerateReportModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            pt: 3,
            px: 3,
            typography: "h5",
            fontWeight: 600,
          }}
        >
          Generate Report
        </DialogTitle>

        <DialogContent sx={{ p: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Period Selection */}
            <FormControl fullWidth variant="outlined" sx={{ mt: 3 }}>
              <InputLabel id="period-label">Time Period</InputLabel>
              <Select
                labelId="period-label"
                value={selectedPeriod}
                onChange={handlePeriodChange}
                label="Time Period"
              >
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="year">Yearly</MenuItem>
              </Select>
            </FormControl>

            {/* Range Selection */}
            {selectedPeriod && (
              <FormControl fullWidth variant="outlined">
                <InputLabel id="range-label">Date Range</InputLabel>
                <Select
                  labelId="range-label"
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value as string)}
                  label="Date Range"
                >
                  {generateSelectableRanges()?.map((range, index) => (
                    <MenuItem key={index} value={range.label}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Report File Type */}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="file-type-label">File Format</InputLabel>
              <Select
                labelId="file-type-label"
                value={fileType}
                onChange={(e) => setFileType(e.target.value as string)}
                label="File Format"
              >
                <MenuItem value="word">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionOutlined color="primary" fontSize="small" />
                    <span>Word Document</span>
                  </Box>
                </MenuItem>
                <MenuItem value="excel">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TableChartOutlined color="success" fontSize="small" />
                    <span>Excel Spreadsheet</span>
                  </Box>
                </MenuItem>
                <MenuItem value="pdf">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PictureAsPdfOutlined color="error" fontSize="small" />
                    <span>PDF Document</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={handleGenerateReportModalClose}
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => {
              if (!selectedRange) {
                alert("Please select a date range.");
                return;
              }
              generateReport(selectedRange, fileType);
            }}
            disabled={reportLoading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {!reportUrl && "Generate Report"}
            {reportUrl && (
              <a
                href={reportUrl}
                download
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Download />
                Download Report
              </a>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Report Button */}
      <div className="text-right">
        <Button
          onClick={() => setOpenGenerateReportModal(true)}
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
    </Container>
  );
};

export default MemberManagement;