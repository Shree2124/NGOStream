import { Box, Button, Grid, Modal, TextField, Typography } from "@mui/material";
import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import register from "../../assets/register.jpg";
import { api } from "../../api/api";

const Register: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [activationToken, setActivationToken] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleClose = () => setModal(false);

  const handleOtp = async () => {
    console.log(otp);
    try {
      const res = await api.post("/users/verify-user", {
        activationToken,
        otp,
      });
      console.log(res.data);
      if (res.data.statusCode === 200) {
        handleClose();
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    const fullNameRegex = /^[a-zA-Z\s]{3,}$/;

    if (!fullNameRegex.test(fullName)) {
      setError(
        "Full name must be at least 3 characters and contain only letters and spaces."
      );
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!usernameRegex.test(username)) {
      setError("Username must be at least 3 alphanumeric characters.");
      return false;
    }
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 6 characters long and include at least 1 letter and 1 number."
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const res = await api.post("/users/register", {
          fullName,
          username,
          password,
          email,
        });
        console.log(res.data.data);
        setActivationToken(res.data.data);
        setModal(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid
        item
        xs={false}
        md={6}
        sx={{
          display: { xs: "none", md: "block" },
          backgroundImage: `url(${register})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-black h-full opacity-[0.5]"></div>
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: { md: "2rem" },
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            width: "100%",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <Typography variant="h4" mb={2}>
            Create Account
          </Typography>
          <Typography variant="body2" mb={3}>
            Sign up to get started
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              id="fullName"
              label="Full Name"
              variant="outlined"
              margin="normal"
              value={fullName}
              onChange={handleInputChange(setFullName)}
              error={!!error && error.includes("Full name")}
              helperText={error && error.includes("Full name") ? error : ""}
            />
            <TextField
              fullWidth
              id="email"
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={handleInputChange(setEmail)}
              error={!!error && error.includes("email")}
              helperText={error && error.includes("email") ? error : ""}
            />
            <TextField
              fullWidth
              id="username"
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={handleInputChange(setUsername)}
              error={!!error && error.includes("Username")}
              helperText={error && error.includes("Username") ? error : ""}
            />
            <TextField
              fullWidth
              id="password"
              type="password"
              label="Password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={handleInputChange(setPassword)}
              error={!!error && error.includes("Password")}
              helperText={error && error.includes("Password") ? error : ""}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Register
            </Button>
          </form>

          <Typography variant="body2" mt={3}>
            Already have an account? <Link to={"/login"}>Log in</Link>
          </Typography>
        </Box>
      </Grid>

      <Modal
        open={modal}
        onClose={handleClose}
        aria-labelledby="otp-modal-title"
        aria-describedby="otp-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translate(-50%, 0)",
            width: 300,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="otp-modal-title" variant="h6" gutterBottom>
            Enter OTP
          </Typography>
          <TextField
            label="OTP"
            variant="outlined"
            fullWidth
            value={otp}
            onChange={handleInputChange(setOtp)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" fullWidth onClick={handleOtp}>
            Submit
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
};

export default Register;
