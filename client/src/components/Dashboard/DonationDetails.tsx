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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../../api/api";
import {
  DescriptionOutlined,
  Edit,
  PictureAsPdfOutlined,
  TableChartOutlined,
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
  const [openGenerateReportModal, setOpenGenerateReportModal] =
    useState<boolean>(false);
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

  function generateReport(selectedRange: any, fileType: string) {
    console.log(selectedRange, fileType);
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
