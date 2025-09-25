import React, { useState, useEffect } from 'react';
// MUI Material imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';

// MUI Icons imports
import VolumeIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import KeyIcon from '@mui/icons-material/Key';
import ResetIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import SuccessIcon from '@mui/icons-material/CheckCircle';

import axios from 'axios';

const ResetKey = () => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [keyCode, setKeyCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/keys/available-providers`,
        { headers }
      );

      if (response.data.success) {
        // Filter to only show "Win iOS" provider
        const winIosProvider = response.data.data.find(
          provider => provider.name.toLowerCase().includes('win') && 
                      provider.name.toLowerCase().includes('ios')
        );
        
        if (winIosProvider) {
          setProviders([winIosProvider]);
          setSelectedProvider(winIosProvider.id);
        } else {
          setProviders(response.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err.response?.data?.error || 'Failed to load providers data');
      showSnackbar(err.response?.data?.error || 'Failed to load providers data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (!voiceEnabled) return;
    
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance();
      speech.text = text;
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      
      window.speechSynthesis.speak(speech);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleReset = async () => {
    if (!keyCode.trim()) {
      setError('Please enter a key code');
      showSnackbar('Please enter a key code', 'error');
      return;
    }

    try {
      setResetting(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        key_code: keyCode.trim()
      };

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/reset/win-key`,
        payload,
        { headers }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        showSnackbar(response.data.message, 'success');
        setKeyCode('');
        
        // Voice feedback
        if (voiceEnabled) {
          speak(`Key reset successfully. Reset at ${new Date(response.data.data.reset_at).toLocaleTimeString()}`);
        }
      }
    } catch (err) {
      console.error('Error resetting key:', err);
      const errorMsg = err.response?.data?.error || 'Failed to reset key';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
      
      // Voice feedback for error
      if (voiceEnabled) {
        speak('Failed to reset key. Please check the key code and try again.');
      }
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading providers... 🔄
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 4} sx={{ marginBottom: '80px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
          <KeyIcon sx={{ mr: 1 }} />
          Reset Key
        </Typography>
        
        <Tooltip title={voiceEnabled ? "Voice feedback enabled" : "Voice feedback disabled"}>
          <IconButton 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            color={voiceEnabled ? "primary" : "default"}
          >
            {voiceEnabled ? <VolumeIcon /> : <VolumeOffIcon />}
          </IconButton>
        </Tooltip>
      </Box>

    

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setError('')}
          icon={<WarningIcon fontSize="inherit" />}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')} icon={<SuccessIcon fontSize="inherit" />}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{xs:12, md:6,}} >
          <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Reset Key  🔧
              </Typography>
              
              <TextField
                fullWidth
                select
                label="Provider"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                sx={{ mb: 2 }}
                disabled={providers.length === 1}
              >
                {providers.map(provider => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.name} {provider.status === 'active' ? '✅' : '❌'}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Key Code"
                value={keyCode}
                onChange={(e) => setKeyCode(e.target.value)}
                placeholder="Enter key code to reset"
                sx={{ mb: 3 }}
                multiline
                rows={2}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleReset}
                disabled={resetting || !keyCode.trim()}
                size="large"
                sx={{ py: 1.5 }}
                startIcon={resetting ? <CircularProgress size={20} /> : <ResetIcon />}
              >
                {resetting ? 'Resetting...' : 'Reset Key'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetKey;