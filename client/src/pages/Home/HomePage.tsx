import { Box } from "@mui/material";
import { HeroSection, Navbar } from "../../components";

const HomePage: React.FC = () => {

  return (
    <Box
      sx={{
        minHeight: "100vh",
      }}
    >
      <div>
        <Navbar />
      </div>
      <HeroSection />
      
    </Box>
  );
};

export default HomePage;
