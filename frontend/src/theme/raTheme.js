import { createTheme } from '@mui/material/styles';

// Ra Platform - Proper Color Theory Based Palette
const raColors = {
  // Primary - Gold/Sun (Ra's divine light)
  gold: {
    50: '#fffbf0',
    100: '#fff4d1',
    200: '#ffe8a3',
    300: '#ffdc75',
    400: '#ffd047',
    500: '#FFD700', // Pure gold - main
    600: '#FFB400', // Darker gold
    700: '#e69500',
    800: '#cc7600',
    900: '#b35700',
  },
  // Secondary - Navy/Deep Blue (trust, depth, professional)
  navy: {
    50: '#f0f4f8',
    100: '#d9e2ec',
    200: '#bcccdc',
    300: '#9fb3c8',
    400: '#829ab1',
    500: '#627d98',
    600: '#486581',
    700: '#334e68',
    800: '#1B263B', // Main navy
    900: '#14213D', // Deepest navy
  },
  // Accent - Crimson/Rust (alerts, energy, action)
  crimson: {
    50: '#fef2f2',
    100: '#fde6e6',
    200: '#fabcbc',
    300: '#f87171',
    400: '#ef4444',
    500: '#D72638', // Main crimson
    600: '#B73E3E', // Darker crimson
    700: '#991b1b',
    800: '#7f1d1d',
    900: '#661414',
  },
  // Background - Sand/Neutral (clean, professional)
  sand: {
    50: '#FAF3E0', // Light sand
    100: '#f7f3f0',
    200: '#F4F4F4', // Neutral gray
    300: '#e5e5e5',
    400: '#d4d4d4',
    500: '#a3a3a3',
    600: '#737373',
    700: '#525252',
    800: '#404040',
    900: '#262626',
  },
  // Success - Emerald Green (positive data)
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#2ECC71', // Main emerald
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Warning - Amber (warnings, attention)
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#F39C12', // Main amber
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
};

