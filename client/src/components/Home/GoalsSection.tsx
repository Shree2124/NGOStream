import React, { useEffect, useState } from "react";
import {
  Button,
  LinearProgress,
  Typography,
  Box,
  CardContent,
  Card,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";


const GoalsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [goalsData, setGoalsData] = useState([]);

  useEffect(() => {
    const fetchGoalsData = async () => {
      try {
        const res = await api.get("/goals/all-goals");
        const filteredGoals = res.data.data.filter((goal) => {
          return (
            goal.status === "Active" && new Date(goal.startDate) <= new Date()
          );
        });
  
        setGoalsData(filteredGoals);
        console.log(filteredGoals);
      } catch (error) {
        console.log(error);
      }
    };

    fetchGoalsData();
  }, []);

  const itemsPerView = () => {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 960) return 2;
    return 3;
  };

  const visibleGoals = goalsData.slice(
    currentIndex,
    currentIndex + itemsPerView()
  );

  return (
    <Box
      sx={{
        width: "100%",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
      }}
      id="goals"
    >
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        Our Goals
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mb: 4,
          color: "text.secondary",
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        Discover the impactful goals we’re working towards. Your support helps
        make a difference.
      </Typography>

      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Carousel opts={{ align: "start" }} className="lg:min-w-[40rem] lg:max-w-[70rem] md:min-w-[25rem]">
          <CarouselContent>
            {visibleGoals.map((goal, index) => (
              <CarouselItem
                key={goal._id}
                className="md:basis-1/2 lg:basis-1/3 p-2"
              >
                <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <img
                    src={goal.image}
                    alt={goal.name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px 8px 0 0",
                    }}
                  />
                  <CardContent sx={{ textAlign: "left" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {goal.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 2 }}
                    >
                      {goal.description}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold" }}
                      >
                        Target: ₹{goal.targetAmount}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: "green" }}
                      >
                        {((goal.currentAmount / goal.targetAmount) * 100).toFixed(
                          2
                        )}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(goal.currentAmount / goal.targetAmount) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#4caf50",
                        },
                      }}
                    />
                    <Button
                      onClick={() => navigate(`/donor-form/${goal?._id}`)}
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2, borderRadius: 5 }}
                    >
                      Donate Now
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            onClick={() =>
              setCurrentIndex(
                currentIndex === 0
                  ? goalsData.length - itemsPerView()
                  : currentIndex - 1
              )
            }
          />
          <CarouselNext
            onClick={() =>
              setCurrentIndex(
                currentIndex === goalsData.length - itemsPerView()
                  ? 0
                  : currentIndex + 1
              )
            }
          />
        </Carousel>
      </Box>
    </Box>
  );
};

export default GoalsSection;
