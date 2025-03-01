import { Box } from "@mui/material";
import { GoalsSection, HeroSection, Navbar } from "../../components";

const HomePage: React.FC = () => {
  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, rgba(34, 197, 94, 0.7) 0%, rgba(59, 130, 246, 0.5) 100%)",
      }}
    >
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
