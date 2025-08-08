import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
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
import { motion } from 'framer-motion';

const ChartWidget = ({ 
  type = 'line', 
  data = [], 
  loading = false,
  title,
  xKey = 'name',
  yKey = 'value',
  colors = null,
  showGrid = true,
  showLegend = true,
  customTooltip = null,
  height = 300
}) => {
  const theme = useTheme();
  
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];
  
  const chartColors = colors || defaultColors;
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height 
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height,
          color: 'text.secondary'
        }}
      >
        <Typography variant="body2">No data available</Typography>
      </Box>
    );
  }
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(0,0,0,0.9)' 
              : 'rgba(255,255,255,0.95)',
            padding: 2,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[4],
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ 
                color: entry.color,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                }}
              />
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };
  
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };
    
    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.palette.divider}
                opacity={0.5}
              />
            )}
            <XAxis 
              dataKey={xKey} 
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <Tooltip content={customTooltip || <CustomTooltip />} />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={chartColors[0]} 
              strokeWidth={3}
              dot={{ 
                fill: chartColors[0], 
                strokeWidth: 2, 
                r: 4 
              }}
              activeDot={{ 
                r: 6, 
                stroke: chartColors[0],
                strokeWidth: 2,
                fill: theme.palette.background.paper
              }}
            />
          </LineChart>
        );
        
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.palette.divider}
                opacity={0.5}
              />
            )}
            <XAxis 
              dataKey={xKey} 
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <Tooltip content={customTooltip || <CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar 
              dataKey={yKey} 
              fill={chartColors[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
        
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={yKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={chartColors[index % chartColors.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={customTooltip || <CustomTooltip />} />
          </PieChart>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%' }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </Box>
    </motion.div>
  );
};

export default ChartWidget;