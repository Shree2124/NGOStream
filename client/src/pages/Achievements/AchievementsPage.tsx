import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  ThemeProvider,
  createTheme,
  Chip,
  LinearProgress,
  Divider,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleIcon from "@mui/icons-material/People";
import PublicIcon from "@mui/icons-material/Public";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#388e3c",
    },
    success: {
      main: "#2e7d32",
    },
  },
  typography: {
    h2: {
      fontWeight: 700,
      color: "#1565c0",
    },
    h5: {
      fontWeight: 600,
    },
  },
});

const AchievementCard = ({
  title,
  description,
  image,
  category,
  impact,
  progress,
}) => {
  // Determine chip color based on category
  const chipColor =
    category === "Education"
      ? "primary"
      : category === "Healthcare"
      ? "secondary"
      : category === "Environment"
      ? "success"
      : "default";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 3,
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
        },
      }}
    >
      <CardMedia component="img" height="180" image={image} alt={title} />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h3" gutterBottom color="primary">
            {title}
          </Typography>
          <Chip
            label={category}
            color={chipColor}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>

        <Box sx={{ mt: "auto" }}>
          <Typography
            variant="subtitle2"
            color="text.primary"
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            <CheckCircleIcon
              fontSize="small"
              sx={{ mr: 1, color: "success.main" }}
            />
            Impact: {impact}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Progress:
            </Typography>
            <Box sx={{ width: "100%", mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: "rgba(0,0,0,0.08)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    backgroundColor:
                      progress >= 100 ? "success.main" : "primary.main",
                  },
                }}
              />
            </Box>
            <Typography variant="body2">{progress}%</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const NGOAchievementsPage = () => {
  // Achievement data
  const achievements = [
    {
      id: 1,
      title: "Digital Literacy Program",
      description:
        "Launched computer literacy programs in 25 rural schools, trained 500+ students and 50 teachers in basic computing skills and internet access.",
      image: "https://via.placeholder.com/400x200?text=Digital+Literacy",
      category: "Education",
      impact: "500+ students gained computer skills",
      progress: 100,
    },
    {
      id: 2,
      title: "Rural Healthcare Initiative",
      description:
        "Established 12 mobile health clinics reaching remote villages, providing basic healthcare services, vaccinations, and health education to underserved communities.",
      image: "https://via.placeholder.com/400x200?text=Healthcare+Initiative",
      category: "Healthcare",
      impact: "5,000+ individuals received medical care",
      progress: 85,
    },
    {
      id: 3,
      title: "Clean Water Project",
      description:
        "Installed 30 water purification systems in communities facing water contamination issues, providing safe drinking water and reducing waterborne diseases.",
      image: "https://via.placeholder.com/400x200?text=Clean+Water",
      category: "Environment",
      impact: "15,000+ people gained access to clean water",
      progress: 100,
    },
    {
      id: 4,
      title: "Sustainable Farming",
      description:
        "Trained 200 farmers in sustainable agricultural practices, helping them transition to organic farming methods and improve crop yields while reducing environmental impact.",
      image: "https://via.placeholder.com/400x200?text=Sustainable+Farming",
      category: "Environment",
      impact: "200 acres converted to sustainable farming",
      progress: 70,
    },
    {
      id: 5,
      title: "Youth Mentorship Program",
      description:
        "Paired 150 at-risk youth with professional mentors for career guidance, skill development, and personal growth through weekly mentoring sessions.",
      image: "https://via.placeholder.com/400x200?text=Youth+Mentorship",
      category: "Education",
      impact: "150 youth received career mentorship",
      progress: 90,
    },
    {
      id: 6,
      title: "Women's Empowerment",
      description:
        "Established vocational training centers for women, providing skills in entrepreneurship, textiles, and technology to enable financial independence.",
      image: "https://via.placeholder.com/400x200?text=Women+Empowerment",
      category: "Education",
      impact: "300+ women started small businesses",
      progress: 80,
    },
  ];

  // Impact statistics
  const impactStats = [
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      value: "20,000+",
      label: "Lives Impacted",
    },
    {
      icon: <PublicIcon sx={{ fontSize: 40 }} />,
      value: "45",
      label: "Communities Served",
    },
    {
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      value: "$1.2M",
      label: "Funds Raised",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #64b5f6 0%, #81c784 100%)",
          py: 8,
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" align="center" sx={{ mb: 2 }}>
            Our Achievements
          </Typography>

          <Typography
            variant="subtitle1"
            component="p"
            align="center"
            sx={{
              mb: 6,
              color: "#fff",
              fontSize: "1.3rem",
              maxWidth: "800px",
              margin: "0 auto 40px auto",
              textShadow: "0px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Celebrating our impact and the milestones we've reached together
          </Typography>

          {/* Impact statistics */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {impactStats.map((stat, index) => (
              <Grid item key={index} xs={12} md={4}>
                <Card
                  sx={{
                    textAlign: "center",
                    py: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <Box sx={{ color: "primary.main" }}>{stat.icon}</Box>
                  <Typography variant="h3" sx={{ my: 2, fontWeight: "bold" }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mb: 6 }} />

          <Typography variant="h4" align="center" sx={{ mb: 5, color: "#fff" }}>
            Key Projects & Milestones
          </Typography>

          <Grid container spacing={4}>
            {achievements.map((achievement) => (
              <Grid item key={achievement.id} xs={12} sm={6} md={4}>
                <AchievementCard
                  title={achievement.title}
                  description={achievement.description}
                  image={achievement.image}
                  category={achievement.category}
                  impact={achievement.impact}
                  progress={achievement.progress}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 8, textAlign: "center" }}>
            <Typography
              variant="h6"
              component="p"
              sx={{ color: "#fff", fontWeight: 500, mb: 3 }}
            >
              Your support makes these achievements possible.
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                borderRadius: 6,
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                boxShadow: 3,
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 5,
                },
                transition: "all 0.3s ease",
              }}
            >
              Support Our Work
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default NGOAchievementsPage;