// Create the Ra theme with proper color theory
export const createRaTheme = (mode) => {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: raColors.gold[500], // Pure gold
        light: raColors.gold[300],
        dark: raColors.gold[600],
        contrastText: raColors.navy[800], // Navy text on gold
      },
      secondary: {
        main: raColors.navy[800], // Deep navy
        light: raColors.navy[600],
        dark: raColors.navy[900],
        contrastText: '#ffffff',
      },
      error: {
        main: raColors.crimson[500], // Crimson for alerts
        light: raColors.crimson[300],
        dark: raColors.crimson[600],
        contrastText: '#ffffff',
      },
      warning: {
        main: raColors.amber[500], // Amber for warnings
        light: raColors.amber[300],
        dark: raColors.amber[600],
        contrastText: raColors.navy[900],
      },
      success: {
        main: raColors.emerald[500], // Emerald for positive data
        light: raColors.emerald[300],
        dark: raColors.emerald[600],
        contrastText: '#ffffff',
      },
      info: {
        main: raColors.navy[600], // Navy blue for info
        light: raColors.navy[400],
        dark: raColors.navy[800],
        contrastText: '#ffffff',
      },
      background: {
        default: isLight ? raColors.sand[50] : '#0f0f23', // Sand for light, deep blue for dark
        paper: isLight ? '#ffffff' : '#1a1a2e',
      },
      surface: {
        main: isLight ? '#ffffff' : '#16213e',
        dark: isLight ? raColors.sand[100] : '#16213e',
      },
      text: {
        primary: isLight ? raColors.navy[900] : '#ffffff',
        secondary: isLight ? raColors.navy[600] : raColors.sand[300],
        disabled: isLight ? raColors.sand[500] : raColors.sand[600],
      },
      divider: isLight ? raColors.sand[300] : 'rgba(255, 215, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontFamily: '"Bebas Neue", "Inter", sans-serif',
        fontWeight: 700,
        fontSize: '3.5rem',
        lineHeight: 1.1,
        letterSpacing: '0.02em',
        color: isLight ? raColors.navy[900] : raColors.gold[500],
      },
      h2: {
        fontFamily: '"Bebas Neue", "Inter", sans-serif',
        fontWeight: 600,
        fontSize: '2.75rem',
        lineHeight: 1.2,
        letterSpacing: '0.02em',
        color: isLight ? raColors.navy[800] : raColors.gold[400],
      },
      h3: {
        fontFamily: '"Bebas Neue", "Inter", sans-serif',
        fontWeight: 600,
        fontSize: '2.25rem',
        lineHeight: 1.3,
        letterSpacing: '0.01em',
        color: isLight ? raColors.navy[800] : raColors.gold[400],
      },
      h4: {
        fontWeight: 700,
        fontSize: '1.75rem',
        lineHeight: 1.4,
        letterSpacing: '0.01em',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
        letterSpacing: '0.005em',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.5,
        letterSpacing: '0.005em',
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '1.125rem',
        lineHeight: 1.6,
        letterSpacing: '0.00938em',
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.57,
        letterSpacing: '0.00714em',
      },
      body1: {
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: 1.6,
        letterSpacing: '0.00938em',
      },
      body2: {
        fontWeight: 400,
        fontSize: '0.875rem',
        lineHeight: 1.57,
        letterSpacing: '0.01071em',
      },
      button: {
        fontWeight: 600,
        fontSize: '0.875rem',
        lineHeight: 1.43,
        letterSpacing: '0.01071em',
        textTransform: 'none',
      },
      caption: {
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.66,
        letterSpacing: '0.03333em',
      },
      overline: {
        fontWeight: 600,
        fontSize: '0.75rem',
        lineHeight: 2.66,
        letterSpacing: '0.08333em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 16, // Increased for modern look
    },
    spacing: 8,
    shadows: [
      'none',
      `0px 1px 3px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.12), 0px 1px 2px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.24)`,
      `0px 3px 6px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.15), 0px 2px 4px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.12)`,
      `0px 10px 20px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.15), 0px 3px 6px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.10)`,
      `0px 15px 25px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.15), 0px 5px 10px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.05)`,
      `0px 20px 40px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.15)`,
      ...Array(19).fill(`0px 25px 50px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.15)`),
    ],
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#ffffff' : '#1a1a2e',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isLight ? 'rgba(27, 38, 59, 0.08)' : 'rgba(255, 215, 0, 0.12)'}`,
            borderRadius: 20,
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0px 20px 40px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.15)`,
              borderColor: isLight ? raColors.gold[400] : raColors.gold[600],
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '14px 28px',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0px 8px 25px rgba(${isLight ? '27, 38, 59' : '255, 215, 0'}, 0.15)`,
            },
          },
          contained: {
            '&.MuiButton-containedPrimary': {
              background: `linear-gradient(135deg, ${raColors.gold[500]} 0%, ${raColors.gold[600]} 100%)`,
              color: raColors.navy[900],
              '&:hover': {
                background: `linear-gradient(135deg, ${raColors.gold[400]} 0%, ${raColors.gold[500]} 100%)`,
              },
            },
            '&.MuiButton-containedSecondary': {
              background: `linear-gradient(135deg, ${raColors.navy[700]} 0%, ${raColors.navy[800]} 100%)`,
              color: '#ffffff',
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isLight 
              ? `linear-gradient(135deg, ${raColors.gold[500]} 0%, ${raColors.gold[600]} 100%)`
              : `linear-gradient(135deg, ${raColors.navy[800]} 0%, ${raColors.navy[900]} 100%)`,
            backdropFilter: 'blur(20px)',
            borderBottom: 'none',
            boxShadow: `0px 4px 20px rgba(${isLight ? '255, 215, 0' : '27, 38, 59'}, 0.15)`,
            color: isLight ? raColors.navy[900] : raColors.gold[400],
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isLight 
              ? `linear-gradient(180deg, #ffffff 0%, ${raColors.sand[50]} 100%)`
              : `linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)`,
            borderRight: `1px solid ${isLight ? 'rgba(27, 38, 59, 0.08)' : 'rgba(255, 215, 0, 0.12)'}`,
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
          colorPrimary: {
            backgroundColor: raColors.gold[100],
            color: raColors.navy[800],
            '&:hover': {
              backgroundColor: raColors.gold[200],
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.3s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: raColors.gold[400],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: raColors.gold[500],
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
  });
};

export { raColors };
export default createRaTheme;