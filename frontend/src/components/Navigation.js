import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  LocalShipping as TruckIcon,
  AttachMoney as SalesIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Commented out for container compatibility
import RaLogo from './RaLogo';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', description: 'Analytics Overview' },
  { text: 'Employees', icon: <PeopleIcon />, path: '/employees', description: 'Team Performance' },
  { text: 'Trucks', icon: <TruckIcon />, path: '/trucks', description: 'Fleet Management' },
  { text: 'Sales', icon: <SalesIcon />, path: '/sales', description: 'Revenue Tracking' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', description: 'Stock Control' },
];

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // const itemVariants = {
  //   hidden: { opacity: 0, x: -20 },
  //   visible: (index) => ({
  //     opacity: 1,
  //     x: 0,
  //     transition: {
  //       delay: index * 0.1,
  //       duration: 0.5,
  //       ease: 'easeOut'
  //     }
  //   })
  // };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'relative',
          borderRight: 'none',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '1px',
            height: '100%',
            background: theme.palette.mode === 'light'
              ? `linear-gradient(180deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.main}10 50%, ${theme.palette.primary.main}20 100%)`
              : `linear-gradient(180deg, ${theme.palette.primary.main}40 0%, ${theme.palette.primary.main}20 50%, ${theme.palette.primary.main}40 100%)`,
            boxShadow: theme.palette.mode === 'light'
              ? `0 0 20px ${theme.palette.primary.main}20`
              : `0 0 20px ${theme.palette.primary.main}40`,
          }
        },
      }}
    >
      <div>
        <Box sx={{ p: 3, pb: 2 }}>
          <RaLogo size="small" variant="full" animated={false} />
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              mt: 1,
              color: 'text.secondary',
              fontWeight: 300,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}
          >
            Navigation Portal
          </Typography>
        </Box>
      </div>
      <Divider sx={{ 
        mx: 2,
        background: theme.palette.mode === 'light'
          ? `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main}30 50%, transparent 100%)`
          : `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main}50 50%, transparent 100%)`
      }} />
      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item, index) => {
          const isSelected = location.pathname === item.path;
          return (
            <div key={item.text}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: isSelected 
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                        : 'transparent',
                      opacity: isSelected ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      zIndex: 0,
                    },
                    '&:hover': {
                      transform: 'translateX(4px)',
                      '&::before': {
                        opacity: isSelected ? 1 : 0.1,
                        background: isSelected 
                          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                          : `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.dark}20 100%)`,
                      }
                    },
                    '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                      position: 'relative',
                      zIndex: 1,
                      color: isSelected ? theme.palette.primary.contrastText : 'inherit',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 48,
                    '& svg': {
                      fontSize: '1.5rem',
                      filter: isSelected 
                        ? `drop-shadow(0 0 8px ${theme.palette.primary.light})`
                        : 'none'
                    }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: '0.95rem',
                          letterSpacing: '0.02em'
                        }}
                      >
                        {item.text}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: isSelected ? `${theme.palette.primary.contrastText}CC` : 'text.secondary',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em',
                          fontWeight: 300
                        }}
                      >
                        {item.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </div>
          );
        })}
      </List>
      
      {/* Egyptian-inspired decorative element at bottom */}
      <Box 
        sx={{ 
          mt: 'auto', 
          p: 2, 
          textAlign: 'center',
          opacity: 0.6
        }}
      >
        <div>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 300
            }}
          >
            Powered by Ra
          </Typography>
          <Box sx={{ 
            height: 2, 
            mt: 1, 
            background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main}60 50%, transparent 100%)`,
            borderRadius: 1
          }} />
        </div>
      </Box>
    </Drawer>
  );
}

export default Navigation;