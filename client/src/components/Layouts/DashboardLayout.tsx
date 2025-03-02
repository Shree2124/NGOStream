import {
  Box,
  Stack,
  Typography,
  styled,
  Button,
  Collapse,
  Grid,
  IconButton,
  Drawer,
} from "@mui/material";
import {
  Close,
  Menu,
  ExitToApp,
  Home,
  ManageAccounts,
  VolunteerActivism,
  Event,
  Flag,
  // AccountBalance,
  ArrowDropDown,
  Money,
  BackupOutlined,
  ArrowBack,
  Logout,
  AdminPanelSettings,
} from "@mui/icons-material";
import { ReactNode, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { api } from "./../../api/api";
import toast from "react-hot-toast";

const fontFamily = "Proxima nova";

interface Tab {
  name: string;
  path: string;
  icon?: JSX.Element;
  subTabs?: Tab[];
}

const navTabs: Tab[] = [
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
    subTabs: [
      { name: "In-Kind", path: "/inkind" },
      { name: "Monetary", path: "/monetary" },
    ],
  },

  { name: "Events", path: "/dashboard/events", icon: <Event /> },
  { name: "Campaign", path: "/dashboard/goals", icon: <Flag /> },
  // { name: "Schemes", path: "/dashboard/schemes", icon: <AccountBalance /> },
  { name: "Impact", path: "/dashboard/impact", icon: <Money /> },
  {
    name: "Manage Admin",
    path: "/dashboard/manage-admin",
    icon: <AdminPanelSettings />,
  },
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
    backgroundColor: " rgba(0, 0, 0, 0.1)",
    // color: "",
  },
}));

const SideBar: React.FC<{ w: string }> = ({ w }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openTabs, setOpenTabs] = useState<Record<string, boolean>>({});

  const toggleDropdown = (tabName: string) => {
    setOpenTabs((prev) => ({ ...prev, [tabName]: !prev[tabName] }));
  };

  const handleLogout = async () => {
    const response = await api.post("/users/logout");

    if (!response) {
      toast.error("Something went wrong while logging out!");
    }

    navigate("/");
  };
  return (
    <Stack
      width={w}
      bgcolor="whitesmoke"
      height="100vh"
      direction="column"
      justifyContent="space-between"
      p="2rem"
      spacing="2rem"
      alignItems="center"
      sx={{
        color: "black",
        fontFamily: fontFamily,
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.2)",
        position: "relative",
        background:
          "linear-gradient(135deg, rgba(34, 197, 94, 0.7) 0%, rgba(59, 130, 246, 0.5) 100%)",
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

      <Stack spacing="0.7rem" width="100%">
        {navTabs.map((tab) => (
          <Box key={tab.path} width="100%">
            {tab.subTabs ? (
              <>
                <Button
                  onClick={() => toggleDropdown(tab.name)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    textAlign: "left",
                    color: "black",
                    padding: "0.8rem 1rem",

                    bgcolor: openTabs[tab.name]
                      ? "rgba(0, 0, 0, 0.1)"
                      : "transparent",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.1)" },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing="1rem">
                    {tab.icon}
                    <Typography>{tab.name}</Typography>
                  </Stack>
                  <ArrowDropDown
                    sx={{
                      transform: openTabs[tab.name]
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.3s ease-in-out",
                    }}
                  />
                </Button>
                <Collapse in={openTabs[tab.name]} timeout="auto">
                  <Stack pl="2rem" marginTop={"10px"}>
                    {tab.subTabs.map((subTab) => (
                      <Link key={subTab.path} to={tab.path + subTab.path}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing="1rem"
                        >
                          {subTab.icon}
                          <Typography>{subTab.name}</Typography>
                        </Stack>
                      </Link>
                    ))}
                  </Stack>
                </Collapse>
              </>
            ) : (
              <Link
                to={tab.path}
                sx={
                  location.pathname === tab.path
                    ? { bgcolor: "black", color: "white" }
                    : undefined
                }
              >
                <Stack direction="row" alignItems="center" spacing="1rem">
                  {tab.icon}
                  <Typography>{tab.name}</Typography>
                </Stack>
              </Link>
            )}
          </Box>
        ))}
      </Stack>

      {/* <Link to="#">
          <Stack direction="row" alignItems="center" spacing="1rem">
            <ExitToApp />
            <Typography>Logout</Typography>
          </Stack>
        </Link> */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: "300px", // Set maximum width for better mobile responsiveness
        }}
      >
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack fontSize="small" />}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "inherit",
            padding: "8px 16px",
            textAlign: "left",
          }}
        >
          Back to main
        </Button>

        <Button
          startIcon={<Logout fontSize="small" />}
          onClick={() => handleLogout()}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "inherit",
            padding: "8px 16px",
            textAlign: "left",
          }}
        >
          Logout
        </Button>
      </Box>
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
        <SideBar w="100%" />
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
