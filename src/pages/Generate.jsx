import React, { useState, useEffect } from 'react';
// MUI Material imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Slider from '@mui/material/Slider';

// MUI Icons imports
import CopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import TelegramIcon from '@mui/icons-material/Telegram';
import WarningIcon from '@mui/icons-material/Warning';
import IdeaIcon from '@mui/icons-material/EmojiObjects';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import KeyIcon from '@mui/icons-material/Key';
import CelebrationIcon from '@mui/icons-material/Celebration';
import VolumeIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const GenerateKeys = () => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedKeys, setGeneratedKeys] = useState([]);
  const [summary, setSummary] = useState(null);
  const [keysDialogOpen, setKeysDialogOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
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
        setProviders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err.response?.data?.error || 'Failed to load providers data');
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

  const handleGenerate = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    if (count < 1) {
      setError('Count must be at least 1');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        plan_id: selectedPlan,
        count: count.toString()
      };

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/keys/keys/generate`,
        payload,
        { headers }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setGeneratedKeys(response.data.data || []);
        setSummary(response.data.summary || null);
        setKeysDialogOpen(true);
        
        // Announce remaining balance with voice
        if (response.data.summary && response.data.summary.new_balance) {
          speak(`Your remaining balance is ₹${response.data.summary.new_balance}`);
        }
      }
    } catch (err) {
      console.error('Error generating keys:', err);
      const errorMsg = err.response?.data?.error || 'Failed to generate keys';
      setError(errorMsg);
      
      // If it's an access denied error, show a special message
      if (errorMsg.includes('Access denied') || errorMsg.includes('Contact Your Admin')) {
        setError(
          <span>
            {errorMsg} <CelebrationIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom' }} />
          </span>
        );
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKeys = () => {
    const keysText = generatedKeys.map(k => k.key_code).join('\n');
    navigator.clipboard.writeText(keysText)
      .then(() => {
        setSuccess('All keys copied to clipboard! 📋');
        
        // Voice feedback for copy action
        if (voiceEnabled) {
          speak(`${generatedKeys.length} keys copied to clipboard`);
        }
      })
      .catch(err => {
        setError('Failed to copy keys to clipboard');
      });
  };

  const handleCopySingleKey = (key) => {
    navigator.clipboard.writeText(key)
      .then(() => {
        setSuccess('Key copied to clipboard! 📋');
        
        // Voice feedback for copy action
        if (voiceEnabled) {
          speak('Key copied to clipboard');
        }
      })
      .catch(err => {
        setError('Failed to copy key to clipboard');
      });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      const keysText = generatedKeys.map(k => k.key_code).join('\n');
      navigator.share({
        title: 'Generated Keys',
        text: keysText
      })
      .then(() => {
        setSuccess('Keys shared successfully! 📤');
      })
      .catch(err => {
        setError('Failed to share keys');
      });
    } else {
      setError('Web Share API not supported in your browser');
    }
  };

  const handleTelegramShare = () => {
    const keysText = generatedKeys.map(k => k.key_code).join('%0A');
    const telegramUrl = `https://t.me/share/url?url=&text=${encodeURIComponent('Generated Keys:\n')}${keysText}`;
    window.open(telegramUrl, '_blank');
  };

  const getPlansForProvider = () => {
    if (!selectedProvider) return [];
    const provider = providers.find(p => p.id === selectedProvider);
    return provider ? provider.plans : [];
  };

  const handleProviderChange = (e) => {
    setSelectedProvider(e.target.value);
    setSelectedPlan('');
  };

  const selectedPlanData = selectedPlan ? getPlansForProvider().find(p => p.id === selectedPlan) : null;

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
          Generate Keys
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

      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Select a plan and generate keys instantly! 🚀
      </Typography>

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
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {providers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center', 
            backgroundColor: alpha(theme.palette.warning.light, 0.2),
            borderRadius: 1
          }}>
            <AdminIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="warning.dark">
              Oops! No providers available 😢
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              It looks like there are no providers configured yet.
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Please contact your administrator to set up providers and plans before generating keys.
            </Typography>
            <Button 
              variant="contained" 
              color="warning"
              startIcon={<IdeaIcon />}
              onClick={fetchProviders}
            >
              Check Again
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    Select Plan 📋
                  </Typography>
                  
                  <TextField
                    fullWidth
                    select
                    label="Provider"
                    value={selectedProvider}
                    onChange={handleProviderChange}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="">Select a provider</MenuItem>
                    {providers.map(provider => (
                      <MenuItem key={provider.id} value={provider.id}>
                        {provider.name} {provider.status === 'active' ? '✅' : '❌'}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    select
                    label="Plan"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    disabled={!selectedProvider}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="">Select a plan</MenuItem>
                    {getPlansForProvider().map(plan => (
                      <MenuItem key={plan.id} value={plan.id}>
                         {plan.duration} (₹{plan.amount}) 💰
                      </MenuItem>
                    ))}
                  </TextField>

                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>
                      Number of Keys: {count}
                    </Typography>
                    <Slider
                      value={count}
                      onChange={(e, newValue) => setCount(newValue)}
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={1}
                      max={20}
                      sx={{ mt: 2 }}
                    />
               
                  </Box>

                  {selectedPlanData && (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: alpha(theme.palette.info.main, 0.1), 
                      borderRadius: 1,
                      mb: 2 
                    }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Total Cost:</strong> ₹ {(selectedPlanData.amount * count).toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={!selectedPlan || generating}
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    {generating ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Generating... ✨
                      </>
                    ) : (
                      <>
                        Generate Keys 🎉
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    Information ℹ️
                  </Typography>
                  
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: alpha(theme.palette.info.main, 0.1), 
                    borderRadius: 1,
                    mb: 2 
                  }}>
                    <Typography variant="body2" gutterBottom>
                      💡 <strong>Tip:</strong> You can generate up to 20 keys at once.
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      ⚡ <strong>Quick:</strong> Generation is instant and keys are ready to use immediately.
                    </Typography>
                    <Typography variant="body2">
                      🔐 <strong>Secure:</strong> All keys are unique and securely generated.
                    </Typography>
                  </Box>

                  {selectedPlan && (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: alpha(theme.palette.success.main, 0.1), 
                      borderRadius: 1,
                      mb: 2 
                    }}>
                      <Typography variant="body2" gutterBottom>
                        Selected plan: {getPlansForProvider().find(p => p.id === selectedPlan)?.name}
                      </Typography>
                      <Typography variant="body2">
                        Cost per key: ₹{getPlansForProvider().find(p => p.id === selectedPlan)?.amount}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: alpha(theme.palette.warning.main, 0.1), 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2">
                      ⚠️ <strong>Note:</strong> Key generation will fail if you don't have sufficient balance or if  prices aren't set for your account.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

  
        </>
      )}

      {/* Generated Keys Dialog */}
      <Dialog 
        open={keysDialogOpen} 
        onClose={() => setKeysDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <CelebrationIcon sx={{ mr: 1, color: 'success.main' }} />
          Keys Generated Successfully! 🎉
        </DialogTitle>
        <DialogContent>
          {summary && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Provider:</strong> {summary.provider}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Plan:</strong> {summary.plan}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Price per key:</strong> ₹ {summary.price_per_key}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Total cost:</strong> ₹ {summary.total_cost}
              </Typography>
              <Typography variant="body1">
                <strong>New balance:</strong> ₹ {summary.new_balance}
              </Typography>
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">
              Generated Keys ({generatedKeys.length})
            </Typography>
            <Button
              size="small"
              startIcon={<CopyIcon />}
              onClick={handleCopyKeys}
            >
              Copy All
            </Button>
          </Box>

          <Box sx={{ 
            maxHeight: 300, 
            overflow: 'auto', 
            p: 1, 
            backgroundColor: alpha(theme.palette.background.default, 0.5),
            borderRadius: 1,
            mb: 2
          }}>
            {generatedKeys.map((key, index) => (
              <Box 
                key={key.id} 
                sx={{ 
                  mb: 1, 
                  p: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: index % 2 === 0 ? alpha(theme.palette.background.default, 0.3) : 'transparent',
                  borderRadius: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Chip 
                    label={`${index + 1}.`} 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {key.key_code}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopySingleKey(key.key_code)}
                  sx={{ ml: 1 }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleNativeShare}
              disabled={!navigator.share}
            >
              Share
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<TelegramIcon />}
              onClick={handleTelegramShare}
            >
              Telegram
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKeysDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GenerateKeys;