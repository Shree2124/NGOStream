import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
} from "@mui/material";
import { Close, Menu } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";

interface MenuItem {
  text: string;
  link: string;
}

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const menuItems: MenuItem[] = [
    { text: "Home", link: "#home" },
    // { text: "Register", link: "/register" },
    { text: "Goals", link: "#goals" },
    { text: "Events", link: "/events" },
    { text: "Login", link: "/login" },
  ];

  return (
    <>
      <AppBar
        sx={{
          zIndex: 50,
          position: "fixed",
          bgcolor: "transparent",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          {isMobile ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              NGOStream
              <IconButton
                edge="start"
                aria-label="menu"
                onClick={toggleDrawer(true)}
              >
                <Menu />
              </IconButton>
            </Box>
          ) : (
            <Box
              sx={{
                // bgcolor: "blue",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              NGOStream
              <Box className="flex gap-3">
                {menuItems.map((item) => (
                  <Button
                    sx={{
                      color: "white",
                      "&:hover": {
                        bgcolor: "gray",
                      },
                    }}
                    key={item.text}
                    href={item.link}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            bgcolor: "gray",
            color: "white",
          },
        }}
      >
        <Box
          sx={{
            width: 250,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
          role="presentation"
        >
          <Box>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} component="a" href={item.link}>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "&:hover": { color: "gray" },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
