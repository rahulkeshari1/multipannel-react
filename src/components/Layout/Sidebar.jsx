import React, { useState, lazy, Suspense } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';

const HomeIcon = lazy(() => import('@mui/icons-material/Home'));
const SearchIcon = lazy(()=> import('@mui/icons-material/Search'));
const GenerateKeysIcon = lazy(() => import('@mui/icons-material/Key'));
const TransactionsIcon = lazy(() => import('@mui/icons-material/AccountBalanceWallet'));
const SettingsIcon = lazy(() => import('@mui/icons-material/Settings'));
const LogoutIcon = lazy(() => import('@mui/icons-material/ExitToApp'));
const CloseIcon = lazy(() => import('@mui/icons-material/Close'));
const CollapseIcon = lazy(() => import('@mui/icons-material/ChevronLeft'));
const ExpandMoreIcon = lazy(() => import('@mui/icons-material/ExpandMore'));
const RestartAltIcon = lazy(()=> import('@mui/icons-material/RestartAlt')) ;

import { useAuth } from '../../context/AuthContext';

const IconPlaceholder = () => (
  <div style={{ width: 24, height: 24, backgroundColor: '#ccc', borderRadius: 4 }} />
);

const Sidebar = ({ 
  mobileOpen, 
  handleDrawerToggle, 
  onNavigation, 
  currentPath, 
  onCollapse,
  drawerWidth = 280,
  collapsedDrawerWidth = 70 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = React.useState(false);
  const [managementOpen, setManagementOpen] = React.useState(false);

  const { logout, user } = useAuth();

  const menuItems = [
    { text: 'Home', icon: <Suspense fallback={<IconPlaceholder />}><HomeIcon /></Suspense>, path: '/dashboard' },
    { text: 'My Keys', icon: <Suspense fallback={<IconPlaceholder />}><SearchIcon /></Suspense>, path: '/keys' },
    { text: 'Generate Keys', icon: <Suspense fallback={<IconPlaceholder />}><GenerateKeysIcon /></Suspense>, path: '/generate-keys' },
    { text: 'Transactions', icon: <Suspense fallback={<IconPlaceholder />}><TransactionsIcon /></Suspense>, path: '/transactions' },
    { text: 'Reset Key', icon: <Suspense fallback={<IconPlaceholder />}><RestartAltIcon /></Suspense>, path: '/reset-key' },

    
  ];

  // Define management items based on user role - lazy load this logic
  const getManagementItems = () => {
    if (!user) return [];
    
    switch(user.role) {
      case 'owner':
        return [
          { text: 'Users', path: '/users' },
          { text: 'Upload Key', path: '/upload-keys' },
          { text: 'Providers & Plans', path: '/provider-plans' },
          { text: 'Unsold Keys', path: '/unsold-keys' },
           {text:'Bonus List', path:'/bonus-list'},
           {text:'Create Referral', path:'/create-ref'},
          { text: 'Change Password', path: '/change-password' },
          
        ];
      case 'admin':
        return [
          { text: 'Users', path: '/users' },
          { text: 'My Bonus', path: '/my-bonus' },
              {text:'Create Referral', path:'/create-ref'},


          { text: 'Change Password', path: '/change-password' },
        ];
      case 'reseller':
        return [
          { text: 'Change Password', path: '/change-password' },
        ];
      default:
        return [
          { text: 'Change Password', path: '/change-password' },
        ];
    }
  };

  const managementItems = getManagementItems();
  const showManagementSection = managementItems.length > 0;

  const isSelected = (path) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const toggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onCollapse) {
      onCollapse(newCollapsedState);
    }
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      background: theme.palette.background.glass,
      borderRight: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[8],
    }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              background: theme.palette.gradients.primary,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CHEATS
          </Typography>
        )}
        <Box>
          {!isMobile && (
            <IconButton
              onClick={toggleCollapse}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                background: theme.palette.background.highlight,
                '&:hover': {
                  background: theme.palette.background.glass,
                }
              }}
            >
              <Suspense fallback={<IconPlaceholder />}>
                <CollapseIcon />
              </Suspense>
            </IconButton>
          )}
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: theme.palette.text.secondary,
                background: theme.palette.background.highlight,
                '&:hover': {
                  background: theme.palette.background.glass,
                }
              }}
            >
              <Suspense fallback={<IconPlaceholder />}>
                <CloseIcon />
              </Suspense>
            </IconButton>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ backgroundColor: theme.palette.divider, opacity: 0.2 }} />
      
      {/* User Profile - Only show if user data exists */}
      {!collapsed && user && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              background: theme.palette.gradients.primary 
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {user.email || ''}
            </Typography>
            <Typography variant="caption" sx={{ 
              display: 'block', 
              color: theme.palette.primary.main,
              textTransform: 'capitalize'
            }}>
              {user.role || 'user'}
            </Typography>
          </Box>
        </Box>
      )}
      
      {/* Navigation Items */}
      <List sx={{ p: 1, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <Tooltip title={collapsed ? item.text : ''} placement="right" key={item.text}>
            <ListItem
              selected={isSelected(item.path)}
              onClick={() => onNavigation(item.path)}
              sx={{
                borderRadius: theme.shape.borderRadius,
                margin: '4px 0',
                padding: collapsed ? '12px 16px' : '12px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&.Mui-selected': {
                  background: theme.palette.gradients.primary,
                  color: theme.palette.text.primary,
                  boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
                  '&:hover': {
                    background: theme.palette.gradients.primary,
                    opacity: 0.9,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.text.primary,
                  }
                },
                '&:hover': {
                  background: theme.palette.background.highlight,
                },
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
              }}
            >
              <ListItemIcon sx={{ 
                color: isSelected(item.path) 
                  ? theme.palette.text.primary 
                  : theme.palette.text.secondary,
                minWidth: collapsed ? 'auto' : '56px',
                justifyContent: 'center'
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    color: isSelected(item.path) 
                      ? theme.palette.text.primary 
                      : theme.palette.text.secondary
                  }} 
                />
              )}
            </ListItem>
          </Tooltip>
        ))}

        {/* Management Section - Conditionally rendered based on user role */}
        {showManagementSection && (
          <>
            <Tooltip title={collapsed ? 'Management' : ''} placement="right">
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setManagementOpen(!managementOpen)}
                  sx={{
                    borderRadius: theme.shape.borderRadius,
                    margin: '4px 0',
                    padding: collapsed ? '12px 16px' : '12px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    '&:hover': {
                      background: theme.palette.background.highlight,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: theme.palette.text.secondary,
                    minWidth: collapsed ? 'auto' : '56px',
                    justifyContent: 'center'
                  }}>
                    <Suspense fallback={<IconPlaceholder />}>
                      <SettingsIcon />
                    </Suspense>
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText 
                      primary="Management" 
                      sx={{ color: theme.palette.text.secondary }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>

            {/* Submenu Items */}
            <Collapse in={managementOpen && !collapsed} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {managementItems.map((item) => (
                  <ListItem
                    key={item.text}
                    onClick={() => onNavigation(item.path)}
                    selected={isSelected(item.path)}
                    sx={{
                      pl: 4,
                      py: 1,
                      borderRadius: theme.shape.borderRadius,
                      '&.Mui-selected': {
                        background: theme.palette.gradients.primary,
                        color: theme.palette.text.primary,
                        '& .MuiListItemIcon-root': {
                          color: theme.palette.text.primary,
                        },
                      },
                      '&:hover': {
                        background: theme.palette.background.highlight,
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: isSelected(item.path)
                        ? theme.palette.text.primary
                        : theme.palette.text.secondary,
                      minWidth: '40px',
                    }}>
                      <Suspense fallback={<IconPlaceholder />}>
                        <ExpandMoreIcon sx={{ transform: 'rotate(-90deg)' }} />
                      </Suspense>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      sx={{ 
                        color: isSelected(item.path)
                          ? theme.palette.text.primary
                          : theme.palette.text.secondary,
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </List>

      
      {/* Logout Section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ backgroundColor: theme.palette.divider, opacity: 0.2, mb: 2 }} />
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
          <ListItem
            onClick={logout}
            sx={{
              borderRadius: theme.shape.borderRadius,
              background: theme.palette.background.highlight,
              color: theme.palette.text.primary,
              cursor: 'pointer',
              padding: collapsed ? '12px 16px' : '12px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                background: theme.palette.background.glass,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon sx={{ 
              color: theme.palette.text.primary,
              minWidth: collapsed ? 'auto' : '56px',
              justifyContent: 'center'
            }}>
              <Suspense fallback={<IconPlaceholder />}>
                <LogoutIcon />
              </Suspense>
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logout" />}
          </ListItem>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              zIndex: theme.zIndex.drawer + 1,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: collapsed ? collapsedDrawerWidth : drawerWidth,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            '& .MuiDrawer-paper': {
              width: collapsed ? collapsedDrawerWidth : drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
              top: 0,
              height: '100%',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default React.memo(Sidebar);