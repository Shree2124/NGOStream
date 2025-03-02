import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  ThemeProvider,
  createTheme,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import SchoolIcon from "@mui/icons-material/School";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
    },
    secondary: {
      main: "#1565c0",
    },
  },
  typography: {
    h2: {
      fontWeight: 700,
      color: "#1a5632",
    },
    h4: {
      fontWeight: 600,
    },
  },
});

const VisionCard = ({ title, description, icon }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: 3,
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 4 }}>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 80,
            height: 80,
            margin: "0 auto 20px auto",
            p: 2,
          }}
        >
          {icon}
        </Avatar>
        <Typography
          variant="h4"
          component="h3"
          gutterBottom
          color="primary"
          sx={{ mb: 2 }}
        >
          {title}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const NGOVisionPage = () => {
  // Vision pillars data
  const visionPillars = [
    {
      id: 1,
      title: "Empower Communities",
      description:
        "We envision a world where every community has the resources and knowledge to determine their own future. We believe in providing tools rather than solutions, enabling sustainable growth.",
      icon: <TipsAndUpdatesIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 2,
      title: "Quality Education",
      description:
        "We strive for a future where quality education is accessible to all children regardless of socioeconomic status. Our vision is to close the educational gap through innovative approaches and technology.",
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 3,
      title: "Healthcare Equity",
      description:
        "We envision communities where preventive healthcare and medical services are available to everyone. We work to eliminate health disparities and promote wellness education.",
      icon: <HealthAndSafetyIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 4,
      title: "Environmental Sustainability",
      description:
        "Our vision includes communities that live in harmony with nature, utilizing sustainable practices and renewable resources to ensure a healthy planet for future generations.",
      icon: <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #64b5f1 0%, #81c693 100%)",
          py: 8,
        }}
      >
        <Container>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" component="h1" sx={{ mb: 3 }}>
              Our Vision
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "1.3rem",
                color: "#fff",
                maxWidth: "800px",
                margin: "0 auto",
                textShadow: "0px 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Creating a sustainable future through community empowerment,
              education, and environmental stewardship
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 6,
              borderRadius: 4,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              Our Guiding Principles
            </Typography>
            <Typography variant="body1" paragraph>
              At the heart of our organization is a simple yet powerful belief:
              positive change begins at the community level. We approach every
              initiative with respect for local cultures, collaboration with
              community leaders, and commitment to sustainable solutions that
              continue to benefit communities long after our direct involvement
              ends.
            </Typography>
            <Typography variant="body1">
              We measure our success not by the number of projects completed,
              but by the lasting positive impact on human lives, community
              resilience, and environmental health.
            </Typography>
          </Paper>

          <Typography
            variant="h4"
            sx={{ mb: 4, color: "#fff", textAlign: "center" }}
          >
            The Four Pillars of Our Vision
          </Typography>

          <Grid container spacing={4}>
            {visionPillars.map((pillar) => (
              <Grid item key={pillar.id} xs={12} sm={6} md={3}>
                <VisionCard
                  title={pillar.title}
                  description={pillar.description}
                  icon={pillar.icon}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default NGOVisionPage;
