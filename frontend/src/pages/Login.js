import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import RaLogo from '../components/RaLogo';
import { useTheme } from '@mui/material/styles';

function Login() {
  const { login, isAuthenticated } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (showRegister) {
    return <Register onBackToLogin={() => setShowRegister(false)} />;
  }

  return (
    <Container 
      component="main" 
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        background: theme.palette.mode === 'light' 
          ? `radial-gradient(ellipse at top, ${theme.palette.primary.main}08 0%, transparent 50%), radial-gradient(ellipse at bottom, ${theme.palette.secondary.main}05 0%, transparent 50%)`
          : `radial-gradient(ellipse at top, ${theme.palette.primary.main}15 0%, transparent 50%), radial-gradient(ellipse at bottom, ${theme.palette.secondary.main}10 0%, transparent 50%)`
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: 5, 
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 4,
          border: `2px solid ${theme.palette.primary.main}20`,
          boxShadow: `0 20px 40px rgba(${theme.palette.mode === 'light' ? '27, 38, 59' : '255, 215, 0'}, 0.15)`,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <RaLogo size="large" variant="full" />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{
            fontFamily: '"Bebas Neue", sans-serif',
            color: theme.palette.secondary.main,
            fontSize: '2.5rem'
          }}>
            Welcome to Ra Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Business Intelligence Platform for Logistics
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username or Email"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            margin="normal"
            required
            autoComplete="username"
            autoFocus
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              height: 56,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
              fontSize: '1.1rem',
              borderRadius: 3,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px rgba(${theme.palette.primary.main}, 0.3)`
              },
              '&:disabled': {
                background: theme.palette.action.disabledBackground,
              }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: theme.palette.primary.contrastText }} /> : 'Sign In'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => setShowRegister(true)}
                sx={{ cursor: 'pointer' }}
              >
                Register your company
              </Link>
            </Typography>
          </Box>
        </form>

        <Box sx={{ 
          mt: 4, 
          p: 3, 
          bgcolor: theme.palette.mode === 'light' ? theme.palette.primary.main + '08' : theme.palette.primary.main + '15',
          border: `1px solid ${theme.palette.primary.main}20`,
          borderRadius: 3 
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 600,
            mb: 2
          }}>
            🚀 Demo Accounts:
          </Typography>
          <Typography variant="body2" sx={{ 
            fontFamily: 'monospace', 
            fontSize: '0.9rem',
            lineHeight: 1.8,
            color: theme.palette.text.secondary
          }}>
            • <strong>admin1</strong> / admin123 (Arctic Delights Ice Cream)<br/>
            • <strong>admin2</strong> / admin123 (Frozen Paradise Trucks)<br/>
            • <strong>admin3</strong> / admin123 (Golden State Burger)<br/>
            • <strong>admin4</strong> / admin123 (Pacific Coast Grill)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

// Registration Component
function Register({ onBackToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    businessType: 'ice_cream',
    state: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container 
      component="main" 
      maxWidth="md"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Register Your Company
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start managing your food truck business
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              sx={{ gridColumn: { md: '1 / -1' } }}
            />

            <TextField
              fullWidth
              label="Business Type"
              name="businessType"
              select
              value={formData.businessType}
              onChange={handleInputChange}
              SelectProps={{ native: true }}
              required
            >
              <option value="ice_cream">Ice Cream Truck</option>
              <option value="burger">Burger Truck</option>
            </TextField>

            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              placeholder="e.g., California, Washington"
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2, height: 48 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link 
              component="button" 
              variant="body2" 
              onClick={onBackToLogin}
              sx={{ cursor: 'pointer' }}
            >
              Back to Login
            </Link>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;