/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { fetchUser } from "../../redux/slices/authSlice";
import { api } from "../../api/api";
import toast, { Toaster } from "react-hot-toast";
import { keyframes } from "@emotion/react";
import LoginPage from "../../assets/login.jpg";
// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-10px) translateX(5px);
  }
  100% {
    transform: translateY(0px) translateX(0px);
  }
`;

// Predefined positions for floating elements
const floatingElementsPositions = [
  { top: "15%", left: "10%" },
  { top: "25%", right: "15%" },
  { top: "75%", left: "15%" },
  { top: "65%", right: "10%" },
  { bottom: "20%", left: "50%" },
];

const impactMetrics = [
  { text: "Lives Impacted", delay: 0 },
  { text: "Communities Served", delay: 1 },
  { text: "Volunteers Active", delay: 2 },
  { text: "Projects Completed", delay: 3 },
  { text: "Countries Reached", delay: 4 },
];

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const loadingToast = toast.loading("Signing in...");
    setIsLoading(true);

    try {
      const res = await api.post("/users/login", { username, password });
      console.log(res.data);
      
      toast.success("Welcome back to our community!", {
        id: loadingToast,
        duration: 3000,
      });
      dispatch(fetchUser());
      navigate("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage, {
        id: loadingToast,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: `url(${LoginPage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(45deg, rgba(76, 175, 80, 0.7) 0%, rgba(33, 150, 243, 0.4) 100%)",
          backdropFilter: "blur(3px)",
        },
      }}
    >
      <Toaster position="top-right" />

      {/* Fixed Position Floating Elements */}
      {impactMetrics.map((metric, index) => (
        <Box
          key={metric.text}
          sx={{
            position: "absolute",
            padding: "15px 25px",
            borderRadius: "15px",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            color: "white",
            fontSize: "0.9rem",
            fontWeight: "500",
            animation: `${float} ${4 + metric.delay}s ease-in-out infinite`,
            animationDelay: `${metric.delay * 0.5}s`,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            zIndex: 1,
            whiteSpace: "nowrap",
            ...floatingElementsPositions[index],
            transform: "translate(-50%, -50%)",
            transition: "all 0.3s ease-in-out",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {metric.text}
        </Box>
      ))}

      {/* Login Form */}
      <Paper
        elevation={24}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "40px",
          margin: "20px",
          animation: `${fadeIn} 0.8s ease-out`,
          zIndex: 2,
          "&:hover": {
            transform: "translateY(-5px)",
            transition: "transform 0.3s ease",
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            mb: 2,
          }}
        >
          <span style={{ color: "#4CAF50" }}>Welcome</span>{" "}
          <span style={{ color: "#2196F3" }}>Back</span>
        </Typography>

        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "text.secondary",
            mb: 4,
          }}
        >
          Together we can make a difference
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            id="username"
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: "#4CAF50" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
                "&.Mui-focused": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
              },
            }}
          />

          <TextField
            fullWidth
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "#4CAF50" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
                "&.Mui-focused": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            sx={{
              mt: 4,
              mb: 2,
              py: 1.5,
              borderRadius: "10px",
              fontSize: "1.1rem",
              textTransform: "none",
              color: "white",
              background: "linear-gradient(45deg, #4CAF50, #2196F3)",
              boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In to Continue"
            )}
          </Button>

          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              mt: 2,
              color: "text.secondary",
            }}
          >
            Join us in creating positive change
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
