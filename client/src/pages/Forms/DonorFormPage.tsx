import React from "react";
import { Box, Typography } from "@mui/material";
import { DonorForm } from "../../components";

const DonorFormPage: React.FC = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h4"
        sx={{ textAlign: "center", marginBottom: 3, fontWeight: "bold" }}
      >
        Donate to Support Our Mission
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: "center",
          marginBottom: 4,
          maxWidth: 600,
          marginX: "auto",
        }}
      >
        Thank you for considering a donation to our cause. Your contribution
        helps us make a significant impact in the lives of those who need it
        most. Please fill out the form below to provide your details and make a
        donation. Together, we can make a difference!
      </Typography>
      <DonorForm />
    </Box>
  );
};

export default DonorFormPage;
