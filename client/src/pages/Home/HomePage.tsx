import { Box } from "@mui/material";
import { GoalsSection, HeroSection, Navbar } from "../../components";

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
      <div className="shadow-lg h-screen w-full" id="#home">
      <HeroSection />
      </div>
      <div className="w-full mt-8" id="goals">
        <GoalsSection />
      </div>
    </Box>
  );
};

export default HomePage;
