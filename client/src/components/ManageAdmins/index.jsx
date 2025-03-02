import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { Delete, Edit, Add } from "@mui/icons-material";
import { toast, Toaster } from "react-hot-toast";
import { api } from "./../../api/api.ts";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Fetch admins
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get("/manage-admin/list");
      setAdmins(response?.data || []);
    } catch (error) {
      toast.error("Failed to fetch admins");
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddDialogOpen = () => {
    setFormData({
      name: "",
      email: "",
    });
    setOpenAddDialog(true);
  };

  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
  };

  const handleDeleteDialogOpen = (admin) => {
    setSelectedAdmin(admin);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedAdmin(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddAdmin = async () => {
    // Val_idate form
    if (!formData.name || !formData.email) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/manage-admin/create", {
        ...formData,
      });

      if (!response) {
        toast.error("Something went wrong while adding the admin!");
        return;
      }

      // Add the new admin to the state
      // Using the response data instead of undefined newAdmin variable
      const newAdmin = response?.data;
      console.log("amin: ", newAdmin);

      setAdmins([...admins, newAdmin]);
      handleAddDialogClose();
      toast.success("Admin added successfully");
    } catch (error) {
      toast.error("Failed to add admin");
      console.error("Error adding admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    console.log("seelected: am_idn: ", selectedAdmin);

    setLoading(true);
    try {
      const response = await api.delete(
        `/manage-admin/delete/${selectedAdmin.email}`
      );

      if (!response) {
        toast.error("Something went wrong while deleting the admin!");
        return;
      }

      const updatedAdmins = admins.filter(
        (admin) => admin._id !== selectedAdmin._id
      );
      setAdmins(updatedAdmins);
      handleDeleteDialogClose();
      toast.success("Admin deleted successfully");
    } catch (error) {
      toast.error("Failed to delete admin");
      console.error("Error deleting admin:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW_idth="lg">
      <Toaster position="top-right" />

      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Management
        </Typography>

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: "div_ider" }}
          >
            <Tab label="All Admins" />
            <Tab label="Manage Admins" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">All Administrators</Typography>
                </Box>

                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>

                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {admins?.length > 0 ? (
                          admins.map((admin) => (
                            <TableRow key={admin?._id || admin?.email}>
                              <TableCell>{admin?.name}</TableCell>
                              <TableCell>{admin?.email}</TableCell>

                              <TableCell>
                                <IconButton color="primary" size="small">
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteDialogOpen(admin)}
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No admins found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Manage Administrators
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={handleAddDialogOpen}
                  sx={{ mb: 3 }}
                >
                  Add New Administrator
                </Button>

                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>

                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {admins?.length > 0 ? (
                          admins.map((admin) => (
                            <TableRow key={admin?._id || admin?.email}>
                              <TableCell>{admin?.name}</TableCell>
                              <TableCell>{admin?.email}</TableCell>

                              <TableCell>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteDialogOpen(admin)}
                                  startIcon={<Delete />}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No admins found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Add Admin Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add New Administrator</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the administrator details below. All fields marked with * are
            required.
          </DialogContentText>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Full Name *"
              type="text"
              fullW_idth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              sx={{ mt: 2 }}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address *"
              type="email"
              fullW_idth
              variant="outlined"
              value={formData.email}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleAddAdmin}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Add Admin"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {selectedAdmin?.name} from
            administrators? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAdmin}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminManagement;
