import React, { useState } from "react";
import {
  Grid,
  CardContent,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Modal,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { Visibility, Edit, Delete, Add } from "@mui/icons-material";

interface Scheme {
  id: number;
  name: string;
  description: string;
}

const Schemes: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([
    { id: 1, name: "Health Scheme", description: "This scheme is for health support." },
    { id: 2, name: "Education Scheme", description: "Provides educational benefits." },
  ]);

  const [openModal, setOpenModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenModal = (type: "add" | "edit" | "view", scheme?: Scheme) => {
    setSelectedScheme(scheme || null);
    setOpenModal(type);
  };

  const handleCloseModal = () => setOpenModal(null);

  const handleDeleteScheme = (schemeId: number) => {
    setSchemes(schemes.filter((s) => s.id !== schemeId));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (openModal === "add") {
      const newScheme: Scheme = { id: schemes.length + 1, name, description };
      setSchemes([...schemes, newScheme]);
    } else if (openModal === "edit" && selectedScheme) {
      setSchemes(
        schemes.map((scheme) => (scheme.id === selectedScheme.id ? { ...scheme, name, description } : scheme))
      );
    }

    handleCloseModal();
  };

  return (
    <div>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              label="Search Schemes"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4} display="flex" justifyContent="flex-end">
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal("add")}>
              Add Scheme
            </Button>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schemes
                .filter((scheme) => scheme.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell>{scheme.name}</TableCell>
                    <TableCell>{scheme.description}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenModal("view", scheme)}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleOpenModal("edit", scheme)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteScheme(scheme.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Modal open={openModal === "add" || openModal === "edit"} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              {openModal === "add" ? "Add New Scheme" : "Edit Scheme"}
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                margin="normal"
                name="name"
                defaultValue={selectedScheme?.name || ""}
                required
              />
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                margin="normal"
                name="description"
                multiline
                rows={3}
                defaultValue={selectedScheme?.description || ""}
                required
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                {openModal === "add" ? "Add Scheme" : "Update Scheme"}
              </Button>
            </form>
          </Box>
        </Modal>

        <Modal open={openModal === "view"} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6">Scheme Details</Typography>
            <Typography variant="subtitle1" mt={2}><strong>Name:</strong> {selectedScheme?.name}</Typography>
            <Typography variant="body1" mt={1}><strong>Description:</strong> {selectedScheme?.description}</Typography>
          </Box>
        </Modal>
      </CardContent>
    </div>
  );
};

// Modal Styling
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default Schemes;
