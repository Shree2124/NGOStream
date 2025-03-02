import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

const ManualDonationForm = ({
  open,
  onClose,
  type,
  campaigns,
  events,
  onSubmit,
}) => {
  const [donationTarget, setDonationTarget] = useState("campaign");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemDescription, setItemDescription] = useState("");

  const handleSubmit = () => {
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
            currency: "USD",
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

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Manual {type} Donation</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight={500}>
              Donation Target
            </Typography>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Donate To</InputLabel>
              <Select
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

          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>
                Select {donationTarget === "campaign" ? "Campaign" : "Event"}
              </InputLabel>
              <Select
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
            <Typography variant="subtitle1" gutterBottom fontWeight={500}>
              Donor Information
            </Typography>
          </Grid>

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
            <Typography variant="subtitle1" gutterBottom fontWeight={500}>
              Donation Details
            </Typography>
          </Grid>

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
                  <InputLabel>Payment Method</InputLabel>
                  <Select
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
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={
            !selectedTarget ||
            !donorName ||
            (type === "Monetary" ? !donationAmount : !itemName || !itemValue)
          }
        >
          Submit Donation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManualDonationForm;