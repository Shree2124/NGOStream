import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";

console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

const DonationForm: React.FC = () => {
  const {goalId} = useParams<{ goalId: string }>()

  console.log(goalId);
  

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    goalId,
    amount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const makePayment = async () => {
    try {
      const stripe = await stripePromise;

      const response = await api.post(`/donation/checkout`, formData);
      console.log(response);
      

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
    makePayment();
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", padding: 3 }}>
      <Typography variant="h5" sx={{ marginBottom: 3, textAlign: "center" }}>
        Donate to a Goal
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="Amount (USD)"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          required
          sx={{ marginBottom: 3 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Donate Now
        </Button>
      </form>
    </Box>
  );
};

export default DonationForm;
