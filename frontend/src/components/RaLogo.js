import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

// Modern Egyptian Ra Symbol with Eye of Horus
const RaSymbol = ({ size: iconSize, animated = true }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  
  return (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: animated ? 'raGlow 4s ease-in-out infinite' : 'none',
      }}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFB400" />
          <stop offset="100%" stopColor="#e69500" />
        </linearGradient>
        <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#FFB400" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#e69500" stopOpacity="0.5" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer Sun Rays */}
      <g className="outer-rays" transform="translate(60,60)">
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const x1 = Math.cos(angle) * 42;
          const y1 = Math.sin(angle) * 42;
          const x2 = Math.cos(angle) * 52;
          const y2 = Math.sin(angle) * 52;
          return (
            <line
              key={`outer-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#sunGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />
          );
        })}
      </g>

      {/* Inner Sun Rays */}
      <g className="inner-rays" transform="translate(60,60)">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 + 15) * Math.PI / 180;
          const x1 = Math.cos(angle) * 32;
          const y1 = Math.sin(angle) * 32;
          const x2 = Math.cos(angle) * 38;
          const y2 = Math.sin(angle) * 38;
          return (
            <line
              key={`inner-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#sunGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          );
        })}
      </g>
      
      {/* Main Sun Circle */}
      <circle
        cx="60"
        cy="60"
        r="28"
        fill="url(#centerGradient)"
        stroke="url(#sunGradient)"
        strokeWidth="2"
        filter="url(#glow)"
      />
      
      {/* Eye of Horus/Ra */}
      <g className="eye-of-ra" transform="translate(60,60)">
        {/* Eye Shape */}
        <path
          d="M-16,-3 Q-12,-8 0,-4 Q12,-8 16,-3 Q12,2 0,0 Q-12,2 -16,-3 Z"
          fill={isLight ? '#1B263B' : '#FFD700'}
          opacity="0.9"
        />
        
        {/* Pupil */}
        <ellipse
          cx="0"
          cy="-2"
          rx="6"
          ry="4"
          fill={isLight ? '#FFD700' : '#1B263B'}
        />
        
        {/* Eye Details - Traditional Egyptian styling */}
        <path
          d="M-16,-3 Q-8,-1 16,-3"
          stroke={isLight ? '#1B263B' : '#FFD700'}
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Tear mark below eye */}
        <path
          d="M8,2 Q10,8 6,12 Q4,8 8,2"
          fill={isLight ? '#1B263B' : '#FFD700'}
          opacity="0.7"
        />
        
        {/* Eyebrow mark above */}
        <path
          d="M-12,-8 Q0,-12 12,-8"
          stroke={isLight ? '#1B263B' : '#FFD700'}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <style jsx={true}>{`
        @keyframes raGlow {
          0%, 100% { 
            filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.3));
          }
          50% { 
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
          }
        }
      `}</style>
    </svg>
  );
};

const RaLogo = ({ 
  size = 'medium', 
  variant = 'full', 
  animated = true,
  textColor,
  iconColor 
}) => {
  const theme = useTheme();
  
  const sizes = {
    small: { icon: 32, text: '1.25rem', spacing: 1.5 },
    medium: { icon: 48, text: '1.75rem', spacing: 2 },
    large: { icon: 64, text: '2.5rem', spacing: 2.5 },
    xlarge: { icon: 80, text: '3.5rem', spacing: 3 },
  };

  const currentSize = sizes[size] || sizes.medium;
  
  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: currentSize.spacing,
    userSelect: 'none',
  };

  const textStyles = {
    fontSize: currentSize.text,
    fontWeight: 700,
    fontFamily: '"Bebas Neue", sans-serif',
    background: textColor || (theme.palette.mode === 'light' 
      ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`),
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.05em',
    lineHeight: 1,
  };

  const subTextStyles = {
    fontSize: `calc(${currentSize.text} * 0.35)`,
    fontWeight: 500,
    color: theme.palette.text.secondary,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginTop: '2px',
    fontFamily: '"Inter", sans-serif',
  };

  const compactTextStyles = {
    fontSize: currentSize.text,
    fontWeight: 700,
    fontFamily: '"Bebas Neue", sans-serif',
    background: textColor || (theme.palette.mode === 'light' 
      ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`),
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.08em',
    lineHeight: 1,
  };

  return (
    <Box sx={logoStyles}>
      <RaSymbol size={currentSize.icon} animated={animated} />
      
      {variant === 'full' && (
        <Box>
          <Typography sx={textStyles}>
            RA
          </Typography>
          <Typography sx={subTextStyles}>
            Analytics
          </Typography>
        </Box>
      )}
      
      {variant === 'text-only' && (
        <Typography sx={compactTextStyles}>
          RA Analytics
        </Typography>
      )}
      
      {variant === 'compact' && (
        <Typography sx={compactTextStyles}>
          RA
        </Typography>
      )}
    </Box>
  );
};

export default RaLogo;