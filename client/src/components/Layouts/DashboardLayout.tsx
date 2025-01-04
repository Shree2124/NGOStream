import {
  Box,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import {
  Close,
  Menu,
  ExitToApp,
  Home,
  Person2,
  ManageAccounts,
  VolunteerActivism,
  Event,
} from "@mui/icons-material";
import { ReactNode, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const fontFamily = "'Poppins', sans-serif";

interface Tab {
  name: string;
  path: string;
  icon: JSX.Element;
}

const fitNotesTabs: Tab[] = [
  { name: "Home", path: "/dashboard", icon: <Home /> },
  {
    name: "Member Management",
    path: "/dashboard/members-details",
    icon: <ManageAccounts />,
  },
  {
    name: "Donations",
    path: "/dashboard/donation-details",
    icon: <VolunteerActivism />,
  },
  { name: "Events", path: "/dashboard/events", icon: <Event /> },
  // { name: "Profile", path: "/dashboard/profile", icon: <Person2 /> },
];

const Link = styled(RouterLink)(({ theme }) => ({
  textDecoration: "none",
  borderRadius: "8px",
  padding: "0.8rem 1rem",
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.primary,
  fontFamily: fontFamily,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.paper,
  },
}));

interface SideBarProps {
  w?: string;
  h?: string;
}

const SideBar: React.FC<SideBarProps> = ({ w = "100%", h = "" }) => {
  const location = useLocation();

  const logoutHandler = () => {
    console.log("User logged out");
  };

  return (
    <Stack
      width={w}
      bgcolor="whitesmoke"
      height={h || "100vh"}
      direction={"column"}
      justifyContent={"space-between"}
      p={"2rem"}
      spacing={"2rem"}
      alignItems={"center"}
      sx={{
        color: "black",
        fontFamily: fontFamily,
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.2)",
        position: "relative",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          fontFamily: "monospace",
        }}
      >
        NGOStream
      </Typography>

      <Stack spacing={"0.7rem"}>
        {fitNotesTabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            sx={
              location.pathname === tab.path
                ? {
                    bgcolor: "black",
                    color: "white",
                  }
                : undefined
            }
          >
            <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
              {tab.icon}
              <Typography>{tab.name}</Typography>
            </Stack>
          </Link>
        ))}
      </Stack>

      <Stack>
        <Link onClick={logoutHandler} to={"#"}>
          <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
            <ExitToApp />
            <Typography>Logout</Typography>
          </Stack>
        </Link>
      </Stack>
    </Stack>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  const handleMobile = () => {
    setIsMobile(!isMobile);
  };
  const handleClose = () => {
    setIsMobile(false);
  };

  return (
    <Grid
      container
      sx={{
        bgcolor: "background.default",
        fontFamily: fontFamily,
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          right: "1rem",
          top: "1rem",
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={handleMobile}
          sx={{
            color: "primary.main",
            fontSize: "2rem",
          }}
        >
          {isMobile ? <Close /> : <Menu />}
        </IconButton>
      </Box>

      <Grid
        item
        md={3}
        lg={2.5}
        sx={{
          display: { xs: "none", md: "block" },
          height: "100vh",
        }}
      >
        <SideBar />
      </Grid>

      <Grid
        item
        xs={12}
        md={9}
        lg={9.5}
        sx={{
          bgcolor: "background.paper",
          padding: "2rem",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {children}
      </Grid>

      <Drawer
        open={isMobile}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: "background.default",
            width: "75vw",
          },
        }}
      >
        <SideBar w="75vw" />
      </Drawer>
    </Grid>
  );
};

export default DashboardLayout;
