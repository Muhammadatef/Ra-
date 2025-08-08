import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import createRaTheme from '../theme/raTheme';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a RaThemeProvider');
  }
  return context;
};

export const RaThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Get saved theme from localStorage or default to 'light'
    const savedMode = localStorage.getItem('ra-theme-mode');
    return savedMode || 'light';
  });

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('ra-theme-mode', newMode);
  };

  const theme = createRaTheme(mode);

  useEffect(() => {
    // Update the document body class for global styles if needed
    document.body.setAttribute('data-theme', mode);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.palette.primary.main);
    }
  }, [mode, theme]);

  const value = {
    mode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};