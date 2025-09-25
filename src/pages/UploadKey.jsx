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
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// MUI Icons imports
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PasteIcon from '@mui/icons-material/ContentPaste';
import PasteGoIcon from '@mui/icons-material/ContentPasteGo';
import InfoIcon from '@mui/icons-material/Info';



import FileUploadIcon from '@mui/icons-material/FileUpload';
import { motion } from 'framer-motion';
import axios from 'axios';

const UploadKey = () => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [keyText, setKeyText] = useState('');
  const [parsedKeys, setParsedKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
        `${import.meta.env.VITE_APP_BASE_URL}/keys/providers-plans`,
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setKeyText(text);
      parseKeys(text);
    } catch (err) {
      setError('Failed to read from clipboard');
    }
  };

  const parseKeys = (text) => {
    if (!text.trim()) {
      setParsedKeys([]);
      return;
    }

    // Split by commas, new lines, or spaces
    const keysArray = text.split(/[\n, ]+/).filter(key => key.trim() !== '');
    setParsedKeys(keysArray);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setKeyText(text);
    parseKeys(text);
  };

  const handleUpload = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    if (parsedKeys.length === 0) {
      setError('No valid keys to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        plan_id: selectedPlan,
        keys_data: parsedKeys.map(key => ({ key_code: key }))
      };

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/keys/keys/multiple`,
        payload,
        { headers }
      );

      if (response.data.success) {
        setSuccess(`Successfully uploaded ${parsedKeys.length} keys`);
        setKeyText('');
        setParsedKeys([]);
        setSelectedPlan('');
        setSelectedProvider('');
      }
    } catch (err) {
      console.error('Error uploading keys:', err);
      setError(err.response?.data?.error || 'Failed to upload keys');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setKeyText('');
    setParsedKeys([]);
    setError('');
    setSuccess('');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 4}
    sx={{
        marginBottom:'80px'
    }}
    >

        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <FileUploadIcon sx={{ mr: 1 }} />
                         Keys
              </Typography>

   
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Paste keys below to upload them to the system. Keys can be separated by commas, spaces, or new lines.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 1 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Plan
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
                    {provider.name}
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
              >
                <MenuItem value="">Select a plan</MenuItem>
                {getPlansForProvider().map(plan => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} - {plan.duration} (₹{plan.amount})
                  </MenuItem>
                ))}
              </TextField>

              {selectedPlan && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                  <Typography variant="body2">
                    Selected plan: {getPlansForProvider().find(p => p.id === selectedPlan)?.name}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Keys Input
                </Typography>
                <Box>
                  <Tooltip title="Paste from clipboard">
                    <IconButton onClick={handlePaste} color="primary">
                      <PasteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Clear all">
                    <IconButton onClick={handleClear} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Paste keys here separated by commas, spaces, or new lines"
                value={keyText}
                onChange={handleTextChange}
                sx={{ mb: 2 }}
              />

              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  {parsedKeys.length} key{parsedKeys.length !== 1 ? 's' : ''} detected
                </Typography>
                
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!selectedPlan || parsedKeys.length === 0 || uploading}
                  startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                  sx={{ minWidth: isMobile ? '100%' : 'auto', mt: isMobile ? 1 : 0 }}
                >
                  {uploading ? 'Uploading...' : 'Upload Keys'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {parsedKeys.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper sx={{ mt: 3, p: 2, borderRadius: 1, boxShadow: theme.shadows[2] }}>
            <Typography variant="h6" gutterBottom>
              Parsed Keys Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              These are the keys that will be uploaded:
            </Typography>
            
            <Box 
              sx={{ 
                p: 2, 
                mt: 2, 
                backgroundColor: alpha(theme.palette.background.default, 0.7),
                borderRadius: 1,
                maxHeight: 200,
                overflow: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5
              }}
            >
              {parsedKeys.map((key, index) => (
                <Chip
                  key={index}
                  label={key}
                  size="small"
                  onDelete={() => {
                    const newKeys = [...parsedKeys];
                    newKeys.splice(index, 1);
                    setParsedKeys(newKeys);
                    setKeyText(newKeys.join('\n'));
                  }}
                />
              ))}
            </Box>
          </Paper>
        </motion.div>
      )}

      <Paper sx={{ mt: 3, p: 3, borderRadius: 1, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
        <Box display="flex" alignItems="center" mb={1}>
          <InfoIcon color="info" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Instructions
          </Typography>
        </Box>
        <Typography variant="body2">
          1. Select a provider and plan from the dropdown menus<br />
          2. Paste your keys into the text area (separated by commas, spaces, or new lines)<br />
          3. Review the parsed keys preview<br />
          4. Click "Upload Keys" to submit
        </Typography>
      </Paper>
    </Box>
  );
};

export default UploadKey;