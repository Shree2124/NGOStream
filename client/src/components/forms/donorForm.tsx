/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY as string
);

const DonationForm: React.FC = () => {
  const { id, type } = useParams<{ id: string, type: string }>();
  console.log(id, type);

  const [step, setStep] = useState(1);
  const [donationType, setDonationType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
  });

  const [inKindData, setInKindData] = useState({
    itemName: "",
    image: null as File | null,
    quantity: 0,
    estimatedValue: 0,
    description: "",
  });

  const handleDonationTypeChange = (event: SelectChangeEvent<string>) => {
    setDonationType(event.target.value as string);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: string
  ) => {
    if (type === "donor") {
      setDonorData({ ...donorData, [e.target.name]: e.target.value });
    } else if (type === "monetary") {
      console.log(e.target.name);
      setMonetaryData({ ...monetaryData, [e.target.name]: e.target.value });
    } else {
      setInKindData({ ...inKindData, [e.target.name]: e.target.value });
    }
  };

  const makePayment = async () => {
    try {
      const stripe = await stripePromise;
      let payload:any = {
        name: donorData.name,
        email: donorData.email,
        phone: donorData.phone,
        address: donorData.address,
        donationType,
        amount: donationType === "Monetary" ? monetaryData.amount : undefined,
      }

      if(type === "goal"){
        payload = {...payload, goalId: id}
      } else if(type === "event"){
        payload = {...payload, eventId: id}
      } else if(type === "beneficiary"){
        payload = {...payload, beneficiaryId: id}
      }

      const response = await api.post(`/donation/checkout`,{...payload} );

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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setInKindData({ ...inKindData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (donationType === "Monetary") {
      return makePayment();
    }



    console.log(inKindData)

    // Handle in-kind donation submission
    const formData: any = new FormData();
    formData.append("name", donorData.name);
    formData.append("email", donorData.email);
    formData.append("phone", donorData.phone);
    formData.append("address", donorData.address);
    formData.append("donationType", donationType ?? "");
    formData.append("itemName", inKindData.itemName);
    formData.append("quantity", inKindData.quantity.toString());
    formData.append("estimatedValue", inKindData.estimatedValue.toString());
    formData.append("description", inKindData.description);
    if(type === "goal"){
      formData.append("goalId",id?.toString())
    } else if(type === "event"){
      formData.append("eventId", id?.toString())
    } else if(type === "beneficiary"){
      formData.append("beneficiaryId", id?.toString())
    }
    if (inKindData.image) {
      formData.append("image", inKindData.image);
    }

    try {
      const res = await api.post("/donation/checkout", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(res.data);
      
    } catch (error) {
      console.error("Error submitting in-kind donation:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", padding: 3 }}>
      {step === 1 && (
        <>
          <Typography
            variant="h5"
            sx={{ marginBottom: 3, textAlign: "center" }}
          >
            Select Donation Type
          </Typography>
          <FormControl fullWidth sx={{ marginBottom: 3 }}>
            <InputLabel id="donation-type-label">Donation Type</InputLabel>
            <Select
              labelId="donation-type-label"
              value={donationType ?? undefined}
              onChange={handleDonationTypeChange}
            >
              <MenuItem value="Monetary">Monetary</MenuItem>
              <MenuItem value="In-Kind">In-Kind</MenuItem>
            </Select>
          </FormControl>
          {donationType && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setStep(2)}
            >
              Next
            </Button>
          )}
        </>
      )}

      {step === 2 && donationType && (
        <>
          <Typography
            variant="h5"
            sx={{ marginBottom: 3, textAlign: "center" }}
          >
            {donationType === "Monetary"
              ? "Monetary Donation"
              : "In-Kind Donation"}
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
                  value={monetaryData.amount}
                  onChange={(e) => handleChange(e, "monetary")}
                  required
                  sx={{ marginBottom: 2 }}
                />
              </>
            ) : (
              <>
                <div>
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
                    label="Item Description"
                    name="description"
                    value={inKindData.description}
                    onChange={(e) => handleChange(e, "inKind")}
                    required
                    sx={{ marginBottom: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Quantity"
                    name="quantity"
                    value={inKindData.quantity}
                    onChange={(e) => handleChange(e, "inKind")}
                    required
                    sx={{ marginBottom: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Estimate Value"
                    name="estimatedValue"
                    value={inKindData.estimatedValue}
                    onChange={(e) => handleChange(e, "inKind")}
                    required
                    sx={{ marginBottom: 2 }}
                  />

                  <Box
                    sx={{
                      width: "100px",
                      height: "100px",
                      border: "1px dashed gray",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      document.getElementById("inkindImg")?.click()
                    }
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      "+"
                    )}
                    <input
                      id="inkindImg"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        handleImageUpload(e);
                      }}
                    />
                  </Box>
                </div>
              </>
            )}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
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
