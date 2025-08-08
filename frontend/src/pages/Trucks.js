import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { apiEndpoints } from '../services/api';

function Trucks() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchTrucks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedStatus) params.status = selectedStatus;

      const response = await apiEndpoints.getTrucks(params);
      setTrucks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch trucks');
      console.error('Trucks error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trucks
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="retired">Retired</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Truck Number</TableCell>
                <TableCell>License Plate</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Last Maintenance</TableCell>
                <TableCell>Next Maintenance</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trucks.map((truck) => (
                <TableRow key={truck.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {truck.truck_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{truck.license_plate}</TableCell>
                  <TableCell>{truck.model}</TableCell>
                  <TableCell>{truck.year}</TableCell>
                  <TableCell>
                    {truck.location_name ? (
                      <Typography variant="body2">
                        {truck.location_name}<br />
                        {truck.location_city}, {truck.location_state}
                      </Typography>
                    ) : (
                      'Not assigned'
                    )}
                  </TableCell>
                  <TableCell>{truck.capacity}</TableCell>
                  <TableCell>
                    {truck.last_maintenance ? 
                      new Date(truck.last_maintenance).toLocaleDateString() : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {truck.next_maintenance ? 
                      new Date(truck.next_maintenance).toLocaleDateString() : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={truck.status}
                      color={
                        truck.status === 'active' ? 'success' :
                        truck.status === 'maintenance' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography variant="body2" color="textSecondary" mt={2}>
        Total trucks: {trucks.length}
      </Typography>
    </Box>
  );
}

export default Trucks;