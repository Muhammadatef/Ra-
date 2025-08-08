import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  TextField,
  Button,
  ButtonGroup,
  Autocomplete,
} from '@mui/material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  FilterList,
  Refresh,
  Business,
  LocalShipping,
  People,
  AttachMoney,
  CalendarToday,
  TrendingUp,
  AccessTime,
  MonetizationOn,
  DateRange,
  Today,
  ViewWeek,
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Commented out for container compatibility
import { apiEndpoints } from '../services/api';
// import DashboardContainer from '../components/dashboard/DashboardContainer'; // Commented out for container compatibility
import RaLogo from '../components/RaLogo';
import { useFilters } from '../contexts/FilterContext';


function Dashboard() {
  const theme = useTheme();
  const {
    selectedEmployee,
    selectedTruck,
    dateFilter,
    selectedDateRange,
    setSelectedEmployee,
    setSelectedTruck,
    clearAllFilters,
    getActiveFiltersCount,
    handleDateFilterChange,
    handleDateRangeChange,
    getAPIParams
  } = useFilters();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState([]);
  const [truckPerformance, setTruckPerformance] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [employeeAnalytics, setEmployeeAnalytics] = useState(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  /* const [dashboardWidgets, setDashboardWidgets] = useState([
    {
      id: 'total-revenue',
      type: 'kpi',
      title: 'Total Revenue',
      config: { dataKey: 'totalRevenue', prefix: '$' }
    },
    {
      id: 'total-companies',
      type: 'kpi',
      title: 'Total Companies',
      config: { dataKey: 'totalCompanies' }
    },
    {
      id: 'active-employees',
      type: 'kpi',  
      title: 'Active Employees',
      config: { dataKey: 'activeEmployees' }
    },
    {
      id: 'active-trucks',
      type: 'kpi',
      title: 'Active Trucks', 
      config: { dataKey: 'activeTrucks' }
    },
    {
      id: 'sales-trend',
      type: 'line-chart',
      title: 'Sales Trend (14 Days)',
      config: { dataKey: 'salesAnalytics', xKey: 'period', yKey: 'total_revenue' }
    },
    {
      id: 'business-types',
      type: 'pie-chart', 
      title: 'Business Types Distribution',
      config: { dataKey: 'businessTypes', xKey: 'business_type', yKey: 'company_count' }
    },
    {
      id: 'truck-performance',
      type: 'bar-chart',
      title: 'Top Performing Trucks',
      config: { dataKey: 'truckPerformance', xKey: 'truck_number', yKey: 'total_revenue' }
    }
  ]); */

  useEffect(() => {
    fetchDashboardData();
    fetchEmployees();
    fetchTrucks();
  }, [selectedEmployee, selectedTruck, dateFilter, selectedDateRange]);

  const fetchCompanies = async () => {
    try {
      const response = await apiEndpoints.getCompanies();
      setCompanies(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setCompanies([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiEndpoints.getEmployees();
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await apiEndpoints.getTrucks();
      setTrucks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching trucks:', err);
      setTrucks([]);
    }
  };

  const fetchEmployeeAnalytics = async (employeeId) => {
    if (!employeeId) {
      setEmployeeAnalytics(null);
      return;
    }

    try {
      setEmployeeLoading(true);
      // Mock data for demonstration - replace with actual API calls
      const mockEmployeeData = {
        employee: employees.find(emp => emp.id === employeeId) || {},
        monthlyPerformance: [
          {
            month: '2024-01',
            monthName: 'January 2024',
            truck: 'Truck #001',
            truckId: 1,
            revenue: 12500,
            profit: 3750,
            tips: 850,
            cashTransactions: 6800,
            creditCardTransactions: 5700,
            workDays: 22,
            totalHours: 176,
            avgDailyHours: 8,
            firstWorkDate: '2024-01-02',
            lastWorkDate: '2024-01-31',
            deliveries: 89,
            onTimeDeliveries: 85,
            onTimePercentage: 95.5
          },
          {
            month: '2024-02',
            monthName: 'February 2024',
            truck: 'Truck #002',
            truckId: 2,
            revenue: 14200,
            profit: 4260,
            tips: 920,
            cashTransactions: 7100,
            creditCardTransactions: 7100,
            workDays: 20,
            totalHours: 160,
            avgDailyHours: 8,
            firstWorkDate: '2024-02-01',
            lastWorkDate: '2024-02-29',
            deliveries: 93,
            onTimeDeliveries: 88,
            onTimePercentage: 94.6
          },
          {
            month: '2024-03',
            monthName: 'March 2024',
            truck: 'Truck #001',
            truckId: 1,
            revenue: 15800,
            profit: 4740,
            tips: 1150,
            cashTransactions: 8200,
            creditCardTransactions: 7600,
            workDays: 23,
            totalHours: 184,
            avgDailyHours: 8,
            firstWorkDate: '2024-03-01',
            lastWorkDate: '2024-03-31',
            deliveries: 97,
            onTimeDeliveries: 94,
            onTimePercentage: 96.9
          },
          {
            month: '2024-04',
            monthName: 'April 2024',
            truck: 'Truck #003',
            truckId: 3,
            revenue: 13900,
            profit: 4170,
            tips: 980,
            cashTransactions: 7200,
            creditCardTransactions: 6700,
            workDays: 21,
            totalHours: 168,
            avgDailyHours: 8,
            firstWorkDate: '2024-04-01',
            lastWorkDate: '2024-04-30',
            deliveries: 91,
            onTimeDeliveries: 86,
            onTimePercentage: 94.5
          }
        ],
        totalStats: {
          totalRevenue: 56400,
          totalProfit: 16920,
          totalTips: 3900,
          totalCashTransactions: 29300,
          totalCreditCardTransactions: 27100,
          totalWorkDays: 86,
          totalHours: 688,
          avgMonthlyRevenue: 14100,
          totalDeliveries: 370,
          totalOnTimeDeliveries: 353,
          overallOnTimePercentage: 95.4,
          employmentStartDate: '2024-01-02'
        }
      };

      setEmployeeAnalytics(mockEmployeeData);
    } catch (err) {
      console.error('Error fetching employee analytics:', err);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = getAPIParams(); // Use centralized filter parameters
      
      const [overviewRes, salesRes, truckRes, stockRes] = await Promise.all([
        apiEndpoints.getDashboardOverview(params),
        apiEndpoints.getSalesAnalytics(params),
        apiEndpoints.getTruckPerformance(params),
        apiEndpoints.getLowStock(params),
      ]);

      setOverview(overviewRes.data);
      // Adjust data display based on filter type
      const maxItems = dateFilter === 'daily' ? 30 : dateFilter === 'weekly' ? 12 : 12;
      setSalesAnalytics(salesRes.data.slice(0, maxItems).reverse());
      // Parse truck performance data to ensure numbers are properly formatted
      const parsedTruckData = truckRes.data.map(truck => ({
        ...truck,
        total_revenue: parseFloat(truck.total_revenue) || 0,
        total_sales: parseInt(truck.total_sales) || 0,
        total_tips: parseFloat(truck.total_tips) || 0,
        avg_sale_amount: parseFloat(truck.avg_sale_amount) || 0
      }));
      setTruckPerformance(parsedTruckData.slice(0, 10)); // Top 10 trucks
      console.log('🚛 Truck Performance Data:', parsedTruckData.slice(0, 5));
      setLowStock(stockRes.data.slice(0, 10)); // Top 10 low stock items
      setError(null);

      // Fetch detailed employee analytics if employee is selected
      if (selectedEmployee) {
        fetchEmployeeAnalytics(selectedEmployee);
      }
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

  const handleEmployeeChange = (employeeId) => {
    setSelectedEmployee(employeeId);
    if (employeeId) {
      fetchEmployeeAnalytics(employeeId);
    } else {
      setEmployeeAnalytics(null);
    }
  };

  const handleClearFilters = () => {
    clearAllFilters();
    setEmployeeAnalytics(null);
  };

  // Prepare data for widgets
  const availableData = {
    totalRevenue: overview?.sales?.total_revenue || 0,
    totalCompanies: overview?.overview?.total_companies || 0,
    activeEmployees: overview?.overview?.active_employees || 0,
    activeTrucks: overview?.overview?.active_trucks || 0,
    salesAnalytics: salesAnalytics,
    businessTypes: overview?.businessTypes || [],
    truckPerformance: truckPerformance,
    lowStock: lowStock,
    recentSales: overview?.recentSales || [],
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <RaLogo size="large" />
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
        <Typography variant="body2" color="text.secondary">
          Loading Ra Analytics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <div>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            border: `1px solid ${theme.palette.error.main}20`,
          }}
        >
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <Box>
      {/* Ra Dashboard Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 6,
          p: 4,
          background: theme.palette.mode === 'light'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          borderRadius: 5,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '\"\"',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }
        }}
      >
        <Box>
          <Typography 
            variant="h2" 
            sx={{ 
              fontFamily: '"Bebas Neue", sans-serif',
              fontWeight: 700,
              fontSize: '3rem',
              color: theme.palette.mode === 'dark' 
                ? theme.palette.primary.main 
                : theme.palette.secondary.main,
              mb: 1,
              letterSpacing: '0.02em'
            }}
          >
            RA ANALYTICS
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500, 
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: '0.95rem'
            }}
          >
            Business Intelligence Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={fetchDashboardData}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              borderRadius: 2,
              p: 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.25),
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`
              },
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <Refresh sx={{ color: theme.palette.primary.main }} />
          </IconButton>
        </Box>
      </Box>

      {/* Advanced Filters */}
      <Box 
        sx={{
          display: 'flex',
          gap: 3,
          mb: 5,
          p: 3,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 4,
          border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.08)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList sx={{ color: theme.palette.primary.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
          {getActiveFiltersCount() > 0 && (
            <Chip 
              label={`${getActiveFiltersCount()} active`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        


        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Truck</InputLabel>
          <Select
            value={selectedTruck}
            label="Truck"
            onChange={(e) => setSelectedTruck(e.target.value)}
            startAdornment={<LocalShipping sx={{ mr: 1, fontSize: '1rem' }} />}
          >
            <MenuItem value="">All Trucks</MenuItem>
            {Array.isArray(trucks) && trucks.map((truck) => (
              <MenuItem key={truck.id} value={truck.id}>
                {truck.truck_number}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {getActiveFiltersCount() > 0 && (
          <Chip
            label="Clear All"
            onClick={handleClearFilters}
            onDelete={handleClearFilters}
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              }
            }}
          />
        )}
      </Box>

      {/* Date Range Filter */}
      <Box 
        sx={{
          display: 'flex',
          gap: 3,
          mb: 5,
          p: 3,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 4,
          border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.08)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DateRange sx={{ color: theme.palette.info.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Time Period
          </Typography>
        </Box>

        {/* Date Filter Buttons */}
        <ButtonGroup 
          variant="outlined" 
          size="small"
          sx={{
            '& .MuiButton-root': {
              borderColor: alpha(theme.palette.info.main, 0.3),
              color: theme.palette.info.main,
              '&:hover': {
                borderColor: theme.palette.info.main,
                backgroundColor: alpha(theme.palette.info.main, 0.1),
              }
            },
            '& .MuiButton-root.active': {
              backgroundColor: theme.palette.info.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.info.dark,
              }
            }
          }}
        >
          <Button
            className={dateFilter === 'daily' ? 'active' : ''}
            onClick={() => handleDateFilterChange('daily')}
            startIcon={<Today />}
          >
            Daily
          </Button>
          <Button
            className={dateFilter === 'weekly' ? 'active' : ''}
            onClick={() => handleDateFilterChange('weekly')}
            startIcon={<ViewWeek />}
          >
            Weekly
          </Button>
          <Button
            className={dateFilter === 'monthly' ? 'active' : ''}
            onClick={() => handleDateFilterChange('monthly')}
            startIcon={<CalendarToday />}
          >
            Monthly
          </Button>
        </ButtonGroup>

        {/* Custom Date Range */}
        <TextField
          label="Start Date"
          type="date"
          size="small"
          value={selectedDateRange.start}
          onChange={(e) => handleDateRangeChange('start', e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        
        <TextField
          label="End Date"
          type="date"
          size="small"
          value={selectedDateRange.end}
          onChange={(e) => handleDateRangeChange('end', e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        <Button
          variant="contained"
          onClick={fetchDashboardData}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`,
            }
          }}
        >
          Apply Filter
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <Chip
            label={`Period: ${dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main
            }}
          />
          <Chip
            label={`${selectedDateRange.start} to ${selectedDateRange.end}`}
            size="small"
            variant="outlined"
            sx={{
              borderColor: alpha(theme.palette.info.main, 0.3),
              color: theme.palette.info.main
            }}
          />
        </Box>
      </Box>

      {/* Employee Detailed Analytics */}
      {selectedEmployee && employeeAnalytics && (
        <Box mb={5}>
          <Card sx={{
            borderRadius: 4,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* Employee Header */}
              <Box display="flex" alignItems="center" mb={4}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '2rem',
                    fontWeight: 700,
                    mr: 3
                  }}
                >
                  {employeeAnalytics.employee.first_name?.[0]}{employeeAnalytics.employee.last_name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{
                    fontFamily: '"Bebas Neue", sans-serif',
                    color: theme.palette.secondary.main,
                    mb: 1
                  }}>
                    {employeeAnalytics.employee.first_name} {employeeAnalytics.employee.last_name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                    Employee Performance Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employment Started: {new Date(employeeAnalytics.totalStats.employmentStartDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {/* Summary Statistics */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.light}08 100%)`,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: 3,
                    textAlign: 'center',
                    p: 2
                  }}>
                    <MonetizationOn sx={{ fontSize: '2rem', color: theme.palette.success.main, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: theme.palette.success.main }}>
                      {formatCurrency(employeeAnalytics.totalStats.totalRevenue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{
                    background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.light}08 100%)`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    borderRadius: 3,
                    textAlign: 'center',
                    p: 2
                  }}>
                    <MonetizationOn sx={{ fontSize: '2rem', color: theme.palette.info.main, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: theme.palette.info.main }}>
                      {formatCurrency(employeeAnalytics.totalStats.totalCashTransactions)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Cash Payments</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}15 0%, ${theme.palette.secondary.light}08 100%)`,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    borderRadius: 3,
                    textAlign: 'center',
                    p: 2
                  }}>
                    <MonetizationOn sx={{ fontSize: '2rem', color: theme.palette.secondary.main, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: theme.palette.secondary.main }}>
                      {formatCurrency(employeeAnalytics.totalStats.totalCreditCardTransactions)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Card Payments</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{
                    background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.light}08 100%)`,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    borderRadius: 3,
                    textAlign: 'center',
                    p: 2
                  }}>
                    <AttachMoney sx={{ fontSize: '2rem', color: theme.palette.warning.main, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: theme.palette.warning.main }}>
                      {formatCurrency(employeeAnalytics.totalStats.totalTips)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Tips</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.light}08 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 3,
                    textAlign: 'center',
                    p: 2
                  }}>
                    <TrendingUp sx={{ fontSize: '2rem', color: theme.palette.primary.main, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: theme.palette.primary.main }}>
                      {employeeAnalytics.totalStats.overallOnTimePercentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">On-Time Performance</Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Payment Types Breakdown */}
              <Box mb={4}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{
                    fontFamily: '"Bebas Neue", sans-serif',
                    color: theme.palette.secondary.main,
                    fontSize: '1.5rem',
                    mb: 3
                  }}>
                    💳 Payment Methods Distribution
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Cash', value: employeeAnalytics.totalStats.totalCashTransactions, color: theme.palette.info.main },
                              { name: 'Credit Card', value: employeeAnalytics.totalStats.totalCreditCardTransactions, color: theme.palette.secondary.main },
                              { name: 'Tips', value: employeeAnalytics.totalStats.totalTips, color: theme.palette.warning.main }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          >
                            {[
                              { name: 'Cash', value: employeeAnalytics.totalStats.totalCashTransactions, color: theme.palette.info.main },
                              { name: 'Credit Card', value: employeeAnalytics.totalStats.totalCreditCardTransactions, color: theme.palette.secondary.main },
                              { name: 'Tips', value: employeeAnalytics.totalStats.totalTips, color: theme.palette.warning.main }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: '8px',
                              boxShadow: theme.shadows[4]
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.info.main, borderRadius: '50%' }} />
                          <Typography variant="body2">Cash: {formatCurrency(employeeAnalytics.totalStats.totalCashTransactions)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.secondary.main, borderRadius: '50%' }} />
                          <Typography variant="body2">Credit Card: {formatCurrency(employeeAnalytics.totalStats.totalCreditCardTransactions)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.warning.main, borderRadius: '50%' }} />
                          <Typography variant="body2">Tips: {formatCurrency(employeeAnalytics.totalStats.totalTips)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Total: {formatCurrency(employeeAnalytics.totalStats.totalRevenue)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Box>

              {/* Monthly Performance Chart */}
              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                  <Card sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{
                      fontFamily: '"Bebas Neue", sans-serif',
                      color: theme.palette.secondary.main,
                      fontSize: '1.5rem',
                      mb: 3
                    }}>
                      📊 Monthly Performance Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={employeeAnalytics.monthlyPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.5} />
                        <XAxis dataKey="monthName" stroke={theme.palette.text.secondary} />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <Tooltip
                          formatter={(value, name) => [
                            name === 'revenue' || name === 'profit' || name === 'tips' ? formatCurrency(value) : value,
                            name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : name === 'tips' ? 'Tips' : name
                          ]}
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '8px',
                            boxShadow: theme.shadows[4]
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill={theme.palette.success.main} name="Revenue" />
                        <Bar dataKey="cashTransactions" fill={theme.palette.info.main} name="Cash" />
                        <Bar dataKey="creditCardTransactions" fill={theme.palette.secondary.main} name="Credit Card" />
                        <Bar dataKey="tips" fill={theme.palette.warning.main} name="Tips" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                {/* Monthly Details Table */}
                <Grid item xs={12} lg={4}>
                  <Card sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
                    <Typography variant="h6" gutterBottom sx={{
                      fontFamily: '"Bebas Neue", sans-serif',
                      color: theme.palette.secondary.main,
                      fontSize: '1.5rem',
                      mb: 3
                    }}>
                      🚛 Truck Assignments
                    </Typography>
                    <Box>
                      {employeeAnalytics.monthlyPerformance.map((month, index) => (
                        <Box key={month.month} mb={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {month.monthName.split(' ')[0]}
                            </Typography>
                            <Chip
                              label={month.truck}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main
                              }}
                            />
                          </Box>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="caption" color="text.secondary">Work Days:</Typography>
                            <Typography variant="caption">{month.workDays} days</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Avg Hours/Day:</Typography>
                            <Typography variant="caption">{month.avgDailyHours}h</Typography>
                          </Box>
                          {index < employeeAnalytics.monthlyPerformance.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                      ))}
                    </Box>
                  </Card>
                </Grid>

                {/* Performance Heatmap */}
                <Grid item xs={12} lg={4}>
                  <Card sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
                    <Typography variant="h6" gutterBottom sx={{
                      fontFamily: '"Bebas Neue", sans-serif',
                      color: theme.palette.secondary.main,
                      fontSize: '1.5rem',
                      mb: 3
                    }}>
                      📊 Performance Metrics
                    </Typography>
                    <Box>
                      {employeeAnalytics.monthlyPerformance.map((month, index) => (
                        <Box key={month.month} mb={3}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {month.monthName.split(' ')[0]} Performance
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="caption" color="text.secondary">On-Time Rate:</Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: month.onTimePercentage >= 95 ? 'success.main' : month.onTimePercentage >= 90 ? 'warning.main' : 'error.main' }}>
                                  {month.onTimePercentage}%
                                </Typography>
                                <Box 
                                  sx={{ 
                                    width: 60, 
                                    height: 6, 
                                    backgroundColor: theme.palette.divider, 
                                    borderRadius: 3,
                                    overflow: 'hidden'
                                  }}
                                >
                                  <Box 
                                    sx={{ 
                                      width: `${month.onTimePercentage}%`, 
                                      height: '100%', 
                                      backgroundColor: month.onTimePercentage >= 95 ? theme.palette.success.main : month.onTimePercentage >= 90 ? theme.palette.warning.main : theme.palette.error.main,
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="caption" color="text.secondary">Deliveries:</Typography>
                              <Typography variant="caption">{month.deliveries} jobs</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="caption" color="text.secondary">Revenue/Hour:</Typography>
                              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                                {formatCurrency(month.revenue / month.totalHours)}
                              </Typography>
                            </Box>
                          </Box>
                          {index < employeeAnalytics.monthlyPerformance.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              {/* Detailed Monthly Table */}
              <Box mt={4}>
                <Typography variant="h6" gutterBottom sx={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  color: theme.palette.secondary.main,
                  fontSize: '1.5rem',
                  mb: 3
                }}>
                  📅 Detailed Monthly Breakdown
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Truck</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Revenue</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Cash</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Credit Card</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tips</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Deliveries</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>On-Time %</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employeeAnalytics.monthlyPerformance.map((month) => (
                        <TableRow
                          key={month.month}
                          sx={{ '&:nth-of-type(odd)': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                        >
                          <TableCell>{month.monthName}</TableCell>
                          <TableCell>
                            <Chip
                              label={month.truck}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                            {formatCurrency(month.revenue)}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                            {formatCurrency(month.cashTransactions)}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                            {formatCurrency(month.creditCardTransactions)}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                            {formatCurrency(month.tips)}
                          </TableCell>
                          <TableCell>{month.deliveries}</TableCell>
                          <TableCell sx={{ 
                            color: month.onTimePercentage >= 95 ? 'success.main' : month.onTimePercentage >= 90 ? 'warning.main' : 'error.main',
                            fontWeight: 600 
                          }}>
                            {month.onTimePercentage}%
                          </TableCell>
                          <TableCell>{month.totalHours}h</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Ra-Themed Dashboard Content */}
      <Box>
        {/* Overview Cards with Egyptian Styling */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} mb={{ xs: 4, md: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.light}08 100%)`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              },
              '&:hover': {
                transform: 'translateY(-8px)',
                borderColor: alpha(theme.palette.primary.main, 0.3),
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
              },
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  sx={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    mb: 2
                  }}
                >
                  Total Companies
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontWeight: 700,
                  fontSize: '2.5rem',
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.primary.light 
                    : theme.palette.primary.main,
                  mb: 1
                }}>
                  {selectedTruck ? 1 : (overview?.overview?.total_companies || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main}15 0%, ${theme.palette.secondary.light}08 100%)`,
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              },
              '&:hover': {
                transform: 'translateY(-8px)',
                borderColor: alpha(theme.palette.secondary.main, 0.3),
                boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.15)}`,
              },
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  sx={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    mb: 2
                  }}
                >
                  Active Employees
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontWeight: 700,
                  fontSize: '2.5rem',
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.secondary.light 
                    : theme.palette.secondary.main,
                  mb: 1
                }}>
                  {overview?.employeeStats?.total_employees || overview?.overview?.active_employees || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.light}08 100%)`,
              border: `2px solid ${alpha(theme.palette.info.main, 0.1)}`,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              },
              '&:hover': {
                transform: 'translateY(-8px)',
                borderColor: alpha(theme.palette.info.main, 0.3),
                boxShadow: `0 20px 40px ${alpha(theme.palette.info.main, 0.15)}`,
              },
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  sx={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    mb: 2
                  }}
                >
                  Active Trucks
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontWeight: 700,
                  fontSize: '2.5rem',
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.info.light 
                    : theme.palette.info.main,
                  mb: 1
                }}>
                  {selectedTruck ? 1 : (overview?.overview?.active_trucks || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.light}08 100%)`,
              border: `2px solid ${alpha(theme.palette.success.main, 0.1)}`,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              },
              '&:hover': {
                transform: 'translateY(-8px)',
                borderColor: alpha(theme.palette.success.main, 0.3),
                boxShadow: `0 20px 40px ${alpha(theme.palette.success.main, 0.15)}`,
              },
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  sx={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    mb: 2
                  }}
                >
                  Total Revenue
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontWeight: 700,
                  fontSize: '2.5rem',
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.success.light 
                    : theme.palette.success.main,
                  mb: 1
                }}>
                  {formatCurrency(salesAnalytics.reduce((sum, day) => sum + parseFloat(day.total_revenue || 0), 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section with Egyptian Styling */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Sales Analytics Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
            }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontWeight: 600,
                  color: theme.palette.secondary.main,
                  letterSpacing: '0.02em',
                  fontSize: '1.5rem',
                  mb: 3
                }}>
                  📈 Sales Trend ({dateFilter === 'daily' ? 'Daily' : dateFilter === 'weekly' ? 'Weekly' : 'Monthly'} View)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.5} />
                    <XAxis dataKey="period" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'total_revenue' ? formatCurrency(value) : value,
                        name === 'total_revenue' ? 'Revenue' : 'Transactions'
                      ]}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                        boxShadow: theme.shadows[4]
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total_revenue" 
                      stroke={theme.palette.primary.main} 
                      strokeWidth={3}
                      dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                      name="Revenue" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transaction_count" 
                      stroke={theme.palette.secondary.main} 
                      strokeWidth={3}
                      dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                      name="Transactions" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Business Insights */}
          <Grid item xs={12} lg={4}>
            <Card sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
            }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontWeight: 600,
                  color: theme.palette.secondary.main,
                  letterSpacing: '0.02em',
                  fontSize: '1.5rem',
                  mb: 3
                }}>
                  🍦🍔 Revenue by Business Type
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overview?.businessTypes?.map(type => ({
                        ...type,
                        name: type.business_type === 'ice_cream' ? 'Ice Cream' : 'Burger',
                        value: parseFloat(type.total_revenue || 0)
                      })) || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {overview?.businessTypes?.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.business_type === 'ice_cream' ? theme.palette.info.main : theme.palette.warning.main} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                        boxShadow: theme.shadows[4]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Business Type Summary */}
                <Box mt={2}>
                  {overview?.businessTypes?.map((type, index) => (
                    <Box key={type.business_type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: type.business_type === 'ice_cream' ? theme.palette.info.main : theme.palette.warning.main 
                          }} 
                        />
                        <Typography variant="body2">
                          {type.business_type === 'ice_cream' ? 'Ice Cream' : 'Burger'} ({type.company_count} companies)
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatCurrency(type.total_revenue || 0)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Business Insights */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} mt={4}>
          {/* Key Performance Metrics */}
          <Grid item xs={12} lg={6}>
            <Card sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
            }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontWeight: 600,
                  color: theme.palette.secondary.main,
                  letterSpacing: '0.02em',
                  fontSize: '1.5rem',
                  mb: 3
                }}>
                  📊 Key Performance Indicators
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                      <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                        {formatCurrency(
                          salesAnalytics.length > 0 ? 
                          salesAnalytics.reduce((sum, day) => sum + parseFloat(day.total_revenue || 0), 0) / 
                          salesAnalytics.reduce((sum, day) => sum + parseInt(day.transaction_count || 0), 0) || 0 : 0
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Avg Transaction</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                      <Typography variant="h6" sx={{ color: 'info.main', fontWeight: 700 }}>
                        {overview?.overview?.active_trucks || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Active Fleet</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                      <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 700 }}>
                        {selectedTruck ? 
                          formatCurrency(salesAnalytics.reduce((sum, day) => sum + parseFloat(day.total_revenue || 0), 0)) :
                          formatCurrency(salesAnalytics.reduce((sum, day) => sum + parseFloat(day.total_revenue || 0), 0) / (overview?.overview?.active_trucks || 1))
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedTruck ? 'Truck Revenue' : 'Revenue per Truck'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                      <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                        {salesAnalytics.reduce((sum, day) => sum + parseInt(day.transaction_count || 0), 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Total Transactions</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Low Stock Alert */}
          <Grid item xs={12} lg={6}>
            <Card sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
            }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontWeight: 600,
                  color: theme.palette.secondary.main,
                  letterSpacing: '0.02em',
                  fontSize: '1.5rem',
                  mb: 3
                }}>
                  ⚠️ Inventory Alerts
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {lowStock.length > 0 ? lowStock.map((item, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      p: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: item.quantity === 0 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                      border: `1px solid ${item.quantity === 0 ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.warning.main, 0.3)}`
                    }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {item.item_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.truck_number} • {item.company_name}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ 
                          color: item.quantity === 0 ? 'error.main' : 'warning.main',
                          fontWeight: 700 
                        }}>
                          {item.quantity} left
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Reorder: {item.reorder_level}
                        </Typography>
                      </Box>
                    </Box>
                  )) : (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        ✅ All inventory levels are healthy
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;