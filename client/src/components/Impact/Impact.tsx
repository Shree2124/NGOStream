import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Container,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { api } from "../../api/api";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";

interface ImpactData {
  _id: string;
  eventId: string;
  goalId: string | null;
  description: string;
  donationType: string;
  images: string[];
  eventName?: string;
  totalMonetaryDonations: number;
  totalInKindDonations: number;
}

const Impact: React.FC = () => {
  const [impacts, setImpacts] = useState<ImpactData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const res = await api.get("/impact/get");
      setImpacts(res.data.data);
    } catch (error) {
      console.error("Error fetching impacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.1,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -10,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: i * 0.15,
      },
    }),
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, rgba(34, 197, 94, 0.7) 0%, rgba(59, 130, 246, 0.5) 100%)",
        minHeight: "100vh",
        paddingY: { xs: 4, md: 6 },
        paddingX: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <motion.div variants={titleVariants} initial="hidden" animate="visible">
          <Typography
            variant="h3"
            component="h1"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontFamily: "Merriweather, serif",
              color: "#01579b",
              marginBottom: { xs: 3, md: 5 },
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              textShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            Our Impact in Action
          </Typography>

          <Typography
            variant="h6"
            component="p"
            sx={{
              textAlign: "center",
              fontFamily: "Open Sans, sans-serif",
              color: "#01579b",
              marginBottom: 4,
              maxWidth: "800px",
              mx: "auto",
              opacity: 0.9,
            }}
          >
            Discover how your generous contributions are making a real
            difference in communities
          </Typography>
        </motion.div>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ color: "#01579b" }}
            />
          </Box>
        ) : impacts.length === 0 ? (
          <Box
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: 4,
              padding: 4,
              textAlign: "center",
              backdropFilter: "blur(10px)",
              maxWidth: 600,
              mx: "auto",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "Merriweather, serif",
                color: "#01579b",
                marginBottom: 2,
              }}
            >
              Impact Stories Coming Soon
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "Open Sans, sans-serif",
                color: "#616161",
              }}
            >
              We're currently gathering impact stories to share with you. Check
              back soon to see how your support is making a difference.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {impacts.map((impact, index) => (
              <Grid item xs={12} sm={6} md={4} key={impact._id}>
                <motion.div
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: { xs: 2, sm: 3, md: 4 },
                      background: "rgba(255, 255, 255, 0.85)",
                      backdropFilter: "blur(15px)",
                      overflow: "hidden",
                      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gap: 1,
                        padding: 1.5,
                        height: { xs: 200, sm: 220, md: 240 },
                        gridTemplateColumns:
                          impact.images.length === 1
                            ? "1fr"
                            : impact.images.length === 2
                            ? "1fr 1fr"
                            : impact.images.length === 3
                            ? "1fr 1fr 1fr"
                            : "repeat(2, 1fr)",
                        gridTemplateRows:
                          impact.images.length > 2 ? "repeat(2, 1fr)" : "1fr",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      {impact.images.slice(0, 4).map((img, idx) => (
                        <motion.div
                          key={idx}
                          custom={idx}
                          variants={imageVariants}
                          initial="hidden"
                          animate="visible"
                          style={{
                            overflow: "hidden",
                            borderRadius: 8,
                            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                            gridColumn:
                              impact.images.length === 1
                                ? "span 2"
                                : idx === 0 && impact.images.length === 3
                                ? "span 2"
                                : "auto",
                            gridRow:
                              impact.images.length === 3 && idx === 0
                                ? "span 2"
                                : "auto",
                          }}
                        >
                          <img
                            src={img}
                            alt={`Impact ${idx}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.5s ease",
                            }}
                          />
                        </motion.div>
                      ))}
                      {impact.images.length === 0 && (
                        <Box
                          sx={{
                            gridColumn: "span 2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#e0e0e0",
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No images available
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
                      {impact.eventName && (
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: "bold",
                            fontFamily: "Merriweather, serif",
                            color: "#01579b",
                            fontSize: {
                              xs: "1.1rem",
                              sm: "1.25rem",
                              md: "1.5rem",
                            },
                            mb: 1,
                            lineHeight: 1.3,
                            minHeight: { xs: "auto", sm: "3.2rem" },
                          }}
                        >
                          {impact.eventName}
                        </Typography>
                      )}

                      <Divider sx={{ my: 1.5 }} />

                      <Typography
                        variant="body1"
                        sx={{
                          mt: 1,
                          fontStyle: "italic",
                          fontFamily: "Open Sans, sans-serif",
                          color: "#424242",
                          minHeight: { xs: "auto", sm: "4.5rem" },
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: { xs: "0.875rem", md: "1rem" },
                        }}
                      >
                        "{impact.description}"
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mt: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          icon={<MonetizationOnIcon />}
                          label={`${impact.totalMonetaryDonations} Monetary`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(0, 150, 136, 0.1)",
                            borderColor: "rgba(0, 150, 136, 0.5)",
                            borderWidth: 1,
                            borderStyle: "solid",
                            color: "#00796b",
                            fontWeight: "medium",
                            "& .MuiChip-icon": { color: "#00796b" },
                          }}
                        />
                        <Chip
                          icon={<CardGiftcardIcon />}
                          label={`${impact.totalInKindDonations} In-Kind`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                            borderColor: "rgba(25, 118, 210, 0.5)",
                            borderWidth: 1,
                            borderStyle: "solid",
                            color: "#1565c0",
                            fontWeight: "medium",
                            "& .MuiChip-icon": { color: "#1565c0" },
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: "center", mt: 6, opacity: 0.9 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "Open Sans, sans-serif",
              color: "#01579b",
            }}
          >
            Together, we're creating lasting positive change in our communities.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export { Impact };
