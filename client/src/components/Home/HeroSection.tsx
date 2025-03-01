import React from "react";
import { Box, Button, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import img1 from "../../assets/home/img1.jpg";
import img2 from "../../assets/home/img2.jpg";
import img3 from "../../assets/home/img3.jpg";

const HeroSection: React.FC = () => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "start",
        overflow: "hidden",
        color: "white",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Slider {...sliderSettings}>
          {[img1, img2, img3].map((image, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                width: "100%",
                height: "100vh",
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                zIndex: 0,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 1,
                },
              }}
            />
          ))}
        </Slider>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          textAlign: "left",
          padding: { xs: "2rem", sm: "4rem", md: "0rem 0rem 0rem 6rem" },
          width: "100%",
          // maxWidth: "600px",
          bottom: { xs: "5rem", sm: "12rem" },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mb: "1.5rem",
            fontSize: { xs: "2.5rem", sm: "1.8rem", md: "3rem" },
          }}
        >
          Empowering Communities Together
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: "2rem",
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Contribute in making a difference by connecting donors, volunteers,
          and resources to those in need.
        </Typography>
        {/* <Button
          variant="contained"
          color="primary"
          sx={{
            fontWeight: "bold",
            textTransform: "none",
            px: "1.5rem",
            py: "0.75rem",
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
          href="/get-involved"
        >
          Get Involved
        </Button> */}
      </Box>
    </Box>
  );
};

export default HeroSection;
