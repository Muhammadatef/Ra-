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
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { apiEndpoints } from '../services/api';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const limit = 20;

  useEffect(() => {
    fetchEmployees();
    fetchCompanies();
  }, [page, selectedCompany, selectedStatus]);

  const fetchCompanies = async () => {
    try {
      const response = await apiEndpoints.getCompanies();
      setCompanies(response.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        limit,
        offset: (page - 1) * limit,
      };
      
      if (selectedCompany) params.company_id = selectedCompany;
      if (selectedStatus) params.status = selectedStatus;

      const response = await apiEndpoints.getEmployees(params);
      setEmployees(response.data.employees);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Employees error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const formatSalary = (amount) => {
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
      <Typography variant="h4" gutterBottom>
        Employees
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Company</InputLabel>
            <Select
              value={selectedCompany}
              label="Company"
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Companies</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="terminated">Terminated</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Hire Date</TableCell>
                <TableCell align="right">Salary</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employee_id}</TableCell>
                  <TableCell>
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {employee.company_name}
                      </Typography>
                      <Chip
                        label={employee.business_type?.replace('_', ' ')}
                        size="small"
                        color={employee.business_type === 'ice_cream' ? 'primary' : 'secondary'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {employee.location_name ? (
                      <Typography variant="body2">
                        {employee.location_name}<br />
                        {employee.location_city}, {employee.location_state}
                      </Typography>
                    ) : (
                      'Not assigned'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(employee.hire_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {employee.salary ? formatSalary(employee.salary) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status}
                      color={
                        employee.status === 'active' ? 'success' :
                        employee.status === 'inactive' ? 'warning' : 'error'
                      }
                      size="small"
                    />
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
        Showing {employees.length} of {total} employees
      </Typography>
    </Box>
  );
}

export default Employees;