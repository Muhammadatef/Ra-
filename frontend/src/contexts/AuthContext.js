import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiEndpoints } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('ra_token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await apiEndpoints.getProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('🔐 Attempting login for:', username);
      const response = await apiEndpoints.login({ username, password });
      console.log('✅ Login response:', response.data);
      
      const { user: userData, token: authToken } = response.data;
      
      localStorage.setItem('ra_token', authToken);
      setToken(authToken);
      setUser(userData);
      
      console.log('✅ Login successful, user set:', userData);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiEndpoints.register(userData);
      const { user: newUser, token: authToken } = response.data;
      
      localStorage.setItem('ra_token', authToken);
      setToken(authToken);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('ra_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await apiEndpoints.updateProfile(updates);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Update failed' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await apiEndpoints.changePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password change failed' 
      };
    }
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    hasRole,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};