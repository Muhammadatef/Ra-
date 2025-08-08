import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  IconButton,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  Person,
  LocalShipping,
  AttachMoney,
  TrendingUp,
  AccessTime,
  ExpandMore,
  ExpandLess,
  MonetizationOn,
  Assignment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiEndpoints } from '../services/api';

function Employees() {
  const theme = useTheme();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeePerformance, setEmployeePerformance] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getEmployees({ limit: 100 });
      setEmployees(response.data.employees || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Employees error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeePerformance = async (employeeId) => {
    try {
      setPerformanceLoading(true);
      // Generate mock performance data since we need realistic demo data
      const mockPerformance = {
        employeeId,
        dailyBreakdown: generateDailyPerformanceData(),
        monthlyStats: generateMonthlyStats(),
        truckHistory: generateTruckHistory(),
        paymentBreakdown: generatePaymentBreakdown(),
        performanceMetrics: generatePerformanceMetrics(),
      };
      setEmployeePerformance(mockPerformance);
    } catch (err) {
      console.error('Error fetching employee performance:', err);
    } finally {
      setPerformanceLoading(false);
    }
  };

  // Generate realistic demo data
  const generateDailyPerformanceData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayOfWeek = date.getDay();
      
      // Higher revenue on weekends and weekdays, lower on Monday/Tuesday
      const baseRevenue = dayOfWeek === 0 || dayOfWeek === 6 ? 250 : dayOfWeek === 1 || dayOfWeek === 2 ? 180 : 220;
      const variance = Math.random() * 100 - 50;
      const revenue = Math.max(baseRevenue + variance, 50);
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(revenue),
        profit: Math.round(revenue * 0.3),
        tips: Math.round(Math.random() * 30 + 10),
        deliveries: Math.round(Math.random() * 8 + 4),
        hours: Math.round(Math.random() * 2 + 7),
      });
    }
    return data;
  };

  const generateMonthlyStats = () => ({
    totalRevenue: 6450,
    totalProfit: 1935,
    totalTips: 630,
    totalHours: 168,
    totalDeliveries: 87,
    avgDailyRevenue: 215,
    onTimePercentage: 94.2,
    efficiencyScore: 8.7,
  });

  const generateTruckHistory = () => [
    {
      truckNumber: 'GS-ICE-001',
      period: '2024-01-01 to 2024-01-15',
      revenue: 3200,
      deliveries: 42,
      hoursWorked: 84,
    },
    {
      truckNumber: 'GS-ICE-002',
      period: '2024-01-16 to 2024-01-31',
      revenue: 3250,
      deliveries: 45,
      hoursWorked: 84,
    },
  ];

  const generatePaymentBreakdown = () => [
    { name: 'Cash', value: 2580, color: theme.palette.info.main },
    { name: 'Credit Card', value: 3240, color: theme.palette.secondary.main },
    { name: 'Tips', value: 630, color: theme.palette.warning.main },
  ];

  const generatePerformanceMetrics = () => ({
    onTimeDeliveries: 82,
    totalDeliveries: 87,
    customerRating: 4.6,
    productivityScore: 87,
    revenuePerHour: 38.4,
  });

  const filteredEmployees = employees.filter(employee =>
    employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeSelect = async (employee) => {
    setSelectedEmployee(employee);
    setExpandedEmployee(employee.id === expandedEmployee ? null : employee.id);
    if (employee.id !== expandedEmployee) {
      await fetchEmployeePerformance(employee.id);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{
          fontFamily: '"Bebas Neue", sans-serif',
          color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.secondary.main,
          fontSize: '2.5rem',
          mb: 1
        }}>
          Employee Performance Analytics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Track individual performance, revenue contribution, and productivity metrics
        </Typography>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 4, p: 3 }}>
        <TextField
          fullWidth
          placeholder="Search employees by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Card>

      {/* Employee Table */}
      <Paper sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 600 }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last Assignment</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Hire Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <React.Fragment key={employee.id}>
                  <TableRow
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) }
                    }}
                  >
                    <TableCell>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                        {employee.first_name?.[0]}{employee.last_name?.[0]}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employee.first_name} {employee.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {employee.employee_id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.status}
                        color={employee.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">Truck GS-ICE-001</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last active 2 hours ago
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleEmployeeSelect(employee)}
                        color="primary"
                      >
                        {expandedEmployee === employee.id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  
                  {/* Performance Dashboard Row */}
                  <TableRow>
                    <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
                      <Collapse in={expandedEmployee === employee.id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 4, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                          {performanceLoading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                              <CircularProgress />
                            </Box>
                          ) : employeePerformance && selectedEmployee?.id === employee.id ? (
                            <EmployeePerformanceDashboard 
                              employee={selectedEmployee}
                              performance={employeePerformance}
                              theme={theme}
                              formatCurrency={formatCurrency}
                            />
                          ) : null}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredEmployees.length === 0 && (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              No employees found matching your search
            </Typography>
          </Box>
        )}
      </Paper>

      <Typography variant="body2" color="textSecondary" mt={2}>
        Showing {filteredEmployees.length} of {employees.length} employees
      </Typography>
    </Box>
  );
}

