import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  BarChart,
  ShowChart,
  PieChart,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { motion, AnimatePresence } from 'framer-motion';

import DashboardWidget from './DashboardWidget';
import KPIWidget from './widgets/KPIWidget';
import ChartWidget from './widgets/ChartWidget';

const DashboardContainer = ({ 
  initialWidgets = [], 
  onWidgetsChange,
  availableData = {},
  loading = false 
}) => {
  const theme = useTheme();
  const [widgets, setWidgets] = useState(initialWidgets);
  const [activeId, setActiveId] = useState(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const widgetTypes = [
    {
      id: 'kpi',
      name: 'KPI Metric',
      icon: <TrendingUp />,
      description: 'Key performance indicator with trend'
    },
    {
      id: 'line-chart',
      name: 'Line Chart',
      icon: <ShowChart />,
      description: 'Time series data visualization'
    },
    {
      id: 'bar-chart',
      name: 'Bar Chart',
      icon: <BarChart />,
      description: 'Comparative data visualization'
    },
    {
      id: 'pie-chart',
      name: 'Pie Chart',
      icon: <PieChart />,
      description: 'Proportional data visualization'
    },
  ];
  
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);
  
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        onWidgetsChange?.(newItems);
        return newItems;
      });
    }
    
    setActiveId(null);
  }, [onWidgetsChange]);
  
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);
  
  const getWidgetTitle = (type) => {
    const typeMap = {
      'kpi': 'KPI Metric',
      'line-chart': 'Line Chart',
      'bar-chart': 'Bar Chart',
      'pie-chart': 'Pie Chart',
    };
    return typeMap[type] || 'Widget';
  };
  
  const getDefaultConfig = (type) => {
    switch (type) {
      case 'kpi':
        return {
          dataKey: 'totalRevenue',
          prefix: '$',
          suffix: '',
        };
      case 'line-chart':
        return {
          dataKey: 'salesAnalytics',
          xKey: 'period',
          yKey: 'total_revenue',
        };
      case 'bar-chart':
        return {
          dataKey: 'truckPerformance',
          xKey: 'truck_number',
          yKey: 'total_revenue',
        };
      case 'pie-chart':
        return {
          dataKey: 'businessTypes',
          xKey: 'business_type',
          yKey: 'company_count',
        };
      default:
        return {};
    }
  };

  const addWidget = useCallback((type) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      config: getDefaultConfig(type),
    };
    
    const newWidgets = [...widgets, newWidget];
    setWidgets(newWidgets);
    onWidgetsChange?.(newWidgets);
    setAddMenuAnchor(null);
  }, [widgets, onWidgetsChange]);
  
  const removeWidget = useCallback((widgetId) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(newWidgets);
    onWidgetsChange?.(newWidgets);
  }, [widgets, onWidgetsChange]);
  
  const renderWidget = (widget, isDragging = false) => {
    const { type, config, title, id } = widget;
    const data = availableData[config.dataKey] || [];
    
    let content;
    
    switch (type) {
      case 'kpi':
        const kpiValue = Array.isArray(data) ? data.reduce((sum, item) => sum + (item[config.yKey] || 0), 0) : data;
        content = (
          <KPIWidget
            title={title}
            value={kpiValue}
            prefix={config.prefix}
            suffix={config.suffix}
            change={Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 10)}
            changeType={Math.random() > 0.5 ? 'positive' : 'negative'}
          />
        );
        break;
        
      case 'line-chart':
      case 'bar-chart':
      case 'pie-chart':
        const chartType = type.split('-')[0];
        content = (
          <ChartWidget
            type={chartType}
            data={data}
            loading={loading}
            xKey={config.xKey}
            yKey={config.yKey}
            height={250}
          />
        );
        break;
        
      default:
        content = (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            Unknown widget type: {type}
          </Box>
        );
    }
    
    return (
      <DashboardWidget
        key={id}
        id={id}
        title={title}
        onRemove={removeWidget}
        isDragging={isDragging}
        minHeight={type === 'kpi' ? 180 : 300}
      >
        {content}
      </DashboardWidget>
    );
  };
  
  const activeWidget = widgets.find(w => w.id === activeId);
  
  return (
    <Box sx={{ position: 'relative', minHeight: '400px' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <Grid container spacing={3}>
            <AnimatePresence>
              {widgets.map((widget) => {
                const isKPI = widget.type === 'kpi';
                return (
                  <Grid 
                    key={widget.id} 
                    item 
                    xs={12} 
                    sm={isKPI ? 6 : 12} 
                    md={isKPI ? 4 : 6} 
                    lg={isKPI ? 3 : 6}
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderWidget(widget)}
                    </motion.div>
                  </Grid>
                );
              })}
            </AnimatePresence>
          </Grid>
        </SortableContext>
        
        <DragOverlay>
          {activeWidget ? (
            <Box sx={{ transform: 'rotate(5deg)' }}>
              {renderWidget(activeWidget, true)}
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      {/* Add Widget FAB */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => setAddMenuAnchor(e.currentTarget)}
      >
        <AddIcon />
      </Fab>
      
      {/* Add Widget Menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={() => setAddMenuAnchor(null)}
        PaperProps={{
          sx: {
            background: theme.palette.mode === 'dark'
              ? 'rgba(55, 71, 79, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            minWidth: 250,
          }
        }}
      >
        {widgetTypes.map((widgetType) => (
          <MenuItem
            key={widgetType.id}
            onClick={() => addWidget(widgetType.id)}
            sx={{
              py: 1.5,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.dark}20)`,
              }
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main }}>
              {widgetType.icon}
            </ListItemIcon>
            <ListItemText
              primary={widgetType.name}
              secondary={widgetType.description}
              secondaryTypographyProps={{
                variant: 'caption',
                color: 'text.secondary'
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default DashboardContainer;