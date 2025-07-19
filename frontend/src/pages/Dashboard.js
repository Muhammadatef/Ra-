import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiEndpoints } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState([]);
  const [truckPerformance, setTruckPerformance] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchCompanies();
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const response = await apiEndpoints.getCompanies();
      setCompanies(response.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = selectedCompany ? { company_id: selectedCompany } : {};
      
      const [overviewRes, salesRes, truckRes, stockRes] = await Promise.all([
        apiEndpoints.getDashboardOverview(params),
        apiEndpoints.getSalesAnalytics({ ...params, group_by: 'day' }),
        apiEndpoints.getTruckPerformance(params),
        apiEndpoints.getLowStock(params),
      ]);

      setOverview(overviewRes.data);
      setSalesAnalytics(salesRes.data.slice(0, 14).reverse()); // Last 14 days
      setTruckPerformance(truckRes.data.slice(0, 10)); // Top 10 trucks
      setLowStock(stockRes.data.slice(0, 10)); // Top 10 low stock items
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Company</InputLabel>
          <Select
            value={selectedCompany}
            label="Filter by Company"
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <MenuItem value="">All Companies</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Companies
              </Typography>
              <Typography variant="h4">
                {overview?.overview?.total_companies || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Employees
              </Typography>
              <Typography variant="h4">
                {overview?.overview?.active_employees || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Trucks
              </Typography>
              <Typography variant="h4">
                {overview?.overview?.active_trucks || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(overview?.sales?.total_revenue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Analytics Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Trend (Last 14 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'total_revenue' ? formatCurrency(value) : value,
                    name === 'total_revenue' ? 'Revenue' : 'Transactions'
                  ]} />
                  <Legend />
                  <Line type="monotone" dataKey="total_revenue" stroke="#8884d8" name="Revenue" />
                  <Line type="monotone" dataKey="transaction_count" stroke="#82ca9d" name="Transactions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Type Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Types
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overview?.businessTypes || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.business_type}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="company_count"
                  >
                    {(overview?.businessTypes || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Trucks */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Trucks
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={truckPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="truck_number" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Bar dataKey="total_revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Alerts
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Truck</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Reorder</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>{item.truck_number}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={item.quantity}
                            color={item.quantity === 0 ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{item.reorder_level}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {lowStock.length === 0 && (
                <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                  No low stock items
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Sales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Sales
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Truck</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(overview?.recentSales || []).map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                        <TableCell>{sale.sale_time}</TableCell>
                        <TableCell>{sale.truck_number}</TableCell>
                        <TableCell>
                          <Chip
                            label={sale.business_type}
                            color={sale.business_type === 'ice_cream' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{sale.employee_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip label={sale.payment_method} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(sale.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;