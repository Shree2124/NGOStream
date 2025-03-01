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
  Button,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../../api/api";
import {
  DescriptionOutlined,
  Edit,
  PictureAsPdfOutlined,
  TableChartOutlined,
  AddCircleOutline,
} from "@mui/icons-material";
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

interface ICampaign {
  _id: string;
  name: string;
}

interface IEvent {
  _id: string;
  name: string;
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

  // Manual donation states
  const [manualDonationModal, setManualDonationModal] = useState<boolean>(
    false
  );
  const [donationTarget, setDonationTarget] = useState<string>("campaign");
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [itemName, setItemName] = useState<string>("");
  const [itemValue, setItemValue] = useState<string>("");
  const [itemQuantity, setItemQuantity] = useState<string>("1");
  const [itemDescription, setItemDescription] = useState<string>("");

  const firstDonationStartDate =
    donationData.length > 0
      ? new Date(
          Math.min(
            ...donationData.map((event) => new Date(event.createdAt).getTime())
          )
        )
      : new Date();

  const lastDonationEndDate =
    donationData.length > 0
      ? new Date(
          Math.max(
            ...donationData.map((event) => new Date(event.createdAt).getTime())
          )
        )
      : new Date();

  const handleGenerateReportModalClose = () => {
    setOpenGenerateReportModal(false);
  };
  const handlePeriodChange = (event: any) => {
    setSelectedPeriod(event.target.value);
    setSelectedRange(null);
  };

