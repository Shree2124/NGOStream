import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { api } from "../../api/api";

// Define Scheme Type
interface Scheme {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  category: string;
}

const SchemesPage = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [newScheme, setNewScheme] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    category: "",
  });

  const [editScheme, setEditScheme] = useState<Scheme | null>(null);
  const [viewScheme, setViewScheme] = useState<Scheme | null>(null);
  const [openDialog, setOpenDialog] = useState(true);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Fetch Schemes
  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/schemes/schemes");
      setSchemes(response.data.data.schemes);
      setFilteredSchemes(response.data.data.schemes);
      setError(null);
    } catch (err) {
      setError("Error fetching schemes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    resetForm(); // Ensure form is empty for new entry
    setOpenDialog(true);
  };

  // Handle Create or Update
  const handleCreateOrUpdateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newScheme,
        budget: Number(newScheme.budget), // Convert budget to number
      };
  
      if (editScheme) {
        await api.put(`/schemes/${editScheme._id}`, payload);
      } else {
        await api.post(`/schemes/scheme`, payload); // Fixed endpoint
      }
      fetchSchemes();
      resetForm();
    } catch (err) {
      setError("Error saving scheme");
    }
  };

  // Handle Delete
  const handleDeleteScheme = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/schemes/${id}`);
      fetchSchemes();
    } catch (err) {
      setError("Error deleting scheme");
    } finally {
      setDeleting(null);
    }
  };

  // Handle Edit Click
  const handleEditClick = (scheme: Scheme) => {
    setEditScheme(scheme);
    setNewScheme({
      name: scheme.name,
      description: scheme.description,
      startDate: scheme.startDate,
      endDate: scheme.endDate,
      budget: scheme.budget.toString(),
      category: scheme.category,
    });
    setOpenDialog(true);
  };

  // Handle View Click
  const handleViewClick = (scheme: Scheme) => {
    setViewScheme(scheme);
    setOpenViewDialog(true);
  };

  // Reset Form
  const resetForm = () => {
    setNewScheme({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: "",
      category: "",
    });
    setEditScheme(null);
    setOpenDialog(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      setFilteredSchemes(
        schemes.filter((scheme) =>
          scheme.name.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    } else {
      setFilteredSchemes(schemes);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ my: 3 }}>
        Schemes Management
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      {/* Search Bar */}
      <TextField
        label="Search Schemes"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />

      {/* Add / Edit Scheme Button */}
      <Button
      variant="contained"
      color="primary"
      sx={{ mb: 2 }}
      onClick={handleOpenAddDialog} // Fixed to correctly open the dialog
    >
      Add Scheme
    </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSchemes?.map((scheme) => (
                <TableRow key={scheme._id}>
                  <TableCell>{scheme.name}</TableCell>
                  <TableCell>{scheme.description}</TableCell>
                  <TableCell>{scheme.startDate}</TableCell>
                  <TableCell>{scheme.endDate}</TableCell>
                  <TableCell>₹{scheme.budget}</TableCell>
                  <TableCell>{scheme.category}</TableCell>
                  <TableCell>
                    <Tooltip title="View">
                      <IconButton color="info" onClick={() => handleViewClick(scheme)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleEditClick(scheme)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteScheme(scheme._id)}
                        disabled={deleting === scheme._id}
                      >
                        {deleting === scheme._id ? <CircularProgress size={24} /> : <Delete />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Scheme Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenViewDialog(false)}>
        <DialogTitle>Scheme Details</DialogTitle>
        <DialogContent>
          {viewScheme && (
            <>
              <Typography><b>Name:</b> {viewScheme.name}</Typography>
              <Typography><b>Description:</b> {viewScheme.description}</Typography>
              <Typography><b>Start Date:</b> {viewScheme.startDate}</Typography>
              <Typography><b>End Date:</b> {viewScheme.endDate}</Typography>
              <Typography><b>Budget:</b> ₹{viewScheme.budget}</Typography>
              <Typography><b>Category:</b> {viewScheme.category}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SchemesPage;
