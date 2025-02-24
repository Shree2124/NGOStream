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
  // Input,
  AvatarGroup,
  Avatar,
  useMediaQuery,
  Box,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  CloudUpload,
} from "@mui/icons-material";
import { api } from "../../api/api";

const steps = [
  "Donation Type",
  "Select Category",
  "Choose Item",
  "Upload & Submit",
];

export interface IImpact {
  _id: string;
  eventId?: string;
  beneficiaryId?: string;
  goalId?: string;
  description: string;
  images: string[];
  donationType: "In-Kind" | "Monetary";
  selectedId: string;
  category: "Event" | "Goal";
}

const ImpactManagement = () => {
  const [impacts, setImpacts] = useState<IImpact[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<string>("");
  const [activeStep, setActiveStep] = useState<number>(0);
  const [donationType, setDonationType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [events, setEvents] = useState<any>([]);
  const [goals, setGoals] = useState<any>([]);
  const [selectedImpact, setSelectedImpact] = useState<IImpact>();

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    fetchImpacts();
  }, []);

  const fetchNames = async () => {
    if (category === "Event") {
      const res = await api.get("/event/get-event-names");
      console.log(res);
      setEvents(res.data.data);
    } else if (category === "Goal") {
      const res = await api.get("/goal/get-names");
      setGoals(res.data.data);
    }
  };

  useEffect(() => {
    if (category) {
      fetchNames();
    }
  }, [category, editId]);

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
    console.log(existingImages, images, description);
    // console.log(images.length < 1 || existingImages.length < 1);
    if (!description) {
      alert("Please provide description");
    } else if (images.length < 1 || existingImages.length < 1) {
      alert("Please upload at least one image");
    }
    const formData = new FormData();
    formData.append("donationType", donationType);
    console.log(formData);
    formData.append("category", category);
    formData.append("description", description);
    images.forEach((file) => formData.append("images", file));
    existingImages.forEach((url) => formData.append("existingImages", url));
    if (category === "Event") {
      formData.append("eventId", selectedId);
    } else if (category === "Goal") {
      formData.append("goalId", selectedId);
    }

    console.log(formData);

    console.log({
      donationType,
      category,
      description,
      images,
      selectedId,
    });
    console.log(formData);

    if (editId) {
      const res = await api.put(`/impact/edit/${editId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res.data);
    } else {
      const res = await api.post("/impact/create", formData);
      console.log(res.data);
    }

    fetchImpacts();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    const res = await api.delete(`/impact/${id}`);
    console.log(res.data);
    fetchImpacts();
  };

  const handleEdit = async (impact: IImpact) => {
    console.log(impact);
    setSelectedImpact(impact);
    setEditId(impact._id);
    setDonationType(impact.donationType);
    console.log(impact?.eventId !== null);
    if (impact?.eventId) {
      setCategory("Event");
    } else if (impact?.goalId) {
      setCategory("Goal");
    }
    console.log(category);
    setSelectedId(impact?.selectedId);
    setDescription(impact.description);
    setImages([]);
    setExistingImages(impact.images || []);
    setActiveStep(0);
    setOpenModal(true);
    // await fetchNames();

    // console.log(events);
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
    setEditId("");
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
                  <TableCell sx={{ fontWeight: "500" }}>
                    {impact.donationType}
                  </TableCell>

                  {!isMobile && (
                    <TableCell sx={{ fontWeight: "500" }}>
                      {impact.eventId !== "" ? "Event" : "Campaign"}
                    </TableCell>
                  )}

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

                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      onClick={() => {
                        handleEdit(impact);
                        setSelectedId(impact._id);
                      }}
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
                <MenuItem value="Event">Event</MenuItem>
                <MenuItem value="Goal">Goal</MenuItem>
              </Select>
            </FormControl>
          )}

          {activeStep === 2 && (
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Select {category}</InputLabel>
              <Select
                value={
                  (category === "Event"
                    ? events.find(
                        (event: any) => event.id === selectedImpact?.eventId
                      )
                    : goals.find(
                        (goal: any) => goal.id === selectedImpact?.goalId
                      )
                  )?.name || ""
                }
                onChange={(e) => {
                  const selectedItem =
                    category === "Event"
                      ? events.find(
                          (event: any) => event.name === e.target.value
                        )
                      : goals.find((goal: any) => goal.name === e.target.value);

                  if (selectedItem) {
                    setSelectedId(selectedItem.id);
                  }
                }}
              >
                {(category === "Event" ? events : goals).map((item: any) => (
                  <MenuItem key={item.id} value={item.name}>
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
                disabled={images.length >= 5}
              >
                Upload Images (Max 5)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    handleFileChange(e);
                  }}
                />
              </Button>

              <Box display="flex" gap={1} flexWrap="wrap">
                {existingImages.map((url, index) => (
                  <Avatar
                    key={index}
                    src={url}
                    alt="Existing Image"
                    sx={{ width: 50, height: 50 }}
                  />
                ))}
                {images.map((file, index) => (
                  <Avatar
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt="New Image"
                    sx={{ width: 50, height: 50 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep(activeStep - 1)}>Back</Button>
          )}
          {activeStep < steps.length - 1 && (
            <Button
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
            >
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
