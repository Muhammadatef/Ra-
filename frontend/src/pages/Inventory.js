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
  Card,
  CardContent,
} from '@mui/material';
import { apiEndpoints } from '../services/api';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const fetchTrucks = async () => {
    try {
      const response = await apiEndpoints.getTrucks();
      setTrucks(response.data.filter(truck => truck.status === 'active'));
    } catch (err) {
      console.error('Error fetching trucks:', err);
    }
  };

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedTruck) params.truck_id = selectedTruck;
      if (selectedCategory) params.category = selectedCategory;
      if (showLowStock) params.low_stock = 'true';

      const response = await apiEndpoints.getInventory(params);
      setInventory(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory');
      console.error('Inventory error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTruck, selectedCategory, showLowStock]);

  useEffect(() => {
    fetchInventory();
    fetchTrucks();
  }, [fetchInventory]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'error' };
    if (quantity <= reorderLevel) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const categories = [...new Set(inventory.map(item => item.category))];
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorder_level).length;
  const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

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
        Inventory
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h5">
                {totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h5" color="warning.main">
                {lowStockItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Out of Stock
              </Typography>
              <Typography variant="h5" color="error.main">
                {outOfStockItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(totalValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Truck</InputLabel>
            <Select
              value={selectedTruck}
              label="Truck"
              onChange={(e) => setSelectedTruck(e.target.value)}
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
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Stock Status</InputLabel>
            <Select
              value={showLowStock ? 'low' : ''}
              label="Stock Status"
              onChange={(e) => setShowLowStock(e.target.value === 'low')}
            >
              <MenuItem value="">All Items</MenuItem>
              <MenuItem value="low">Low Stock Only</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Truck</TableCell>
                <TableCell>Company</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Total Value</TableCell>
                <TableCell align="right">Reorder Level</TableCell>
                <TableCell>Last Restocked</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => {
                const stockStatus = getStockStatus(item.quantity, item.reorder_level);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {item.item_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.truck_number}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.license_plate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {item.company_name}
                        </Typography>
                        <Chip
                          label={item.business_type?.replace('_', ' ')}
                          size="small"
                          color={item.business_type === 'ice_cream' ? 'primary' : 'secondary'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color={item.quantity <= item.reorder_level ? 'error.main' : 'text.primary'}
                      >
                        {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {item.reorder_level}
                    </TableCell>
                    <TableCell>
                      {item.last_restocked ? 
                        new Date(item.last_restocked).toLocaleDateString() : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography variant="body2" color="textSecondary" mt={2}>
        Total items: {inventory.length}
      </Typography>
    </Box>
  );
}

export default Inventory;