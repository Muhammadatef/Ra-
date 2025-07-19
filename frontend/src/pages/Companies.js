import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { apiEndpoints } from '../services/api';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getCompanies();
      setCompanies(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch companies');
      console.error('Companies error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        Companies
      </Typography>
      
      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {company.name}
                </Typography>
                <Box mb={2}>
                  <Chip
                    label={company.business_type.replace('_', ' ').toUpperCase()}
                    color={company.business_type === 'ice_cream' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  📍 {company.state}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  📧 {company.contact_email}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  📞 {company.contact_phone}
                </Typography>
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    👥 {company.employee_count} employees • 🚚 {company.truck_count} trucks • 📍 {company.location_count} locations
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Companies;