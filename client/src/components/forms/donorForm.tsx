import React, { useState } from "react";
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

const DonationForm: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const [step, setStep] = useState(1);
  const [donationType, setDonationType] = useState<string | null>(null);

  const [donorData, setDonorData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [monetaryData, setMonetaryData] = useState({
    amount: 0,
    currency: "USD",
    paymentMethod: "",
    transactionId: "",
  });

  const [inKindData, setInKindData] = useState({
    itemName: "",
    image: "",
    quantity: 0,
    estimatedValue: 0,
    description: "",
  });

  const handleDonationTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDonationType(event.target.value as string);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "donor" | "monetary" | "inKind"
  ) => {
    if (type === "donor") {
      setDonorData({ ...donorData, [e.target.name]: e.target.value });
    } else if (type === "monetary") {
      setMonetaryData({ ...monetaryData, [e.target.name]: e.target.value });
    } else {
      setInKindData({ ...inKindData, [e.target.name]: e.target.value });
    }
  };

  const makePayment = async () => {
    try {
      const stripe = await stripePromise;

      const response = await api.post(`/donation/checkout`, {
        ...donorData,
        donationType,
        monetaryDetails: donationType === "Monetary" ? monetaryData : undefined,
        inKindDetails: donationType === "In-Kind" ? inKindData : undefined,
        goalId,
      });

      const result = await stripe?.redirectToCheckout({
        sessionId: response?.data?.data.sessionId,
      });

      if (result?.error) {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error("Error during payment:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (donationType === "Monetary") {
      makePayment();
    } else {
      console.log("In-Kind Donation Data Submitted:", { ...donorData, ...inKindData });
      alert("In-Kind Donation Submitted!");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", padding: 3 }}>
      {step === 1 && (
        <>
          <Typography variant="h5" sx={{ marginBottom: 3, textAlign: "center" }}>
            Select Donation Type
          </Typography>
          <FormControl fullWidth sx={{ marginBottom: 3 }}>
            <InputLabel id="donation-type-label">Donation Type</InputLabel>
            <Select
              labelId="donation-type-label"
              value={donationType}
              onChange={handleDonationTypeChange}
            >
              <MenuItem value="Monetary">Monetary</MenuItem>
              <MenuItem value="In-Kind">In-Kind</MenuItem>
            </Select>
          </FormControl>
          {donationType && (
            <Button variant="contained" color="primary" fullWidth onClick={() => setStep(2)}>
              Next
            </Button>
          )}
        </>
      )}

      {step === 2 && donationType && (
        <>
          <Typography variant="h5" sx={{ marginBottom: 3, textAlign: "center" }}>
            {donationType === "Monetary" ? "Monetary Donation" : "In-Kind Donation"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={donorData.name}
              onChange={(e) => handleChange(e, "donor")}
              required
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={donorData.email}
              onChange={(e) => handleChange(e, "donor")}
              required
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={donorData.phone}
              onChange={(e) => handleChange(e, "donor")}
              required
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={donorData.address}
              onChange={(e) => handleChange(e, "donor")}
              required
              sx={{ marginBottom: 3 }}
            />

            {donationType === "Monetary" ? (
              <>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={Number(monetaryData.amount)}
                  onChange={(e) => handleChange(e, "monetary")}
                  required
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  fullWidth
                  label="Currency"
                  name="currency"
                  value={monetaryData.currency}
                  onChange={(e) => handleChange(e, "monetary")}
                  required
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  fullWidth
                  label="Payment Method"
                  name="paymentMethod"
                  value={monetaryData.paymentMethod}
                  onChange={(e) => handleChange(e, "monetary")}
                  required
                  sx={{ marginBottom: 3 }}
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Item Name"
                  name="itemName"
                  value={inKindData.itemName}
                  onChange={(e) => handleChange(e, "inKind")}
                  required
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  fullWidth
                  label="Image URL"
                  name="image"
                  value={inKindData.image}
                  onChange={(e) => handleChange(e, "inKind")}
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={inKindData.quantity}
                  onChange={(e) => handleChange(e, "inKind")}
                  required
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  fullWidth
                  label="Estimated Value"
                  name="estimatedValue"
                  type="number"
                  value={inKindData.estimatedValue}
                  onChange={(e) => handleChange(e, "inKind")}
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={inKindData.description}
                  onChange={(e) => handleChange(e, "inKind")}
                  required
                  sx={{ marginBottom: 3 }}
                />
              </>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {donationType === "Monetary" ? "Donate Now" : "Submit Donation"}
              </Button>
            </Box>
          </form>
        </>
      )}
    </Box>
  );
};

export default DonationForm;
