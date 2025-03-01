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
  AvatarGroup,
  Avatar,
  useMediaQuery,
  Box,
  Stack,
  useTheme,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, CloudUpload, Search } from "@mui/icons-material";
import { api } from "../../api/api";
import toast from "react-hot-toast";

const steps = ["Select Category", "Choose Item", "Upload & Submit"];

export interface IImpact {
  _id: string;
  eventId?: string;
  beneficiaryId?: string;
  goalId?: string;
  description: string;
  images: string[];
  selectedId: string;
  category: "Event" | "Goal";
}

const ImpactManagement = () => {
  const theme = useTheme();
  const [impacts, setImpacts] = useState<IImpact[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<string>("");
  const [activeStep, setActiveStep] = useState<number>(0);

  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [events, setEvents] = useState<any>([]);
  const [goals, setGoals] = useState<any>([]);
  const [selectedImpact, setSelectedImpact] = useState<IImpact>();
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedImpact
      ? category === "Event"
        ? selectedImpact.eventId || null
        : selectedImpact.goalId || null
      : null
  );

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isFetchingOptions, setIsFetchingOptions] = useState<boolean>(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchImpacts();
  }, []);

  const fetchNames = async () => {
    if (!category) return;

    setIsFetchingOptions(true);
    try {
      if (category === "Event") {
        const res = await api.get("/event/get-event-names");
        setEvents(res.data.data);
      } else if (category === "Goal") {
        const res = await api.get("/goals/get-names");
        setGoals(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      toast.error("Failed to load options. Please try again.");
    } finally {
      setIsFetchingOptions(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchNames();
    }
  }, [category, editId]);

  const fetchImpacts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/get-impacts");
      setImpacts(response.data.data);
    } catch (error) {
      console.error("Error fetching impacts:", error);
      toast.error("Failed to load impacts. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed!");
      return;
    }

    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleSubmit = async () => {
    if (!description) {
      toast.error("Please provide a description");
      return;
    } else if (images.length < 1 && existingImages.length < 1) {
      toast.error("Please upload at least one image");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    images.forEach((file) => formData.append("images", file));
    existingImages.forEach((url) => formData.append("existingImages", url));

    if (category === "Event") {
      formData.append("eventId", selectedId!);
    } else if (category === "Goal") {
      formData.append("goalId", selectedId!);
    }

    setIsSubmitting(true);
    try {
      if (editId) {
        await api.put(`/impact/edit/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Impact updated successfully!");
      } else {
        await api.post("/impact/create", formData);
        toast.success("Impact created successfully!");
      }

      fetchImpacts();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving impact:", error);
      toast.error(
        editId ? "Failed to update impact" : "Failed to create impact"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this impact?")) {
      setIsDeleting(id);
      try {
        await api.delete(`/impact/${id}`);
        toast.success("Impact deleted successfully!");
        fetchImpacts();
      } catch (error) {
        console.error("Error deleting impact:", error);
        toast.error("Failed to delete impact");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  useEffect(() => {
    if (selectedImpact) {
      setSelectedId(
        category === "Event"
          ? selectedImpact.eventId || null
          : selectedImpact.goalId || null
      );
    }
  }, [selectedImpact, category]);

  const handleEdit = async (impact: IImpact) => {
    setSelectedImpact(impact);
    setEditId(impact._id);

    if (impact?.eventId) {
      setCategory("Event");
    } else if (impact?.goalId) {
      setCategory("Goal");
    }

    setSelectedId(impact?.selectedId);
    setDescription(impact.description);
    setImages([]);
    setExistingImages(impact.images || []);
    setActiveStep(0);
    setOpenModal(true);
  };

  const handleNext = () => {
    if (activeStep === 0 && !category) {
      toast.error("Please select a category");
      return;
    }
    if (activeStep === 1 && !selectedId) {
      toast.error("Please choose an item");
      return;
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditId("");
    setActiveStep(0);
    setCategory("");
    setSelectedId("");
    setDescription("");
    setImages([]);
    setExistingImages([]);
  };

  const filteredImpacts = impacts
    ?.filter((impact) =>
      impact.description.toLowerCase().includes(search.toLowerCase())
    )
    ?.filter((impact) =>
      filter
        ? impact.category === filter ||
          (filter === "Event" && impact.eventId) ||
          (filter === "Goal" && impact.goalId)
        : true
    );

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 3, fontWeight: 600 }}>
        Impact Management
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: isSmall ? "column" : "row",
          alignItems: isSmall ? "stretch" : "center",
          gap: 2,
          mb: 3,
        }}
      >
        <FormControl sx={{ flex: isSmall ? 1 : 2 }}>
          <TextField
            label="Search Impact"
            variant="outlined"
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              sx: { height: 40 },
            }}
          />
        </FormControl>

        <FormControl size="small" sx={{ flex: isSmall ? 1 : 1, minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ height: 40 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
            <MenuItem value="Goal">Goal</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
          sx={{
            height: 40,
            flex: isSmall ? 1 : "0 0 auto",
            whiteSpace: "nowrap",
          }}
        >
          Create Impact
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
          mb: 4,
          position: "relative",
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255, 255, 255, 0.7)",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
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
            {filteredImpacts?.length > 0 ? (
              filteredImpacts.map((impact) => (
                <TableRow
                  key={impact._id}
                  sx={{
                    "&:nth-of-type(even)": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
                    transition: "background-color 0.2s",
                  }}
                >
                  {!isMobile && (
                    <TableCell sx={{ fontWeight: "500" }}>
                      {impact?.eventId
                        ? "Event"
                        : impact?.goalId
                        ? "Goal"
                        : "Unknown"}
                    </TableCell>
                  )}

                  <TableCell
                    sx={{
                      maxWidth: { xs: "100px", sm: "200px", md: "300px" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Tooltip title={impact.description}>
                      <span>{impact.description}</span>
                    </Tooltip>
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
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => {
                            handleEdit(impact);
                            setSelectedId(impact._id);
                            setSelectedImpact(impact);
                          }}
                          sx={{
                            color: "primary.main",
                            "&:hover": { bgcolor: "rgba(25, 118, 210, 0.08)" },
                          }}
                          size="small"
                          disabled={isDeleting === impact._id}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(impact._id)}
                          sx={{
                            color: "error.main",
                            "&:hover": { bgcolor: "rgba(211, 47, 47, 0.08)" },
                          }}
                          size="small"
                          disabled={isDeleting === impact._id}
                        >
                          {isDeleting === impact._id ? (
                            <CircularProgress size={20} color="error" />
                          ) : (
                            <Delete />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={isMobile ? 3 : 4}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {isLoading ? "Loading impacts..." : "No impacts found"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openModal}
        onClose={isSubmitting ? undefined : handleCloseModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            {editId ? "Edit Impact" : "Create Impact"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <MenuItem value="Event">Event</MenuItem>
                <MenuItem value="Goal">Goal</MenuItem>
              </Select>
            </FormControl>
          )}

          {activeStep === 1 && (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Select {category}</InputLabel>
              {isFetchingOptions ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                    mb: 2,
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Select
                  value={
                    selectedId
                      ? category === "Event"
                        ? events.find((event: any) => event.id === selectedId)
                            ?.name || ""
                        : goals.find((goal: any) => goal.id === selectedId)
                            ?.name || ""
                      : ""
                  }
                  onChange={(e) => {
                    const selectedItem =
                      category === "Event"
                        ? events.find(
                            (event: any) =>
                              event.name.trim() === e.target.value.trim()
                          )
                        : goals.find(
                            (goal: any) =>
                              goal.name.trim() === e.target.value.trim()
                          );

                    if (selectedItem) {
                      setSelectedId(selectedItem.id);
                      setSelectedImpact((prev: any) => ({
                        ...prev,
                        [category === "Event" ? "eventId" : "goalId"]:
                          selectedItem.id,
                      }));
                    }
                  }}
                  disabled={isSubmitting}
                >
                  {(category === "Event" ? events : goals).map((item: any) => (
                    <MenuItem key={item.id} value={item.name}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>
          )}

          {activeStep === 2 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                multiline
                rows={3}
                sx={{ mb: 3 }}
                disabled={isSubmitting}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 2 }}
                  disabled={
                    isSubmitting || images.length + existingImages.length >= 5
                  }
                >
                  Upload Images {`(${images.length + existingImages.length}/5)`}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      handleFileChange(e);
                    }}
                    disabled={isSubmitting}
                  />
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {images.length + existingImages.length >= 5
                    ? "Maximum number of images reached"
                    : "You can upload up to 5 images"}
                </Typography>
              </Box>

              <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
                {existingImages.map((url, index) => (
                  <Box key={`existing-${index}`} sx={{ position: "relative" }}>
                    <Avatar
                      src={url}
                      alt="Existing Image"
                      sx={{
                        width: 60,
                        height: 60,
                        border: `2px solid ${theme.palette.primary.light}`,
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "error.main",
                        color: "white",
                        p: "2px",
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                      onClick={() => {
                        setExistingImages(
                          existingImages.filter((_, i) => i !== index)
                        );
                      }}
                      disabled={isSubmitting}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {images.map((file, index) => (
                  <Box key={`new-${index}`} sx={{ position: "relative" }}>
                    <Avatar
                      src={URL.createObjectURL(file)}
                      alt="New Image"
                      sx={{
                        width: 60,
                        height: 60,
                        border: `2px solid ${theme.palette.success.light}`,
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "error.main",
                        color: "white",
                        p: "2px",
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                      onClick={() => {
                        setImages(images.filter((_, i) => i !== index));
                      }}
                      disabled={isSubmitting}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          {activeStep > 0 && (
            <Button
              onClick={() => setActiveStep(activeStep - 1)}
              variant="outlined"
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}

          {activeStep < steps.length - 1 && (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={isSubmitting}
            >
              Next
            </Button>
          )}

          {activeStep === steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !description ||
                (images.length === 0 && existingImages.length === 0)
              }
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isSubmitting
                ? editId
                  ? "Updating..."
                  : "Submitting..."
                : editId
                ? "Update"
                : "Submit"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ImpactManagement;
