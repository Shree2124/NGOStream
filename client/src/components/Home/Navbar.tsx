import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AppBar,
  Container,
  IconButton,
  Box,
  Button,
  useScrollTrigger,
  Slide,
  Typography,
  styled,
} from "@mui/material";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

// Override MUI's default AppBar styles
const CustomAppBar = styled(AppBar)({
  background: "none",
  boxShadow: "none",
});

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const trigger = useScrollTrigger();
  const { auth } = useSelector((state: RootState) => state.user);

  const menuItems = [
    { text: "Home", link: "#home" },
    { text: "Goals", link: "#goals" },
    { text: "Events", link: "/events" },
    { text: "Vision", link: "/visions" },
    { text: "Achievements", link: "/achievements" },
    { text: "Impact", link: "/impact" },
    {
      text: auth ? "Dashboard" : "Admin login",
      link: auth ? "/Dashboard" : "/login",
    },
  ];

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <CustomAppBar position="fixed">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/70 to-blue-500/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent backdrop-blur-sm" />

        {/* Container with max width control */}
        <Container maxWidth="lg" className="px-4 max-w-full">
          <Box className="z-10 relative flex justify-between items-center w-full h-20">
            {/* Logo Positioned to the Left */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex-shrink-0"
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  background: "linear-gradient(to right, #fff, #e2e8f0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  cursor: "pointer",
                }}
                onClick={() => (window.location.href = "/")}
              >
                NGOStream
              </Typography>
            </motion.div>

            {/* Desktop Menu (Pushed to the Right) */}
            <Box className="hidden md:flex items-center gap-6 ml-auto">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Button
                    href={item.link}
                    className="group relative hover:bg-white/5 px-6 py-3 rounded-lg overflow-hidden transition-all duration-300"
                  >
                    <span className="group-hover:text-white z-10 relative text-gray-100 transition-colors">
                      {item.text}
                    </span>
                    <motion.div
                      className="-z-0 absolute inset-0 bg-white opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              ))}
            </Box>

            {/* Mobile Menu Button (Push to the Right) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:hidden ml-auto"
            >
              <IconButton
                onClick={() => setIsOpen(!isOpen)}
                className="hover:bg-white/10 text-gray-100 hover:text-white"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isOpen ? "close" : "menu"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </IconButton>
            </motion.div>
          </Box>

          {/* Mobile Menu (Fix Overflow & Centering) */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden right-0 left-0 absolute bg-gradient-to-r from-green-500/70 to-blue-500/40 shadow-md rounded-lg overflow-hidden"
              >
                <Box className="p-4">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Button
                        href={item.link}
                        className="justify-start hover:bg-white/10 px-4 py-3 rounded-lg w-full text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        <motion.span
                          initial={{ x: -10 }}
                          whileHover={{ x: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.text}
                        </motion.span>
                      </Button>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </CustomAppBar>
    </Slide>
  );
};

export default Navbar;
