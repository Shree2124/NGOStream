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

interface IGoal {
  _id: string;
  name: string;
  description: string;
  targetAmount: number;
  startDate: string;
  status: string;
  image?: string;
  currentAmount: number;
}

const GoalsSection: React.FC = () => {

  const navigate = useNavigate();
  const [goalsData, setGoalsData] = useState<IGoal[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchGoalsData = async () => {
      try {
        const res = await api.get("/goals/all-goals");
        const filteredGoals = res.data.data.filter((goal: IGoal) => {
          return (
            goal.status === "Active" && new Date(goal.startDate) <= new Date()
          );
        });
        setGoalsData(filteredGoals);
      } catch (error) {
        console.log(error);
      }
    };

    fetchGoalsData();
  }, []);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const GoalCard = ({ goal }: { goal: IGoal }) => (
    <Card
      className="flex flex-col mx-auto mb-6 max-w-md h-[420px]"
      sx={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        borderRadius: 2,
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        },
        transition: "box-shadow 0.3s ease",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box
        className="relative h-44"
        sx={{
          borderRadius: "8px 8px 0 0",
          overflow: "hidden",
        }}
      >
        <img
          src={goal.image || "/placeholder-image.jpg"}
          alt={goal.name}
          className="w-full h-full object-cover"
        />
        <Box className="right-0 bottom-0 left-0 absolute bg-gradient-to-t from-black/50 to-transparent h-16" />
      </Box>

      <CardContent className="flex flex-col flex-1 p-5">
        <Typography
          variant="h6"
          className="mb-2 font-semibold text-lg line-clamp-2"
          sx={{ minHeight: "3.5rem" }}
        >
          {truncateText(goal.name, 60)}
        </Typography>

        <Typography
          variant="body2"
          className="mb-4 text-gray-600 line-clamp-3"
          sx={{ minHeight: "4.5rem" }}
        >
          {truncateText(goal.description, 120)}
        </Typography>

        <Box className="mt-auto">
          <Box className="flex justify-between items-center mb-1.5">
            <Typography variant="body2" className="font-medium text-gray-900">
              ₹{goal.currentAmount.toLocaleString()} raised
            </Typography>
            <Typography
              variant="body2"
              className="font-semibold text-green-600"
            >
              {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={(goal.currentAmount / goal.targetAmount) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              mb: 3,
              bgcolor: "#f0f0f0",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)",
              },
            }}
          />

          <Button
            onClick={() => navigate(`/donor-form/goal/${goal._id}`)}
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              py: 1.5,
              background: "linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)",
              borderRadius: 1.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(45deg, #45a049 30%, #1e88e5 90%)",
              },
            }}
            className="transform-transition hover:scale-105 duration-300 ease-in-out"
          >
            Support This Campaign
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box
      className="py-6 md:py-8"
      sx={{
        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(76, 175, 80, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)",
          pointerEvents: "none",
        },
      }}
      id="goals"
    >
      <Box className="mx-auto px-4 max-w-6xl">
        <Typography
          variant="h4"
          className="mb-3 font-bold text-center"
          sx={{
            background: "linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Current Campaigns
        </Typography>

        {isMobile ? (
          // Mobile view - stack cards vertically
          <Box className="space-y-6 py-4">
            {goalsData.map((goal) => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </Box>
        ) : (
          // Desktop view - carousel
          <Carousel className="p-4 w-full">
            <CarouselContent>
              {goalsData.map((goal: IGoal) => (
                <CarouselItem
                  key={goal._id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <GoalCard goal={goal} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className="left-0 lg:-left-12 bg-white/90 hover:bg-white"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                // "&:hover": {
                //   boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                // },
              }}
            />
            <CarouselNext
              className="right-0 lg:-right-12 bg-white/90 hover:bg-white"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                // "&:hover": {
                //   boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                // },
              }}
            />
          </Carousel>
        )}

        <Typography
          variant="h5"
          className="py-8 text-center"
          sx={{
            fontWeight: "bold",
            fontFamily: "monospace",
            background: "linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            cursor: "pointer",
          }}
        >
          Join us in making a difference through these active campaigns
        </Typography>
      </Box>
    </Box>
  );
};

export default GoalsSection;
