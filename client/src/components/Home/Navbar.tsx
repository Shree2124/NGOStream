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

// Override MUI's default AppBar styles
const CustomAppBar = styled(AppBar)({
  background: "none",
  boxShadow: "none",
});

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const trigger = useScrollTrigger();

  const menuItems = [
    { text: "Home", link: "#home" },
    { text: "Goals", link: "#goals" },
    { text: "Events", link: "/events" },
    { text: "Admin Login", link: "/login" },
  ];

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <CustomAppBar position="fixed">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/70 to-blue-500/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent backdrop-blur-sm" />

        {/* Container with max width control */}
        <Container maxWidth="lg" className="max-w-full px-4">
          <Box className="flex justify-between items-center h-20 relative z-10 w-full">
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
                    className="relative overflow-hidden group px-6 py-3 rounded-lg hover:bg-white/5 transition-all duration-300"
                  >
                    <span className="relative z-10 text-gray-100 group-hover:text-white transition-colors">
                      {item.text}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white rounded-lg -z-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="text-gray-100 hover:text-white hover:bg-white/10"
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
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
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
                className="md:hidden absolute left-0 right-0 bg-gradient-to-r from-green-500/70 to-blue-500/40 shadow-md rounded-lg overflow-hidden"
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
                        className="w-full text-white hover:bg-white/10 justify-start rounded-lg py-3 px-4"
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
