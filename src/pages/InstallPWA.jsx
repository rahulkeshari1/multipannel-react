import React, { useState, useEffect } from 'react';
// MUI Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Hooks
import { useTheme, useMediaQuery } from '@mui/material';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import InstallIcon from '@mui/icons-material/InstallDesktop';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';


// Enhanced version with more props for customization
export default function InstallPWA({
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  autoShowDelay = 3000, // milliseconds before auto-showing
  showManualTrigger = true, // show manual install button
  variant = 'mini-promt' // 'mini-prompt', 'banner', 'dialog-only'
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showMiniPrompt, setShowMiniPrompt] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(ios);

    // Detect if app is already installed in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsInStandaloneMode(standalone);

    // Check if we should show the prompt based on user preference
    const dontShowAgain = localStorage.getItem('pwa-dont-show-again');
    if (dontShowAgain) return;

    // Android PWA install prompt
    function beforeInstallPromptHandler(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show appropriate UI based on variant
      if (variant === 'mini-prompt' && !ios) {
        setTimeout(() => setShowMiniPrompt(true), autoShowDelay);
      } else if (variant === 'banner') {
        setTimeout(() => setShowBanner(true), autoShowDelay);
      }
    }

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowDialog(false);
      setShowMiniPrompt(false);
      setShowBanner(false);
      setSnackbarMessage('App installed successfully!');
      setSnackbarOpen(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      window.removeEventListener('appinstalled', () => {});
    };
  }, [autoShowDelay, variant]);

  const handleInstallClick = () => {
    if (!deferredPrompt) {
      handleOpenDialog();
      return;
    }
    
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setSnackbarMessage('Installation started...');
        setSnackbarOpen(true);
      } else {
        console.log('User dismissed the install prompt');
        setSnackbarMessage('Installation cancelled');
        setSnackbarOpen(true);
      }
      setDeferredPrompt(null);
      setShowMiniPrompt(false);
      setShowBanner(false);
    });
  };

  const handleOpenDialog = () => {
    setShowDialog(true);
    setShowMiniPrompt(false);
    setShowBanner(false);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('pwa-dont-show-again', 'true');
    setShowMiniPrompt(false);
    setShowBanner(false);
    setShowDialog(false);
    setSnackbarMessage("We won't show installation prompts again");
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'top-right':
        return { top: 16, right: 16 };
      case 'top-left':
        return { top: 16, left: 16 };
      default: // bottom-right
        return { bottom: 16, right: 16 };
    }
  };

  // Don't show anything if already installed or in standalone mode
  if (isInstalled || isInStandaloneMode) {
    return null;
  }

  // iOS Installation Steps
  const iosSteps = [
    {
      label: 'Tap the Share button',
      description: 'Open the Safari menu and tap the "Share" icon',
      icon: <ShareIcon />
    },
    {
      label: 'Add to Home Screen',
      description: 'Scroll down and select "Add to Home Screen" from the menu',
      icon: <AddIcon />
    },
    {
      label: 'Confirm and Launch',
      description: 'Tap "Add" in the top right corner, then find the app on your home screen',
      icon: <HomeIcon />
    }
  ];

  // Android Installation Steps
  const androidSteps = [
    {
      label: 'Open Browser Menu',
      description: 'Tap the three-dot menu icon in your browser',
      icon: <MenuIcon />
    },
    {
      label: 'Select Install App',
      description: 'Find and select "Install App" or "Add to Home Screen"',
      icon: <InstallIcon />
    },
    {
      label: 'Confirm Installation',
      description: 'Follow the prompts to complete the installation',
      icon: <CheckCircleIcon />
    }
  ];

  return (
    <>
      {/* Banner Style */}
      {showBanner && variant === 'banner' && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            p: 2,
            borderRadius: 0,
            animation: 'slideDown 0.3s ease-out',
            '@keyframes slideDown': {
              from: { transform: 'translateY(-100%)', opacity: 0 },
              to: { transform: 'translateY(0)', opacity: 1 }
            }
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <DownloadIcon color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Install Our App
                </Typography>
                <Typography variant="body2">
                  Get the best experience with our app
                </Typography>
              </Box>
            </Box>
            <Box>
              <Button 
                size="small" 
                onClick={handleDontShowAgain}
                color="inherit"
                sx={{ mr: 1 }}
              >
                Later
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleInstallClick}
                startIcon={<InstallIcon />}
              >
                Install
              </Button>
              <IconButton 
                size="small" 
                onClick={() => setShowBanner(false)}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Mini Prompt */}
      {showMiniPrompt && variant === 'mini-prompt' && deferredPrompt && !isIos && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            ...getPositionStyles(),
            zIndex: 1000,
            p: 2,
            maxWidth: 350,
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              from: { 
                [position.includes('right') ? 'transform' : '']: 'translateX(100%)',
                [position.includes('left') ? 'transform' : '']: 'translateX(-100%)',
                [position.includes('top') ? 'transform' : '']: 'translateY(-100%)',
                [position.includes('bottom') ? 'transform' : '']: 'translateY(100%)',
                opacity: 0 
              },
              to: { transform: 'translateX(0)', opacity: 1 }
            }
          }}
        >
          <Box display="flex" alignItems="flex-start">
            <Box flexGrow={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Install Our App
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Get a better experience with our app installed on your device
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setShowMiniPrompt(false)}
              sx={{ ml: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Button 
              size="small" 
              onClick={handleDontShowAgain}
              color="inherit"
            >
              Don't show again
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleInstallClick}
              startIcon={<InstallIcon />}
              sx={{ ml: 1 }}
            >
              Install
            </Button>
          </Box>
        </Paper>
      )}

      {/* Manual trigger */}
      {showManualTrigger && !showMiniPrompt && !showBanner && (
        <Button
          variant="outlined"
          size="small"
          onClick={handleOpenDialog}
          sx={{
            position: 'fixed',
            ...getPositionStyles(),
            zIndex: 999,
            bgcolor: 'background.paper'
          }}
        >
          <InstallIcon sx={{ mr: 0.5 }} />
          Install App
        </Button>
      )}

      {/* Installation Dialog */}
      <Dialog 
        open={showDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <InstallIcon sx={{ mr: 1 }} />
            Install App
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <Typography variant="body1" gutterBottom>
              Install our app on your {isIos ? 'iOS' : ''} device for a better experience:
            </Typography>
            <Box display="flex" alignItems="center" mt={1} mb={2} flexWrap="wrap" gap={1}>
              <Chip 
                icon={<InfoIcon />} 
                label="Works offline" 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                icon={<InfoIcon />} 
                label="Faster loading" 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                icon={<InfoIcon />} 
                label="Home screen access" 
                size="small" 
                variant="outlined" 
              />
            </Box>
          </Box>

          {isIos ? (
            <>
              <Stepper orientation="vertical">
                {iosSteps.map((step, index) => (
                  <Step key={step.label} active={true}>
                    <StepLabel StepIconComponent={() => (
                      <Box sx={{ color: 'primary.main' }}>{step.icon}</Box>
                    )}>
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2">{step.description}</Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Note: These steps may vary slightly depending on your iOS version.
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Stepper orientation={isMobile ? "vertical" : "horizontal"}>
                {androidSteps.map((step) => (
                  <Step key={step.label}>
                    <StepLabel StepIconComponent={() => (
                      <Box sx={{ color: 'primary.main' }}>{step.icon}</Box>
                    )}>
                      {isMobile ? step.label : ''}
                    </StepLabel>
                    {isMobile && (
                      <StepContent>
                        <Typography variant="body2">{step.description}</Typography>
                      </StepContent>
                    )}
                  </Step>
                ))}
              </Stepper>
              
              {!isMobile && (
                <Box mt={2}>
                  <List>
                    {androidSteps.map((step, index) => (
                      <ListItem key={step.label}>
                        <ListItemIcon>
                          {step.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={step.label} 
                          secondary={step.description} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDontShowAgain}>Don't show again</Button>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {!isIos && deferredPrompt && (
            <Button 
              onClick={handleInstallClick}
              variant="contained"
              startIcon={<InstallIcon />}
            >
              Install Now
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}