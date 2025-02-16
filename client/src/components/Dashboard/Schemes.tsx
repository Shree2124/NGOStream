import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  IconButton,
  Modal,  
  Card,
  List,
  ListItem,
  ListItemText,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
  Container,
} from "@mui/material";
import { Add, Edit, Delete, Visibility, Search } from "@mui/icons-material";
import toast from "react-hot-toast";

interface Scheme {
  id: number;
  name: string;
  description: string;
}

const Schemes: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [schemes, setSchemes] = useState<Scheme[]>([
    {
      id: 1,
      name: "Health Scheme",
      description: "This scheme is for health support.",
    },
    {
      id: 2,
      name: "Education Scheme",
      description: "Provides educational benefits.",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view" | null>(
    null
  );
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [newScheme, setNewScheme] = useState<Scheme>({
    id: 0,
    name: "",
    description: "",
  });

  // Open Modal
  const handleOpenModal = (type: "add" | "edit" | "view", scheme?: Scheme) => {
    setModalType(type);
    setSelectedScheme(scheme || null);
    setNewScheme(scheme || { id: 0, name: "", description: "" });
    setShowModal(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalType(null);
    setSelectedScheme(null);
    setNewScheme({ id: 0, name: "", description: "" });
  };

  // Handle Add or Edit Scheme
  const handleSubmit = () => {
    if (!newScheme.name || !newScheme.description) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (modalType === "add") {
      setSchemes([...schemes, { ...newScheme, id: schemes.length + 1 }]);
      toast.success("Scheme added successfully!");
    } else if (modalType === "edit" && selectedScheme) {
      setSchemes(
        schemes.map((scheme) =>
          scheme.id === selectedScheme.id ? { ...newScheme } : scheme
        )
      );
      toast.success("Scheme updated successfully!");
    }

    handleCloseModal();
  };

  // Handle Delete Scheme
  const handleDeleteScheme = (schemeId: number) => {
    setSchemes(schemes.filter((scheme) => scheme.id !== schemeId));
    toast.success("Scheme deleted successfully!");
  };

  const filteredSchemes = schemes.filter((scheme) =>
    scheme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* Search and Add Section */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{ display: "flex" }}
        >
          {/* Search Bar */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Search schemes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <IconButton>
                      <Search />
                    </IconButton>
                  ),
                }}
                sx={{
                  height: "44px",
                  "& .MuiInputBase-root": { height: "44px" },
                }}
                size="medium"
              />
            </Box>
          </Grid>

          {/* Add Scheme Button */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenModal("add")}
              sx={{
                height: "44px",
                whiteSpace: "nowrap",
                px: 3,
                fontWeight: 600,
              }}
            >
              Add Scheme
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Schemes List */}
      <Card>
        <List sx={{ p: 0 }}>
          {filteredSchemes.map((scheme, index) => (
            <React.Fragment key={scheme.id}>
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
                  <ListItemText
                    primary={
                      <Typography variant={isMobile ? "subtitle1" : "h6"}>
                        {scheme.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {scheme.description}
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
                    startIcon={<Visibility />}
                    onClick={() => handleOpenModal("view", scheme)}
                    size={isMobile ? "small" : "medium"}
                    variant="outlined"
                  >
                    {!isMobile && "View"}
                  </Button>
                  <Button
                    startIcon={<Edit />}
                    onClick={() => handleOpenModal("edit", scheme)}
                    size={isMobile ? "small" : "medium"}
                    variant="outlined"
                  >
                    {!isMobile && "Edit"}
                  </Button>
                  <Button
                    startIcon={<Delete />}
                    onClick={() => handleDeleteScheme(scheme.id)}
                    size={isMobile ? "small" : "medium"}
                    variant="outlined"
                    color="error"
                  >
                    {!isMobile && "Delete"}
                  </Button>
                </Stack>
              </ListItem>
              {index < filteredSchemes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={handleCloseModal}>
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
            {modalType === "add" ? "Add Scheme" : "Edit Scheme"}
          </Typography>
          <TextField
            fullWidth
            label="Scheme Name"
            value={newScheme.name}
            onChange={(e) =>
              setNewScheme({ ...newScheme, name: e.target.value })
            }
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newScheme.description}
            onChange={(e) =>
              setNewScheme({ ...newScheme, description: e.target.value })
            }
            multiline
            rows={3}
            required
            sx={{ mb: 2 }}
          />
          <Button fullWidth variant="contained" onClick={handleSubmit}>
            {modalType === "add" ? "Add Scheme" : "Update Scheme"}
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default Schemes;
