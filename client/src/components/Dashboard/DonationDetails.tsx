import React, { useEffect, useState } from "react";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../../api/api";
import { Edit } from "@mui/icons-material";
import { Button } from "../ui/button";

interface IDonation {
  _id: string;
  donorInfo: { name: string; email?: string };
  donationType: "Monetary" | "In-Kind";
  amount?: number; // Only for Monetary donations
  estimatedValue?: number; // Only for In-Kind donations
  paymentStatus?: string; // Only for Monetary donations
  status?: string; // For In-Kind donations (Pending, Approved, etc.)
  paymentMethod?: string; // Only for Monetary donations
  goalInfo: { name: string };
  currency?: string; // Only for Monetary donations
  image?: string; // Image field for In-Kind donations
  inKindDetails?: {
    itemName: string;
    image: string;
    quantity: number;
    estimatedValue: number;
    description: string;
    status: string;
  }; // Additional details for In-Kind donations
}

interface IDonationDetailsProps {
  type: string;
}

const DonationDetails: React.FC<IDonationDetailsProps> = ({ type }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showSearch, setShowSearch] = useState(false);
  const [donationData, setDonationData] = useState<IDonation[]>([]);
  const [isValidType, setIsValidType] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<IDonation | null>(
    null
  );
  const [editModal, setEditModal] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(
    selectedDonation?.inKindDetails?.status || "Pending"
  );

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/donation/get-donation-info/${type}`);
      setDonationData(res.data.data);
    } catch (error) {
      console.error("Error fetching donation data:", error);
    }
  };

  useEffect(() => {
    if (type !== "Monetary" && type !== "In-Kind") {
      setIsValidType(false);
      return;
    }

    

    fetchDetails();
  }, [type]);

  if (!isValidType) {
    return (
      <Typography variant="h6" color="error">
        Invalid donation type
      </Typography>
    );
  }

  const filteredDonations = donationData.filter((donation) =>
    type === "Monetary"
      ? donation.amount !== undefined
      : donation.estimatedValue !== undefined
  );

  const filteredSearchDonations = filteredDonations.filter(
    (donation) =>
      donation.donorInfo.name.toLowerCase().includes(search.toLowerCase()) ||
      donation.goalInfo.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    console.log(event?.target);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (donation: IDonation) => {
    setSelectedDonation(donation);
    setEditModal(true);
  };

  const handleCloseEdit = () => {
    setSelectedDonation(null);
    setEditModal(false);
  };

  const handleSave = async (selectedValue: string) => {
    try {
      console.log(selectedValue);
      console.log(selectedDonation?._id);
      
      const res = await api.put(`/donation/update-donation-status`, {
        status: selectedValue,
        donationId: selectedDonation?._id,
      });
      console.log(res.data);
      fetchDetails()
    } catch (e) {
      console.log(e);
    }

    setEditModal(false);
  };

  return (
    <div>
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "flex-start",
        }}
      >
        <IconButton onClick={() => setShowSearch(!showSearch)}>
          <SearchIcon />
        </IconButton>
      </Box>

      {showSearch && (
        <TextField
          label="Search Donations"
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, display: { xs: "block", md: "none" } }}
        />
      )}

      <TextField
        label="Search Donations"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, display: { xs: "none", md: "block" } }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Donor Name</TableCell>
              <TableCell>Donor Email</TableCell>
              {type === "Monetary" ? (
                <>
                  <TableCell>Amount</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Payment Method</TableCell>
                </>
              ) : (
                <>
                  <TableCell>Item Image</TableCell>
                  <TableCell>Estimated Value</TableCell>
                  <TableCell>Status</TableCell>
                </>
              )}
              <TableCell>Campaign</TableCell>
              {type === "In-Kind" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSearchDonations
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((donation) => (
                <TableRow key={donation._id}>
                  <TableCell>{donation.donorInfo?.name || "Unknown"}</TableCell>
                  <TableCell>
                    {donation.donorInfo?.email || "Unknown"}
                  </TableCell>
                  {type === "Monetary" ? (
                    <>
                      <TableCell>{donation.amount || "Unknown"}</TableCell>
                      <TableCell>{donation.currency || "Unknown"}</TableCell>
                      <TableCell>
                        {donation.paymentStatus || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {donation.paymentMethod || "Unknown"}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        {donation?.inKindDetails?.image ? (
                          <img
                            src={donation?.inKindDetails?.image}
                            alt="Donation Item"
                            width="60"
                            height="50"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </TableCell>
                      <TableCell>
                        {donation.estimatedValue || "Unknown"}
                      </TableCell>
                      <TableCell>{donation.status || "Unknown"}</TableCell>
                    </>
                  )}
                  <TableCell>{donation.goalInfo?.name || "Unknown"}</TableCell>
                  {type === "In-Kind" && (
                    <TableCell>
                      <Tooltip title="Edit status">
                        <IconButton onClick={() => handleEdit(donation)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredSearchDonations.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={editModal} onClose={handleCloseEdit}>
        <DialogTitle sx={{ textAlign: "center" }}>Update status</DialogTitle>
        <DialogContent sx={{
          minWidth: "10rem"
        }}>
          
          
          {selectedDonation && (
            <>
            <div className="mt-2 p-5">
          <Typography variant="body1"><strong>Donor name:</strong> {selectedDonation?.donorInfo?.name}</Typography>
          <Typography variant="body1"><strong>Item name:</strong> {selectedDonation?.inKindDetails?.itemName}</Typography>
          <Typography variant="body1"><strong>Estimate value:</strong> {selectedDonation?.inKindDetails?.estimatedValue}</Typography>
          <Typography variant="body1"><strong>Item name:</strong> {selectedDonation?.goalInfo?.name}</Typography>
          <Typography variant="body1"><strong>Select a status:</strong></Typography>
              <Select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                sx={{ marginBottom: 2 }}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Donated">Donated</MenuItem>
              </Select>
              </div>
              <div style={{ textAlign: "right" }}>
                <Button onClick={() => handleSave(selectedValue || "")}>
                  Save changes
                </Button>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DonationDetails;
