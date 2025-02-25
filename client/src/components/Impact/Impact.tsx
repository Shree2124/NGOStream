import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { api } from "../../api/api";

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

  return (
    <Box
      sx={{
        padding: 5,
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #e3f2fd, #bbdefb)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h3"
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontFamily: "Merriweather, serif",
          color: "#01579b",
          marginBottom: 4,
        }}
      >
        Impact Transparency
      </Typography>

      {/* Loading State */}
      {isLoading ? (
        <CircularProgress sx={{ color: "#01579b" }} />
      ) : impacts.length === 0 ? (
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontFamily: "Open Sans, sans-serif",
            fontStyle: "italic",
            color: "#616161",
          }}
        >
          No impact data available at the moment.
        </Typography>
      ) : (
        <Grid container spacing={4} alignItems="center">
          {impacts.map((impact) => (
            <Grid item xs={12} sm={6} md={4} key={impact._id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Card
                  sx={{
                    maxWidth: 400,
                    boxShadow: 10,
                    borderRadius: 4,
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(15px)",
                    overflow: "hidden",
                    transition: "transform 0.3s ease-in-out",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gap: 0.5,
                      padding: 1,
                      gridTemplateColumns:
                        impact.images.length === 1
                          ? "1fr"
                          : impact.images.length <= 4
                          ? "1fr 1fr"
                          : "1fr 1fr",
                    }}
                  >
                    {impact.images.slice(0, 5).map((img, index) => (
                      <motion.img
                        key={index}
                        src={img}
                        alt={`Impact ${index}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                      />
                    ))}
                  </Box>

                  <CardContent>
                    {impact.eventName && (
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                          fontFamily: "Merriweather, serif",
                          color: "#01579b",
                        }}
                      >
                        {impact.eventName}
                      </Typography>
                    )}
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        fontStyle: "italic",
                        fontFamily: "Open Sans, sans-serif",
                      }}
                    >
                      "{impact.description}"
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          color: "#004d40",
                          fontFamily: "Open Sans, sans-serif",
                        }}
                      >
                        Donations: {impact.totalMonetaryDonations} Monetary, {impact.totalInKindDonations} In-Kind
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export { Impact };
