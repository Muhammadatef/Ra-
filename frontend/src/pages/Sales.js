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
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiEndpoints } from '../services/api';

function Sales() {
  const [sales, setSales] = useState([]);
  const [salesSummary, setSalesSummary] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTruck, setSelectedTruck] = useState('');
  const limit = 20;

  const fetchTrucks = async () => {
    try {
      const response = await apiEndpoints.getTrucks();
      setTrucks(response.data.filter(truck => truck.status === 'active'));
    } catch (err) {
      console.error('Error fetching trucks:', err);
    }
  };

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        limit,
        offset: (page - 1) * limit,
      };
      
      if (selectedTruck) params.truck_id = selectedTruck;

      const response = await apiEndpoints.getSales(params);
      setSales(response.data.sales);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sales');
      console.error('Sales error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedTruck, limit]);

  const fetchSalesSummary = useCallback(async () => {
    try {
      const params = {};
      if (selectedTruck) params.truck_id = selectedTruck;
      
      const response = await apiEndpoints.getSalesSummary(params);
      setSalesSummary(response.data.slice(0, 14).reverse()); // Last 14 days
    } catch (err) {
      console.error('Error fetching sales summary:', err);
    }
  }, [selectedTruck]);

  useEffect(() => {
    fetchSales();
    fetchTrucks();
    fetchSalesSummary();
  }, [page, fetchSales, fetchSalesSummary]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  const totalRevenue = salesSummary.reduce((sum, day) => sum + parseFloat(day.total_revenue || 0), 0);
  const totalTransactions = salesSummary.reduce((sum, day) => sum + parseInt(day.transaction_count || 0), 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sales
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue (14 days)
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Transactions (14 days)
              </Typography>
              <Typography variant="h5">
                {totalTransactions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Transaction
              </Typography>
              <Typography variant="h5">
                {totalTransactions > 0 ? formatCurrency(totalRevenue / totalTransactions) : '$0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Daily Average
              </Typography>
              <Typography variant="h5">
                {formatCurrency(totalRevenue / 14)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sales Trend (Last 14 Days)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesSummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
              <Line type="monotone" dataKey="total_revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Truck</InputLabel>
            <Select
              value={selectedTruck}
              label="Truck"
              onChange={(e) => {
                setSelectedTruck(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Trucks</MenuItem>
              {trucks.map((truck) => (
                <MenuItem key={truck.id} value={truck.id}>
                  {truck.truck_number} - {truck.company_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Truck</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{sale.sale_time}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {sale.truck_number}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {sale.license_plate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {sale.company_name}
                      </Typography>
                      <Chip
                        label={sale.business_type?.replace('_', ' ')}
                        size="small"
                        color={sale.business_type === 'ice_cream' ? 'primary' : 'secondary'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {sale.employee_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {sale.route_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sale.payment_method}
                      size="small"
                      variant="outlined"
                      color={
                        sale.payment_method === 'cash' ? 'success' :
                        sale.payment_method === 'card' ? 'primary' : 'secondary'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(sale.total_amount)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box display="flex" justifyContent="center" p={2}>
          <Pagination
            count={Math.ceil(total / limit)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Paper>

      <Typography variant="body2" color="textSecondary" mt={2}>
        Showing {sales.length} of {total} sales
      </Typography>
    </Box>
  );
}

export default Sales;