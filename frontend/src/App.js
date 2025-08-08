import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { Logout, Business, Brightness4, Brightness7 } from '@mui/icons-material';
// import { motion, AnimatePresence } from 'framer-motion'; // Commented out for container compatibility

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RaThemeProvider, useThemeMode } from './contexts/ThemeContext';
import { FilterProvider } from './contexts/FilterContext';

// Pages
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Trucks from './pages/Trucks';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Login from './pages/Login';

// Components
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import RaLogo from './components/RaLogo';


// App Bar with User Menu Component
function AppBarWithUser() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ minHeight: '80px !important' }}>
        <div>
          <RaLogo size="medium" variant="full" />
        </div>
        
        <div style={{ marginLeft: '2rem', flex: 1 }}>
          <Typography variant="subtitle1" sx={{ 
            opacity: 0.9, 
            fontWeight: 300, 
            letterSpacing: '0.05em',
            color: (theme) => theme.palette.mode === 'dark' 
              ? theme.palette.primary.light 
              : theme.palette.primary.contrastText 
          }}>
            Business Intelligence Platform
          </Typography>
        </div>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{ 
                mr: 1,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </div>
          
          <div>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              <Business sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' 
                  ? theme.palette.primary.light 
                  : theme.palette.primary.contrastText
              }}>
                {user?.companyName}
              </Typography>
            </Box>
          </div>
          
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <Avatar sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </div>
          
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role} • {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

// Main App Layout Component
function AppLayout() {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: (theme) => theme.palette.mode === 'light' 
        ? `radial-gradient(ellipse at top, ${theme.palette.primary.main}08 0%, transparent 50%), radial-gradient(ellipse at bottom, ${theme.palette.secondary.main}05 0%, transparent 50%)`
        : `radial-gradient(ellipse at top, ${theme.palette.primary.main}15 0%, transparent 50%), radial-gradient(ellipse at bottom, ${theme.palette.secondary.main}10 0%, transparent 50%)`
    }}>
      <AppBarWithUser />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Navigation />
        
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            p: { xs: 2, sm: 3, md: 4 },
            overflow: 'hidden',
            maxWidth: '100%'
          }}
        >
          <Container maxWidth="xl">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/trucks" element={<Trucks />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/inventory" element={<Inventory />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <RaThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <FilterProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              } />
            </Routes>
          </Router>
        </FilterProvider>
      </AuthProvider>
    </RaThemeProvider>
  );
}

export default App;