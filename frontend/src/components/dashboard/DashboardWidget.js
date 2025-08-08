import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import { DragIndicator, Close, Fullscreen } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DashboardWidget = ({ 
  id, 
  title, 
  children, 
  onRemove, 
  onExpand,
  isDragging = false,
  height = 'auto',
  minHeight = 200
}) => {
  const theme = useTheme();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || sortableIsDragging;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: isCurrentlyDragging ? 1.05 : 1,
        zIndex: isCurrentlyDragging ? 10 : 1
      }}
      transition={{ 
        duration: 0.3,
        ease: 'easeOut'
      }}
      whileHover={{ y: -2 }}
    >
      <Card
        sx={{
          height,
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          cursor: isCurrentlyDragging ? 'grabbing' : 'default',
          transform: isCurrentlyDragging ? 'rotate(2deg)' : 'none',
          boxShadow: isCurrentlyDragging 
            ? `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`
            : undefined,
          border: isCurrentlyDragging 
            ? `2px solid ${theme.palette.primary.main}`
            : undefined,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '16px 16px 0 0',
            opacity: isCurrentlyDragging ? 1 : 0.7,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            '&::before': {
              opacity: 1,
            },
            '& .widget-controls': {
              opacity: 1,
            }
          }
        }}
      >
        <CardHeader
          title={title}
          sx={{
            pb: 1,
            pt: 2,
            '& .MuiCardHeader-title': {
              fontSize: '1.1rem',
              fontWeight: 600,
              color: theme.palette.text.primary,
            }
          }}
          action={
            <Box 
              className="widget-controls"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              <IconButton
                size="small"
                onClick={onExpand}
                sx={{ 
                  mr: 0.5,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Fullscreen fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onRemove(id)}
                sx={{ 
                  mr: 0.5,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.1)
                  }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                {...attributes}
                {...listeners}
                sx={{ 
                  cursor: 'grab',
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  }
                }}
              >
                <DragIndicator fontSize="small" />
              </IconButton>
            </Box>
          }
        />
        
        <CardContent sx={{ 
          flex: 1, 
          pt: 0,
          pb: '16px !important',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {children}
          </Box>
        </CardContent>
        
        {/* Drag overlay */}
        {isCurrentlyDragging && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default DashboardWidget;