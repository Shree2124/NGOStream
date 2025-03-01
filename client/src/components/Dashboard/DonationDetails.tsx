/* eslint-disable @typescript-eslint/no-explicit-any */
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
  FormControl,
  InputLabel,
  Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../../api/api";
import { Edit } from "@mui/icons-material";
// import { Button } from "../ui/button";

interface IDonation {
  _id: string;
  donorInfo: { name: string; email?: string };
  donationType: "Monetary" | "In-Kind";
  amount?: number;
  estimatedValue?: number;
  paymentStatus?: string;
  status?: string;
  paymentMethod?: string;
  goalInfo: { name: string };
  currency?: string;
  image?: string;
  inKindDetails?: {
    itemName: string;
    image: string;
    quantity: number;
    estimatedValue: number;
    description: string;
    status: string;
  };
  createdAt: Date;
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
  const [openGenerateReportModal, setOpenGenerateReportModal] = useState<
    boolean
  >(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [fileType, setFileType] = useState("pdf");
  const [selectedValue, setSelectedValue] = useState<string | null>(
    selectedDonation?.inKindDetails?.status || "Pending"
  );
  const firstDonationStartDate = new Date(
    Math.min(
      ...donationData.map((event) => new Date(event.createdAt).getTime())
    )
  );

  const lastDonationEndDate = new Date(
    Math.max(
      ...donationData.map((event) => new Date(event.createdAt).getTime())
    )
  );

  const handleGenerateReportModalClose = () => {
    setOpenGenerateReportModal(false);
  };
  const handlePeriodChange = (event: any) => {
    setSelectedPeriod(event.target.value);
    setSelectedRange(null);
  };

  const generatePDFReport = async (filteredIds, fileType) => {
    try {
      const res = await api.post("/event/generate-report", {
        ids: filteredIds,
        fileType: fileType,
        type: "donor",
      })
      console.log(res.data.data)
    } catch (error: any) {
      console.log(error)
    }
  }

  function generateReport(selectedRange: string, fileType: string) {
    console.log("Selected Range:", selectedRange);
  
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
  
    
    const filteredIds = donationData
      .filter((donation) => {
        const createdAt = new Date(donation.createdAt);
        return createdAt >= from && createdAt <= to;
      })
      .map((donation) => donation._id);
  
    console.log("Filtered Donation IDs:", filteredIds);
    console.log("File Type:", fileType);
  
    generatePDFReport(filteredIds, fileType);

    setSelectedRange(null);
    setOpenGenerateReportModal(false);
  }
  
  
  const generateSelectableRanges = () => {
    const ranges = [];
    const start = new Date(firstDonationStartDate);
    console.log(start);
    const end = new Date(lastDonationEndDate);
    console.log(end);

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
      donation?.donorInfo?.name.toLowerCase().includes(search.toLowerCase()) ||
      donation?.goalInfo?.name.toLowerCase().includes(search.toLowerCase())
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
      fetchDetails();
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
        <DialogContent
          sx={{
            minWidth: "10rem",
          }}
        >
          {selectedDonation && (
            <>
              <div className="mt-2 p-5">
                <Typography variant="body1">
                  <strong>Donor name:</strong>{" "}
                  {selectedDonation?.donorInfo?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Item name:</strong>{" "}
                  {selectedDonation?.inKindDetails?.itemName}
                </Typography>
                <Typography variant="body1">
                  <strong>Estimate value:</strong>{" "}
                  {selectedDonation?.inKindDetails?.estimatedValue}
                </Typography>
                <Typography variant="body1">
                  <strong>Item name:</strong> {selectedDonation?.goalInfo?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Select a status:</strong>
                </Typography>
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

      <Dialog
        open={openGenerateReportModal}
        onClose={handleGenerateReportModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Report Period</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Period Selection */}
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select value={selectedPeriod} onChange={handlePeriodChange}>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>

            {/* Range Selection (Appears only if a period is selected) */}
            {selectedPeriod && (
              <FormControl fullWidth>
                <InputLabel>Select Range</InputLabel>
                <Select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value!)}
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
            <FormControl fullWidth>
              <InputLabel>Report File Type</InputLabel>
              <Select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                <MenuItem value="word">Word</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleGenerateReportModalClose}
            sx={{ color: "gray" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (!selectedRange) {
                alert("Please select a range.");
                return;
              }
              generateReport(selectedRange, fileType);
            }}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

      <div className="text-right">
        <Button
          onClick={() => setOpenGenerateReportModal(true)}
          style={{
            backgroundColor: "#1450ac",
            color: "#fff",
            padding: "1rem",
            cursor: "pointer",
            position: "fixed",
            bottom: "2rem",
            right: "3rem",
          }}
        >
          Generate Report
        </Button>
      </div>
    </div>
  );
};

export default DonationDetails;
