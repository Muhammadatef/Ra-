import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const KPIWidget = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  prefix = '',
  suffix = '',
  subtitle = '',
  icon: Icon
}) => {
  const theme = useTheme();
  
  const isPositive = changeType === 'positive';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60%',
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          borderRadius: '50% 0 0 50%',
        }}
      />
      
      {/* Icon */}
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: alpha(theme.palette.primary.main, 0.6),
            }}
          >
            <Icon sx={{ fontSize: '2rem' }} />
          </Box>
        </motion.div>
      )}
      
      <Box sx={{ zIndex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            mb: 1,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
              lineHeight: 1.2,
            }}
          >
            {prefix}{formatValue(value)}{suffix}
          </Typography>
        </motion.div>
        
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 1,
            }}
          >
            {subtitle}
          </Typography>
        )}
        
        {change !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: isPositive ? 'success.main' : 'error.main',
              }}
            >
              <TrendIcon sx={{ fontSize: '1rem' }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {Math.abs(change)}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  ml: 0.5,
                }}
              >
                vs last period
              </Typography>
            </Box>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default KPIWidget;