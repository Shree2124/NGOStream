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
    { text: "Home", link: "/" },
    { text: "Login", link: "/login" },
    { text: "Register", link: "/register" },
  ];

  return (
    <>
      <AppBar
        sx={{
          zIndex: 50,
          position: "fixed",
          bgcolor: "blue",
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
                bgcolor: "blue",
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
                        color: "blue",
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
            bgcolor: "blue",
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
                      "&:hover": { color: "blue" },
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
