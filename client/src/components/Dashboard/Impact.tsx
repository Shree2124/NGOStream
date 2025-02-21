/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Input,
  AvatarGroup,
  Avatar,
  useMediaQuery,
  Box,
} from "@mui/material";
import { Add, Edit, Delete, CloudUpload } from "@mui/icons-material";
import { api } from "../../api/api";

const steps = [
  "Donation Type",
  "Select Category",
  "Choose Item",
  "Upload & Submit",
];

const ImpactManagement = () => {
  const [impacts, setImpacts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [donationType, setDonationType] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [events, setEvents] = useState<any>([{ name: "event1" }]);
  const [goals, setGoals] = useState<any>([{ name: "goal1" }]);
  const [beneficiaries, setBeneficiaries] = useState<any>([{ name: "b1" }]);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    fetchImpacts();
  }, []);

  useEffect(() => {
    const fetchNames = async () => {
      if (category === "event") {
        const res = await api.get("/event/get-event-names");
        console.log(res);
        setEvents(res.data.data);
      } else if (category === "goal") {
        const res = await api.get("/goal/get-names");
        setGoals(res.data.data);
      } else if (category === "beneficiary") {
        const res = await api.get("/beneficiary/get-names");
        setBeneficiaries(res.data.data);
      }
    };
    fetchNames();
  }, [category]);

  const fetchImpacts = async () => {
    const response = await api.get("/admin/get-impacts");
    setImpacts(response.data.data);
  };

  useEffect(() => {
    console.log(selectedId);
  }, [selectedId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    
    if (images.length + files.length > 5) {
      return alert("Max 5 images allowed!");
    }
  
    setImages((prevImages) => [...prevImages, ...files]);
  };
  const handleSubmit = async () => {
    console.log({
      donationType,
      category,
      selectedId,
      description,
    });
    if (!description || images.length < 1)
      return alert("Please provide description & images.");
    const formData = new FormData();
    formData.append("donationType", donationType);
    formData.append("category", category);
    formData.append("description", description);
    images.forEach((file) => formData.append("images", file));
    if (category === "event") {
      formData.append("eventId", selectedId);
    } else if (category === "goal") {
      formData.append("goalId", selectedId);
    } else if (category === "beneficiary") {
      formData.append("beneficiaryId", selectedId);
    }

    console.log(formData);

    const method = editId ? "PUT" : "POST";
    await fetch(
      `http://localhost:5000/api/v1/impact${
        editId ? `/edit/:${editId}` : "/create"
      }`,
      {
        method,
        body: formData,
      }
    );

    fetchImpacts();
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/impacts/${id}`, { method: "DELETE" });
    fetchImpacts();
  };

  const handleEdit = (impact) => {
    setEditId(impact._id);
    setDonationType(impact.donationType);
    setCategory(impact.category);
    setSelectedId(impact.selectedId);
    setDescription(impact.description);
    setImages([]);
    setActiveStep(0);
    setOpenModal(true);
  };

  const handleNext = () => {
    if (activeStep === 0 && !donationType) {
      alert("Please select a donation type.");
      return;
    }
    if (activeStep === 1 && !category) {
      alert("Please select a category.");
      return;
    }
    if (activeStep === 2 && !selectedId) {
      alert("Please choose an item.");
      return;
    }
    if (activeStep === 3 && (!description || images.length < 1)) {
      alert("Please provide a description and at least one image.");
      return;
    }
  
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditId(null);
    setActiveStep(0);
    setDonationType("");
    setCategory("");
    setSelectedId("");
    setDescription("");
    setImages([]);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 3 }}>
        Impact Management
      </Typography>

      <TextField
        label="Search Impact"
        variant="outlined"
        size="small"
        onChange={(e) => setSearch(e.target.value)}
      />
      <FormControl sx={{ minWidth: 150, ml: 2 }}>
        <InputLabel>Filter</InputLabel>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="event">Event</MenuItem>
          <MenuItem value="beneficiary">Beneficiary</MenuItem>
          <MenuItem value="goal">Goal</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{ ml: 2 }}
        onClick={() => setOpenModal(true)}
      >
        Create Impact
      </Button>

      <TableContainer
        component={Paper}
        sx={{ mt: 3, boxShadow: 3, borderRadius: 2 }}
      >
        <Table>
          {/* Table Head */}
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main", color: "white" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Donation Type
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Category
                </TableCell>
              )}
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Description
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Images
              </TableCell>
              <TableCell
                sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {impacts
              ?.filter((impact) =>
                impact.description.toLowerCase().includes(search.toLowerCase())
              )
              ?.filter((impact) => (filter ? impact.category === filter : true))
              ?.map((impact) => (
                <TableRow
                  key={impact._id}
                  sx={{ "&:nth-of-type(even)": { bgcolor: "grey.100" } }}
                >
                  {/* Donation Type */}
                  <TableCell sx={{ fontWeight: "500" }}>
                    {impact.donationType}
                  </TableCell>

                  {/* Category - Hide on mobile */}
                  {!isMobile && (
                    <TableCell sx={{ fontWeight: "500" }}>
                      {impact.eventId !== ""
                        ? "Event"
                        : impact.goalId !== ""
                        ? "Campagna"
                        : "Beneficiary"}
                    </TableCell>
                  )}

                  {/* Description */}
                  <TableCell
                    sx={{
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {impact.description}
                  </TableCell>

                  {/* Images */}
                  <TableCell>
                    <AvatarGroup max={4} sx={{ justifyContent: "left" }}>
                      {impact?.images?.length > 0 ? (
                        impact.images.map((src, index) => (
                          <Avatar
                            key={index}
                            alt={`Image ${index + 1}`}
                            src={src}
                            sx={{
                              width: 36,
                              height: 36,
                              border: "2px solid white",
                            }}
                          />
                        ))
                      ) : (
                        <Avatar
                          sx={{ width: 36, height: 36, bgcolor: "grey.300" }}
                        >
                          N/A
                        </Avatar>
                      )}
                    </AvatarGroup>
                  </TableCell>

                  {/* Actions */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      onClick={() => handleEdit(impact)}
                      sx={{ color: "primary.main" }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(impact._id)}
                      sx={{ color: "error.main" }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Impact Form Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editId ? "Edit Impact" : "Create Impact"}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Donation Type</InputLabel>
              <Select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                required
              >
                <MenuItem value="In-Kind">In-Kind</MenuItem>
                <MenuItem value="Monetary">Monetary</MenuItem>
              </Select>
            </FormControl>
          )}

          {activeStep === 1 && (
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="beneficiary">Beneficiary</MenuItem>
                <MenuItem value="goal">Goal</MenuItem>
              </Select>
            </FormControl>
          )}

          {activeStep === 2 && (
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Select {category}</InputLabel>
              <Select
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
                renderValue={(selected) =>
                  (category === "event"
                    ? events
                    : category === "goal"
                    ? goals
                    : beneficiaries
                  )?.find((item) => item.id === selected)?.name ||
                  "Select an option"
                }
              >
                {(category === "event"
                  ? events
                  : category === "goal"
                  ? goals
                  : beneficiaries
                )?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {activeStep === 3 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mt: 2 }}
                disabled={images.length >= 5} // Limit to 5 images
              >
                Upload Images (Max 5)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e)=>{handleFileChange(e)}}
                />
              </Button>

              {images.length > 0 && (
                <AvatarGroup sx={{ mt: 1 }}>
                  {images?.map((src, index) => (
                    <Avatar
                      key={index}
                      alt="Uploaded"
                      src={URL.createObjectURL(src)}
                    />
                  ))}
                </AvatarGroup>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep(activeStep - 1)}>Back</Button>
          )}
          {activeStep < steps.length - 1 && (
            <Button onClick={handleNext} disabled={activeStep === steps.length - 1}>
            Next
          </Button>
          )}
          {activeStep === steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!description}
            >
              {editId ? "Update" : "Submit"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ImpactManagement;