// Performance Dashboard Component
function EmployeePerformanceDashboard({ employee, performance, theme, formatCurrency }) {
  const { monthlyStats, dailyBreakdown, truckHistory, paymentBreakdown, performanceMetrics } = performance;

  return (
    <Grid container spacing={3}>
      {/* KPI Cards */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{
          fontFamily: '"Bebas Neue", sans-serif',
          color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.secondary.main,
          mb: 3
        }}>
          📊 {employee.first_name} {employee.last_name} - Performance Overview
        </Typography>
      </Grid>

      {/* Performance KPIs */}
      <Grid item xs={12} md={3}>
        <Card sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
          <MonetizationOn sx={{ fontSize: '2rem', color: theme.palette.success.main, mb: 1 }} />
          <Typography variant="h5" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
            {formatCurrency(monthlyStats.totalRevenue)}
          </Typography>
          <Typography variant="caption" color="text.secondary">Total Revenue (30 days)</Typography>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
          <TrendingUp sx={{ fontSize: '2rem', color: theme.palette.primary.main, mb: 1 }} />
          <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
            {monthlyStats.onTimePercentage}%
          </Typography>
          <Typography variant="caption" color="text.secondary">On-Time Performance</Typography>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
          <AttachMoney sx={{ fontSize: '2rem', color: theme.palette.warning.main, mb: 1 }} />
          <Typography variant="h5" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
            {formatCurrency(monthlyStats.totalTips)}
          </Typography>
          <Typography variant="caption" color="text.secondary">Total Tips</Typography>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
          <Assignment sx={{ fontSize: '2rem', color: theme.palette.info.main, mb: 1 }} />
          <Typography variant="h5" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
            {monthlyStats.totalDeliveries}
          </Typography>
          <Typography variant="caption" color="text.secondary">Total Deliveries</Typography>
        </Card>
      </Grid>

      {/* Daily Performance Chart */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            📈 Daily Performance (Last 30 Days)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="dateLabel" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' || name === 'profit' || name === 'tips' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : name === 'tips' ? 'Tips' : name
                ]}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke={theme.palette.success.main} strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke={theme.palette.primary.main} strokeWidth={2} name="Profit" />
              <Line type="monotone" dataKey="tips" stroke={theme.palette.warning.main} strokeWidth={2} name="Tips" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Payment Method Breakdown */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            💳 Payment Method Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {paymentBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Employment History */}
      <Grid item xs={12}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            🚛 Truck Assignment History
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Truck</strong></TableCell>
                  <TableCell><strong>Period</strong></TableCell>
                  <TableCell><strong>Revenue</strong></TableCell>
                  <TableCell><strong>Deliveries</strong></TableCell>
                  <TableCell><strong>Hours</strong></TableCell>
                  <TableCell><strong>Performance</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {truckHistory.map((assignment, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip 
                        label={assignment.truckNumber} 
                        size="small" 
                        sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}
                      />
                    </TableCell>
                    <TableCell>{assignment.period}</TableCell>
                    <TableCell sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                      {formatCurrency(assignment.revenue)}
                    </TableCell>
                    <TableCell>{assignment.deliveries}</TableCell>
                    <TableCell>{assignment.hoursWorked}h</TableCell>
                    <TableCell>
                      <Chip 
                        label="Excellent" 
                        color="success" 
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Employees;