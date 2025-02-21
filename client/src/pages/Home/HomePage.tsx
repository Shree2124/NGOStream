import { Box } from "@mui/material";
import { GoalsSection, HeroSection, Navbar } from "../../components";

const HomePage: React.FC = () => {
  return (
    <Box sx={{}}>
      <div>
        <Navbar />
      </div>
      <div className="shadow-lg h-screen min-w-screen" id="#home">
        <HeroSection />
      </div>
      <div className="w-full " id="goals">
        <GoalsSection />
      </div>
    </Box>
  );
};

export default HomePage;
