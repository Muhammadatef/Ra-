import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Dashboard
  getDashboardOverview: (params = {}) => api.get('/dashboard/overview', { params }),
  getSalesAnalytics: (params = {}) => api.get('/dashboard/sales-analytics', { params }),
  getTruckPerformance: (params = {}) => api.get('/dashboard/truck-performance', { params }),
  getLowStock: (params = {}) => api.get('/dashboard/low-stock', { params }),

  // Companies
  getCompanies: () => api.get('/companies'),
  getCompany: (id) => api.get(`/companies/${id}`),
  createCompany: (data) => api.post('/companies', data),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/companies/${id}`),

  // Employees
  getEmployees: (params = {}) => api.get('/employees', { params }),
  getEmployee: (id) => api.get(`/employees/${id}`),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),

  // Trucks
  getTrucks: (params = {}) => api.get('/trucks', { params }),
  getTruck: (id) => api.get(`/trucks/${id}`),
  createTruck: (data) => api.post('/trucks', data),
  updateTruck: (id, data) => api.put(`/trucks/${id}`, data),
  deleteTruck: (id) => api.delete(`/trucks/${id}`),

  // Routes
  getRoutes: (params = {}) => api.get('/routes', { params }),
  getRoute: (id) => api.get(`/routes/${id}`),
  createRoute: (data) => api.post('/routes', data),
  updateRoute: (id, data) => api.put(`/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/routes/${id}`),

  // Sales
  getSales: (params = {}) => api.get('/sales', { params }),
  getSalesSummary: (params = {}) => api.get('/sales/summary', { params }),
  createSale: (data) => api.post('/sales', data),

  // Inventory
  getInventory: (params = {}) => api.get('/inventory', { params }),
  getTruckInventory: (truckId) => api.get(`/inventory/truck/${truckId}`),
  createInventoryItem: (data) => api.post('/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/inventory/${id}`, data),
  updateInventoryQuantity: (id, data) => api.patch(`/inventory/${id}/quantity`, data),
  deleteInventoryItem: (id) => api.delete(`/inventory/${id}`),

  // Health check
  getHealth: () => api.get('/health'),
};

export default api;