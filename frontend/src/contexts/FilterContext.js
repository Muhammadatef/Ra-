import React, { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [dateFilter, setDateFilter] = useState('monthly'); // daily, weekly, monthly
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const clearAllFilters = () => {
    setSelectedEmployee('');
    setSelectedTruck('');
    // Don't reset date filters, keep current period
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedEmployee) count++;
    if (selectedTruck) count++;
    return count;
  };

  const handleDateFilterChange = (filterType) => {
    setDateFilter(filterType);
    // Auto-adjust date range based on filter type
    const today = new Date();
    let startDate;
    
    switch (filterType) {
      case 'daily':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        break;
      case 'weekly':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 84); // 12 weeks
        break;
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth() - 12, 1); // 12 months
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    }
    
    setSelectedDateRange({
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
  };

  const handleDateRangeChange = (field, value) => {
    setSelectedDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAPIParams = () => {
    const params = {};
    if (selectedEmployee) params.employee_id = selectedEmployee;
    if (selectedTruck) params.truck_id = selectedTruck;
    
    // Add date range parameters
    params.start_date = selectedDateRange.start;
    params.end_date = selectedDateRange.end;
    params.group_by = dateFilter === 'daily' ? 'day' : dateFilter === 'weekly' ? 'week' : 'month';
    
    return params;
  };

  const value = {
    // State
    selectedEmployee,
    selectedTruck,
    dateFilter,
    selectedDateRange,
    
    // Actions
    setSelectedEmployee,
    setSelectedTruck,
    setDateFilter,
    setSelectedDateRange,
    clearAllFilters,
    handleDateFilterChange,
    handleDateRangeChange,
    
    // Computed
    getActiveFiltersCount,
    getAPIParams,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};