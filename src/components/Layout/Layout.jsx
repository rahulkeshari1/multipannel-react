import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';

// Lazy load heavy components
const Sidebar = React.lazy(() => import('./Sidebar'));
const BottomNav = React.lazy(() => import('./BottomNav'));

// Define the constants here so they're available to both components
const drawerWidth = 280;
const collapsedDrawerWidth = 70;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Memoize the main content area to prevent unnecessary re-renders
  const mainContent = useMemo(() => (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        width: { 
          md: sidebarCollapsed 
            ? `calc(100% - ${collapsedDrawerWidth}px)` 
            : `calc(100% - ${drawerWidth}px)` 
        },
        ml: { 
          md: sidebarCollapsed 
            ? `${collapsedDrawerWidth}px` 
            : `${drawerWidth}px` 
        },
        mb: { xs: 7, md: 0 },
        p: { xs: 2, sm: 3 },
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      {children}
    </Box>
  ), [sidebarCollapsed, children, theme]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: theme.palette.gradients.background,
    }}>
      <React.Suspense fallback={<div>Loading navigation...</div>}>
        <Sidebar 
          mobileOpen={mobileOpen} 
          handleDrawerToggle={handleDrawerToggle}
          onNavigation={handleNavigation}
          currentPath={location.pathname}
          onCollapse={handleSidebarCollapse}
          drawerWidth={drawerWidth}
          collapsedDrawerWidth={collapsedDrawerWidth}
        />
      </React.Suspense>

      {mainContent}

      {isMobile && (
        <React.Suspense fallback={null}>
          <BottomNav 
            onNavigation={handleNavigation} 
            onMenuClick={handleDrawerToggle}
            currentPath={location.pathname}
          />
        </React.Suspense>
      )}
    </Box>
  );
};

export default React.memo(Layout);