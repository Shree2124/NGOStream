// import { useState, useEffect } from "react";
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   CircularProgress,
//   Tooltip,
//   MenuItem,
//   Box,
// } from "@mui/material";
// import { Delete, Edit, Visibility } from "@mui/icons-material";
// import { api } from "../../api/api";

// Define Scheme Type
// interface Scheme {
//   _id: string;
//   name: string;
//   description: string;
//   startDate: string;
//   endDate: string;
//   budget: number;
//   category: string;
//   benefits: string;
//   eligibilityCriteria: string;
//   ageRequirement: {min: number, max: number}
// }

const SchemesPage = () => {
  // const [schemes, setSchemes] = useState<Scheme[]>([]);
  // const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  // const [searchQuery, setSearchQuery] = useState<string>("");
  // const [shemeToEdit, setSchemeEdit] = useState<boolean>(false);
  // const [minAge, setMinAge] = useState<number>(0);
  // const [maxAge, setMaxAge] = useState<number>(0);

  // const handleMinAgeChange = (e) => {
  //   const value = e.target.value;
  //   if (!/^\d*$/.test(value)) return; 
  //   setMinAge(value);
  //   if (maxAge && parseInt(value) > maxAge) {
  //     setError("Min age cannot be greater than max age");
  //   } else {
  //     setError("");
  //   }
  // };

  // const handleMaxAgeChange = (e) => {
  //   const value = e.target.value;
  //   if (!/^\d*$/.test(value)) return; // Only allow numbers
  //   setMaxAge(value);
  //   if (minAge && parseInt(value) < minAge) {
  //     setError("Max age cannot be less than min age");
  //   } else {
  //     setError("");
  //   }
  // };

  // // Form State for Adding/Editing Schemes
  // const [formData, setFormData] = useState({
  //   name: "",
  //   description: "",
  //   startDate: "",
  //   endDate: "",
  //   budget: "",
  //   category: "",
  //   benefits: "",
  //   eligibilityCriteria: "",
  //   ageRequirement: {
  //     min: 0,
  //     max: 0
  //   }
  // });

  // const schemeToEdit = () => {
  //   setSchemeEdit(false);
  // };

  // const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  // const [openDialog, setOpenDialog] = useState(false);
  // const [openViewDialog, setOpenViewDialog] = useState(false);
  // const [viewScheme, setViewScheme] = useState<Scheme | null>(null);
  // const [saving, setSaving] = useState<boolean>(false);
  // const [deleting, setDeleting] = useState<string | null>(null);

  // const categories = [
  //   "Healthcare",
  //   "Education",
  //   "Employment",
  //   "Infrastructure",
  // ];

  // useEffect(() => {
  //   fetchSchemes();
  // }, []);

  // // Fetch Schemes from API
  // const fetchSchemes = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await api.get("/schemes/schemes");
  //     setSchemes(response.data.data.schemes);
  //     setFilteredSchemes(response.data.data.schemes);
  //     setError(null);
  //   } catch (err) {
  //     setError("Error fetching schemes");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleOpenDialog = (scheme?: Scheme) => {
  //   console.log(scheme);
  //   if (scheme) {
  //     setEditingScheme(scheme);
  //     setFormData({
  //       name: scheme?.name,
  //       description: scheme?.description,
  //       startDate: scheme?.startDate,
  //       endDate: scheme?.endDate,
  //       budget: scheme?.budget.toString(),
  //       category: scheme?.category,
  //       benefits: scheme.benefits,
  //       eligibilityCriteria: scheme.eligibilityCriteria,
  //       ageRequirement: {
  //         min: 0,
  //         max: 0,
  //       },
  //     });
  //   } else {
  //     setEditingScheme(null);
  //     setFormData({
  //       name: "",
  //       description: "",
  //       startDate: "",
  //       endDate: "",
  //       budget: "",
  //       category: "",
  //       benefits: "",
  //       eligibilityCriteria: "",
  //       ageRequirement: {
  //         min: 0,
  //         max: 0
  //       }
  //     });
  //   }
  //   setOpenDialog(true);
  // };

  // const handleCloseDialog = () => {
  //   setOpenDialog(false);
  // };

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setSaving(true);
  //   try {
  //     const payload = {
  //       ...formData,
  //       budget: Number(formData.budget),
  //       ageRequirement: {
  //         min: formData.ageRequirement.min,
  //         max: formData.ageRequirement.max,
  //       },
  //     };

  //     if (editingScheme) {
  //       await api.put(`/schemes/${editingScheme._id}`, payload);
  //     } else {
  //       const res = await api.post(`/schemes/schemes`, payload);
  //       console.log(res.data.data)

  //     }
  //     fetchSchemes();
  //     handleCloseDialog();
  //   } catch (err) {
  //     setError("Error saving scheme");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // const handleDelete = async (id: string) => {
  //   setDeleting(id);
  //   try {
  //     await api.delete(`/schemes/${id}`);
  //     fetchSchemes();
  //   } catch (err) {
  //     setError("Error deleting scheme");
  //   } finally {
  //     setDeleting(null);
  //   }
  // };

  // const handleViewScheme = (scheme: Scheme) => {
  //   setViewScheme(scheme);
  //   setOpenViewDialog(true);
  // };

  return (
    // <Container maxWidth="lg">
    //   <Typography variant="h4" sx={{ my: 3 }}>
    //     Schemes Management
    //   </Typography>

    //   {error && <Typography color="error">{error}</Typography>}

    //   <TextField
    //     label="Search Schemes"
    //     variant="outlined"
    //     fullWidth
    //     value={searchQuery}
    //     onChange={(e) => setSearchQuery(e.target.value)}
    //     sx={{ mb: 2 }}
    //   />

    //   <Button
    //     variant="contained"
    //     color="primary"
    //     sx={{ mb: 2 }}
    //     onClick={() => handleOpenDialog()}
    //   >
    //     Add Scheme
    //   </Button>

    //   {loading ? (
    //     <CircularProgress />
    //   ) : (
    //     <TableContainer component={Paper}>
    //       <Table>
    //         <TableHead>
    //           <TableRow>
    //             <TableCell>Name</TableCell>
    //             <TableCell>Description</TableCell>
    //             <TableCell>Start Date</TableCell>
    //             <TableCell>End Date</TableCell>
    //             <TableCell>Budget</TableCell>
    //             <TableCell>Category</TableCell>
    //             <TableCell>Actions</TableCell>
    //           </TableRow>
    //         </TableHead>
    //         <TableBody>
    //           {filteredSchemes.map((scheme) => (
    //             <TableRow key={scheme._id}>
    //               <TableCell>{scheme.name}</TableCell>
    //               <TableCell>{scheme.description}</TableCell>
    //               <TableCell>{scheme.startDate}</TableCell>
    //               <TableCell>{scheme.endDate}</TableCell>
    //               <TableCell>₹{scheme.budget}</TableCell>
    //               <TableCell>{scheme.category}</TableCell>
    //               <TableCell>
    //                 <Tooltip title="View">
    //                   <IconButton
    //                     color="info"
    //                     onClick={() => handleViewScheme(scheme)}
    //                   >
    //                     <Visibility />
    //                   </IconButton>
    //                 </Tooltip>
    //                 <Tooltip title="Edit">
    //                   <IconButton
    //                     color="primary"
    //                     onClick={() => handleOpenDialog(scheme)}
    //                   >
    //                     <Edit />
    //                   </IconButton>
    //                 </Tooltip>
    //                 <Tooltip title="Delete">
    //                   <IconButton
    //                     color="error"
    //                     onClick={() => handleDelete(scheme._id)}
    //                     disabled={deleting === scheme._id}
    //                   >
    //                     {deleting === scheme._id ? (
    //                       <CircularProgress size={24} />
    //                     ) : (
    //                       <Delete />
    //                     )}
    //                   </IconButton>
    //                 </Tooltip>
    //               </TableCell>
    //             </TableRow>
    //           ))}
    //         </TableBody>
    //       </Table>
    //     </TableContainer>
    //   )}

    //   <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)}>
    //     <DialogTitle>Scheme Details</DialogTitle>
    //     <DialogContent>
    //       {viewScheme && (
    //         <>
    //           <Typography>
    //             <b>Name:</b> {viewScheme.name}
    //           </Typography>
    //           <Typography>
    //             <b>Description:</b> {viewScheme.description}
    //           </Typography>
    //           <Typography>
    //             <b>Start Date:</b> {viewScheme.startDate}
    //           </Typography>
    //           <Typography>
    //             <b>End Date:</b> {viewScheme.endDate}
    //           </Typography>
    //           <Typography>
    //             <b>Budget:</b> ₹{viewScheme.budget}
    //           </Typography>
    //           <Typography>
    //             <b>Category:</b> {viewScheme.category}
    //           </Typography>
    //         </>
    //       )}
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
    //     </DialogActions>
    //   </Dialog>

    //   <Dialog
    //     open={openDialog}
    //     onClose={handleCloseDialog}
    //     fullWidth
    //     maxWidth="md"
    //   >
    //     <DialogTitle>
    //       {editingScheme ? "Edit Scheme" : "Add Scheme"}
    //     </DialogTitle>
    //     <DialogContent>
    //       <form onSubmit={handleSubmit}>
    //         <TextField
    //           label="Scheme Name"
    //           name="name"
    //           value={editingScheme?.name}
    //           onChange={(e) => handleChange(e)}
    //           fullWidth
    //           required
    //           margin="dense"
    //         />
    //         <TextField
    //           label="Description"
    //           name="description"
    //           value={editingScheme?.description}
    //           onChange={(e) => handleChange(e)}
    //           fullWidth
    //           required
    //           multiline
    //           rows={3}
    //           margin="dense"
    //         />
    //         <TextField
    //           label="Start Date"
    //           name="startDate"
    //           type="date"
    //           value={editingScheme?.startDate}
    //           onChange={(e) => handleChange(e)}
    //           fullWidth
    //           required
    //           margin="dense"
    //           InputLabelProps={{ shrink: true }}
    //         />
    //         <TextField
    //           label="End Date"
    //           name="endDate"
    //           type="date"
    //           value={editingScheme?.endDate}
    //           onChange={(e) => handleChange(e)}
    //           fullWidth
    //           required
    //           margin="dense"
    //           InputLabelProps={{ shrink: true }}
    //         />

    //         <TextField
    //           label="Budget"
    //           name="budget"
    //           value={editingScheme?.budget}
    //           onChange={(e) => handleChange(e)}
    //           fullWidth
    //           required
    //           type="number"
    //           margin="dense"
    //         />
    //         <Box
    //           display="flex"
    //           sx={{
    //             display: "flex",
    //             flexDirection: "column",
    //           }}
    //           gap={3}
    //           alignItems="right"
    //         >
    //           <div className="">Set Age Criteria: </div>
    //           <div>
    //             <TextField
    //               label="Min Age"
    //               type="number"
    //               variant="outlined"
    //               value={minAge}
    //               onChange={handleMinAgeChange}
    //               error={Boolean(error)}
    //               helperText={error}
    //               required
    //             />
    //             <TextField
    //               label="Max Age"
    //               required
    //               type="number"
    //               variant="outlined"
    //               value={maxAge}
    //               onChange={handleMaxAgeChange}
    //               error={Boolean(error)}
    //               helperText={error}
    //             />
    //           </div>
    //         </Box>
    //         <TextField
    //           select
    //           label="Category"
    //           name="category"
    //           defaultValue={editingScheme?.category}
    //           // value={editingScheme?.category}
    //           onChange={(e) => handleChange(e)}
    //           fullWidth
    //           required
    //           margin="dense"
    //         >
    //           {categories.map((cat) => (
    //             <MenuItem key={cat} value={cat}>
    //               {cat}
    //             </MenuItem>
    //           ))}
    //         </TextField>
    //       </form>
    //     </DialogContent>

    //     <DialogActions>
    //       <Button onClick={handleCloseDialog} color="secondary">
    //         Cancel
    //       </Button>
    //       <Button
    //         onClick={handleSubmit}
    //         variant="contained"
    //         color="primary"
    //         disabled={loading}
    //       >
    //         {loading ? (
    //           <CircularProgress size={24} />
    //         ) : editingScheme ? (
    //           "Update"
    //         ) : (
    //           "Add"
    //         )}
    //       </Button>
    //     </DialogActions>
    //   </Dialog>
    // </Container>
    <div>
      hello
    </div>
  );
};

export default SchemesPage;

{
  /* <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
      <DialogTitle>{editingScheme ? "Edit Scheme" : "Add Scheme"}</DialogTitle>
      <DialogContent>
        <TextField label="Name" name="name" value={formData.name} onChange={handleChange} fullWidth margin="dense" required />
        <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth margin="dense" required multiline rows={3} />
        <TextField label="Budget" name="budget" type="number" value={formData.budget} onChange={handleChange} fullWidth margin="dense" required />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={saving}>
          {saving ? <CircularProgress size={24} /> : editingScheme ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog> */
}
