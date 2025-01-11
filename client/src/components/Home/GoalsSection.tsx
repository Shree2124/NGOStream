import React, { useEffect, useState } from "react";
import { Button, LinearProgress, Typography, Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";

const GoalsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate()
  const [goalsData, setGoalsData] = useState([])

  useEffect(()=>{
    const fetchGoalsData = async()=>{
    try {
      const res = await api.get("/goals/all-goals")
      setGoalsData(res.data.data)
    } catch (error) {
      console.log(error);
    }}

    fetchGoalsData()
  },[])

  const handleNavigate = (goalId) =>{
    navigate(`/donor-form/${goalId}`)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? goalsData.length - itemsPerView() : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === goalsData.length - itemsPerView() ? 0 : prevIndex + 1
    );
  };

  const itemsPerView = () => {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 960) return 2;
    return 3;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        textAlign: "center",
        padding: { xs: 2, md: 4, lg: 6 },
      }}
      id="goals"
    >
      <Typography variant="h4" gutterBottom>
        Our Goals
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "nowrap",
        }}
      >
        <Button
          variant="outlined"
          onClick={handlePrev}
          sx={{
            minWidth: { xs: "30px", md: "50px" },
            fontSize: { xs: "12px", md: "16px" },
            marginRight: 2,
          }}
        >
          &#8592;
        </Button>

        <Grid
          container
          spacing={2}
          sx={{
            maxWidth: "90%",
            overflow: "hidden",
            flexWrap: "nowrap",
          }}
        >
          {goalsData
            .slice(currentIndex, currentIndex + itemsPerView())
            .map((goal) => (
              <Grid item xs={12} sm={6} md={4} key={goal.id}>
                <Box
                  sx={{
                    backgroundColor: "#f4f4f4",
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 2,
                    height: "100%",
                  }}
                >
                  <img
                    src={goal.image}
                    alt={goal.name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <Typography variant="h6" sx={{ marginTop: 2 }}>
                    {goal.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", marginBottom: 2 }}
                  >
                    {goal.description}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Target: ${goal.targetAmount}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", color: "green" }}
                    >
                      {((goal.currentAmount / goal.targetAmount) * 100).toFixed(
                        2
                      )}
                      %
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={(goal.raisedAmount / goal.targetAmount) * 100}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#4caf50",
                      },
                    }}
                  />
                  <Button
                    onClick={()=>handleNavigate(goal._id)}
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 2, width: "100%" }}
                  >
                    Donate
                  </Button>
                </Box>
              </Grid>
            ))}
        </Grid>

        <Button
          variant="outlined"
          onClick={handleNext}
          sx={{
            minWidth: { xs: "30px", md: "50px" },
            fontSize: { xs: "12px", md: "16px" },
            marginLeft: 2,
          }}
        >
          &#8594;
        </Button>
      </Box>
    </Box>
  );
};

export default GoalsSection;
