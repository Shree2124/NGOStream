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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../../api/api";

interface IDonation {
  _id: string;
  donorInfo: {name: string};
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  goalInfo: {name: string};
  currency: string;
}

const DonationDetails: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showSearch, setShowSearch] = useState(false);
  const [donationData, setDonationData] = useState<IDonation[]>([]);

  const filteredDonations = donationData.filter(
    (donation: IDonation) =>
      donation.donorInfo.name.toLowerCase().includes(search.toLowerCase()) ||
      donation.amount.toString().includes(search) ||
      donation.paymentStatus.toLowerCase().includes(search.toLowerCase()) ||
      donation.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );
  console.log(filteredDonations);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get("/donation/get-donation-info");
        console.log(res);

        setDonationData(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDetails();
  }, []);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    console.log(event?.type);
    
    setPage(newPage);
  };
  

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
              <InputAdornment position="start">🔍</InputAdornment>
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
          startAdornment: <InputAdornment position="start">🔍</InputAdornment>,
        }}
        sx={{ mb: 3, display: { xs: "none", md: "block" } }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Donor Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Campaign</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDonations
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              ?.map((donation: IDonation) => (
                <TableRow key={donation._id}>
                  <TableCell>
                    {donation?.donorInfo?.name || "Unknown"}
                  </TableCell>
                  <TableCell>{donation.amount || "Unknown"}</TableCell>
                  <TableCell>{donation.currency || "Unknown"}</TableCell>
                  <TableCell>{donation.paymentStatus || "Unknown"}</TableCell>
                  <TableCell>{donation.paymentMethod || "Unknown"}</TableCell>
                  <TableCell>{donation.goalInfo?.name || "Unknown"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDonations.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default DonationDetails;