  const generatePDFReport = async (filteredIds: any[], fileType: string) => {
    try {
      const res = await api.post("/event/generate-report", {
        ids: filteredIds,
        fileType: fileType,
        type: "donor",
      });
      console.log(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

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

  function generateSelectableRanges() {
    const ranges = [];
    const start = new Date(firstDonationStartDate);
    const end = new Date(lastDonationEndDate);

    if (selectedPeriod === "week") {
      const current = new Date(start);
      // Set current to the start of the week (Sunday)
      const dayOfWeek = current.getDay();
      current.setDate(current.getDate() - dayOfWeek);

      while (current <= end) {
        const weekStart = new Date(current);
        let weekEnd = new Date(current);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekEnd > end) weekEnd = new Date(end);

        const formattedWeekStart = weekStart.toDateString(); // e.g. "Sun Oct 27 2024"
        const formattedWeekEnd = weekEnd.toDateString(); // e.g. "Sat Nov 02 2024"
        const label = `${formattedWeekStart} - ${formattedWeekEnd}`;

        ranges.push({
          label: label,
          value: { from: weekStart, to: weekEnd },
        });
        current.setDate(current.getDate() + 7);
      }
    } else if (selectedPeriod === "month") {
      const current = new Date(start);
      current.setDate(1); // Start from first day of the month

      while (current <= end) {
        const monthStart = new Date(current);
        // Last day of the month
        let monthEnd = new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          0
        );
        if (monthEnd > end) monthEnd = new Date(end);

        const formattedMonthStart = monthStart.toDateString();
        const formattedMonthEnd = monthEnd.toDateString();
        const label = `${formattedMonthStart} - ${formattedMonthEnd}`;

        ranges.push({
          label: label,
          value: { from: monthStart, to: monthEnd },
        });
        current.setMonth(current.getMonth() + 1);
      }
    } else if (selectedPeriod === "year") {
      const current = new Date(start);
      current.setMonth(0, 1); // January 1st

      while (current <= end) {
        const yearStart = new Date(current.getFullYear(), 0, 1);
        let yearEnd = new Date(current.getFullYear(), 11, 31);
        if (yearEnd > end) yearEnd = new Date(end);

        const label = `${yearStart.getFullYear()}`;

        ranges.push({
          label: label,
          value: { from: yearStart, to: yearEnd },
        });
        current.setFullYear(current.getFullYear() + 1);
      }
    }
    return ranges;
  }

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/donation/get-donation-info/${type}`);
      setDonationData(res.data.data);
    } catch (error) {
      console.error("Error fetching donation data:", error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/campaign/get-all-campaigns");
      setCampaigns(res.data.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get("/event/get-all-events");
      setEvents(res.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    if (type !== "Monetary" && type !== "In-Kind") {
      setIsValidType(false);
      return;
    }

    fetchDetails();
  }, [type]);

  useEffect(() => {
    if (manualDonationModal) {
      fetchCampaigns();
      fetchEvents();
    }
  }, [manualDonationModal]);

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

  const handleOpenManualDonation = () => {
    setManualDonationModal(true);
  };

  const handleCloseManualDonation = () => {
    setManualDonationModal(false);
    setDonationTarget("campaign");
    setSelectedTarget("");
    setDonorName("");
    setDonorEmail("");
    setDonationAmount("");
    setPaymentMethod("Cash");
    setItemName("");
    setItemValue("");
    setItemQuantity("1");
    setItemDescription("");
  };

  const handleSubmitManualDonation = async () => {
    try {
      const payload = {
        donorInfo: {
          name: donorName,
          email: donorEmail,
        },
        donationType: type,
        goalType: donationTarget === "campaign" ? "Campaign" : "Event",
        goalId: selectedTarget,
        ...(type === "Monetary"
          ? {
              amount: parseFloat(donationAmount),
              paymentMethod: paymentMethod,
              paymentStatus: "Completed",
              currency: "USD", // Assuming USD as default
            }
          : {
              inKindDetails: {
                itemName: itemName,
                quantity: parseInt(itemQuantity),
                estimatedValue: parseFloat(itemValue),
                description: itemDescription,
                status: "Donated",
              },
              estimatedValue: parseFloat(itemValue) * parseInt(itemQuantity),
              status: "Donated",
            }),
      };

      const res = await api.post("/donation/create-manual-donation", payload);
      console.log("Manual donation created:", res.data);
      fetchDetails();
      handleCloseManualDonation();
    } catch (error) {
      console.error("Error creating manual donation:", error);
      alert("Failed to create donation. Please try again.");
    }
  };

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1 }}>
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
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutline />}
          sx={{
            backgroundColor: "#1450ac",
            color: "#fff",
            ml: 2,
            py: 1.5,
            px: 3,
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 600,
          }}
          onClick={handleOpenManualDonation}
        >
          Manual Donation
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          transition: "box-shadow 0.3s ease",
          backdropFilter: "blur(10px)",
          boxShadow: "0 12px 20px rgba(71, 117, 234, 0.12)",
          border: "1px solid rgba(229, 231, 235, 0.5)",
        }}
      >
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

      {/* Edit Donation Status Modal */}
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

      {/* Generate Report Modal */}
      <Dialog
        open={openGenerateReportModal}
        onClose={handleGenerateReportModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            pt: 3,
            px: 3,
            typography: "h5",
            fontWeight: 600,
          }}
        >
          Generate Report
        </DialogTitle>

        <DialogContent sx={{ p: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Period Selection */}
            <FormControl fullWidth variant="outlined" sx={{ mt: 3 }}>
              <InputLabel id="period-label">Time Period</InputLabel>
              <Select
                labelId="period-label"
                value={selectedPeriod}
                onChange={handlePeriodChange}
                label="Time Period"
              >
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="year">Yearly</MenuItem>
              </Select>
            </FormControl>

            {/* Range Selection */}
            {selectedPeriod && (
              <FormControl fullWidth variant="outlined">
                <InputLabel id="range-label">Date Range</InputLabel>
                <Select
                  labelId="range-label"
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value!)}
                  label="Date Range"
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
            <FormControl fullWidth variant="outlined">
              <InputLabel id="file-type-label">File Format</InputLabel>
              <Select
                labelId="file-type-label"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                label="File Format"
              >
                <MenuItem value="word">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionOutlined color="primary" fontSize="small" />
                    <span>Word Document</span>
                  </Box>
                </MenuItem>
                <MenuItem value="excel">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TableChartOutlined color="success" fontSize="small" />
                    <span>Excel Spreadsheet</span>
                  </Box>
                </MenuItem>
                <MenuItem value="pdf">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PictureAsPdfOutlined color="error" fontSize="small" />
                    <span>PDF Document</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={handleGenerateReportModalClose}
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => {
              if (!selectedRange) {
                alert("Please select a date range.");
                return;
              }
              generateReport(selectedRange, fileType);
            }}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Donation Modal */}
      <Dialog
        open={manualDonationModal}
        onClose={handleCloseManualDonation}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            pt: 3,
            px: 3,
            typography: "h5",
            fontWeight: 600,
          }}
        >
          Add Manual {type} Donation
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Donation Target Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                Donation Target
              </Typography>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="target-type-label">Donate To</InputLabel>
                <Select
                  labelId="target-type-label"
                  value={donationTarget}
                  onChange={(e) => {
                    setDonationTarget(e.target.value);
                    setSelectedTarget("");
                  }}
                  label="Donate To"
                >
                  <MenuItem value="campaign">Campaign</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Campaign/Event Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="target-selection-label">
                  Select {donationTarget === "campaign" ? "Campaign" : "Event"}
                </InputLabel>
                <Select
                  labelId="target-selection-label"
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  label={`Select ${
                    donationTarget === "campaign" ? "Campaign" : "Event"
                  }`}
                >
                  {donationTarget === "campaign"
                    ? campaigns.map((campaign) => (
                        <MenuItem key={campaign._id} value={campaign._id}>
                          {campaign.name}
                        </MenuItem>
                      ))
                    : events.map((event) => (
                        <MenuItem key={event._id} value={event._id}>
                          {event.name}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                fontWeight={500}
                sx={{ mt: 2 }}
              >
                Donor Information
              </Typography>
            </Grid>

            {/* Donor Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Donor Name"
                variant="outlined"
                fullWidth
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Donor Email"
                variant="outlined"
                fullWidth
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                fontWeight={500}
                sx={{ mt: 2 }}
              >
                Donation Details
              </Typography>
            </Grid>

            {/* Donation Type Specific Fields */}
            {type === "Monetary" ? (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Amount"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="payment-method-label">
                      Payment Method
                    </InputLabel>
                    <Select
                      labelId="payment-method-label"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      label="Payment Method"
                    >
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="Check">Check</MenuItem>
                      <MenuItem value="Credit Card">Credit Card</MenuItem>
                      <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Item Name"
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Estimated Value"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={itemValue}
                    onChange={(e) => setItemValue(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Quantity"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={handleCloseManualDonation}
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={handleSubmitManualDonation}
            disabled={
              !selectedTarget ||
              !donorName ||
              (type === "Monetary" ? !donationAmount : !itemName || !itemValue)
            }
            sx={{
              px: 3,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Submit Donation
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
