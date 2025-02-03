import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Container, Button, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { motion } from 'framer-motion';
import { api } from '../../api/api';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  status: string;
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await api.get("/event/");
        setEvents(res.data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const filteredEvents = filter === 'All' ? events : events.filter(event => event.status === filter);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" textAlign="center" mt={4} gutterBottom>
        Events
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <FormControl variant="outlined" sx={{ width: '200px' }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filter}
            onChange={handleFilterChange}
            label="Filter by Status"
            fullWidth
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Upcoming">Upcoming</MenuItem>
            <MenuItem value="Happening">Happening</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredEvents.length === 0 ? (
        <Typography variant="body1" textAlign="center" color="text.secondary">
          No events available for the selected filter.
        </Typography>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }}
          gap={3}
          mt={4}
        >
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
            >
              <Card elevation={3} sx={{ padding: 2, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Location:</strong> {event.location}
                  </Typography>
                  <Typography variant="body2" mt={2}>
                    <strong>Description:</strong> {event.description}
                  </Typography>
                  <Box display="flex" justifyContent="flex-start" mt={2}>
                    <Button variant="outlined" color="primary" size="small">
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}
    </Container>
  );
};
