import React, { useState, useEffect, lazy, Suspense } from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// Lazy load icons
const HomeIcon = lazy(() => import('@mui/icons-material/Home'));
const SearchIcon = lazy(()=> import('@mui/icons-material/Search'));
const GenerateKeysIcon = lazy(() => import('@mui/icons-material/Key'));
const MenuIcon = lazy(() => import('@mui/icons-material/Menu'));

// Simple icon placeholder
const IconPlaceholder = () => (
  <div style={{ width: 24, height: 24, backgroundColor: '#ccc', borderRadius: 4 }} />
);

const BottomNav = ({ onNavigation, onMenuClick, currentPath }) => {
  const [value, setValue] = useState(0);
  const theme = useTheme();

  const navigationItems = [
    { label: 'Home', icon: <Suspense fallback={<IconPlaceholder />}><HomeIcon /></Suspense>, path: '/dashboard' },
    { label: 'Keys', icon: <Suspense fallback={<IconPlaceholder />}><SearchIcon /></Suspense>, path: '/keys' },
    { label: 'Generate', icon: <Suspense fallback={<IconPlaceholder />}><GenerateKeysIcon /></Suspense>, path: '/generate-keys' },
    { label: 'Menu', icon: <Suspense fallback={<IconPlaceholder />}><MenuIcon /></Suspense>, action: 'menu' },
  ];

  useEffect(() => {
    const paths = ['/dashboard', '/keys', '/generate-keys'];
    const index = paths.findIndex(path => currentPath.startsWith(path));
    if (index !== -1) {
      setValue(index);
    }
  }, [currentPath]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    
    const item = navigationItems[newValue];
    if (item.action === 'menu') {
      onMenuClick();
    } else {
      onNavigation(item.path);
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', md: 'none' },
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        background: theme.palette.background.glass,
        borderTop: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.appBar,
        borderRadius: 0, 
      }}
      elevation={0}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{
          backgroundColor: 'transparent',
          height: 70,
          '& .MuiBottomNavigationAction-root': {
            color: theme.palette.text.secondary,
            minWidth: 'auto',
            padding: '8px 0',
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              transform: 'translateY(-5px)',
            },
          },
        }}
      >
        {navigationItems.map((item, index) => (
          <BottomNavigationAction 
            key={index}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {item.icon}
                {/* Active indicator dot */}
                {value === index && (
                  <Box 
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      mt: 0.5,
                    }}
                  />
                )}
              </Box>
            } 
            icon={null} // We moved the icon to the label to include the dot
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                opacity: 1,
                mt: 0.5,
                '&.Mui-selected': {
                  fontSize: '0.75rem',
                },
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default React.memo(BottomNav);