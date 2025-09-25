import React, { useState, useEffect } from 'react';
// MUI Material imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// MUI Icons imports
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import UploadIcon from '@mui/icons-material/CloudUpload';



import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ProviderPlans = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [expandedProviders, setExpandedProviders] = useState({});
  const [formData, setFormData] = useState({
    provider: {
      name: '',
      status: 'active'
    },
    plans: [
      {
        name: '',
        duration: '',
        amount: '',
        cost_price: ''
      }
    ]
  });
  const [plansToDelete, setPlansToDelete] = useState([]);
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
        // Initialize expanded state for each provider
        const expandedState = {};
        response.data.data.forEach(provider => {
          expandedState[provider.id] = false;
        });
        setExpandedProviders(expandedState);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err.response?.data?.error || 'Failed to load providers data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (providerId) => {
    setExpandedProviders(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const handleOpenDialog = (provider = null) => {
    if (provider) {
      // Editing existing provider
      setEditingProvider(provider);
      setFormData({
        provider: {
          name: provider.name,
          status: provider.status
        },
        plans: provider.plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          duration: plan.duration,
          amount: plan.amount,
          cost_price: plan.cost_price || ''
        }))
      });
    } else {
      // Creating new provider
      setEditingProvider(null);
      setFormData({
        provider: {
          name: '',
          status: 'active'
        },
        plans: [
          {
            name: '',
            duration: '',
            amount: '',
            cost_price: ''
          }
        ]
      });
    }
    setPlansToDelete([]);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProvider(null);
    setError('');
    setSuccess('');
  };

  const handleProviderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      provider: {
        ...prev.provider,
        [field]: value
      }
    }));
  };

  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...formData.plans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      plans: updatedPlans
    }));
  };

  const addNewPlan = () => {
    setFormData(prev => ({
      ...prev,
      plans: [
        ...prev.plans,
        {
          name: '',
          duration: '',
          amount: '',
          cost_price: ''
        }
      ]
    }));
  };

  const removePlan = (index, planId = null) => {
    if (planId) {
      // Mark plan for deletion when saving
      setPlansToDelete(prev => [...prev, planId]);
    }
    
    const updatedPlans = [...formData.plans];
    updatedPlans.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      plans: updatedPlans
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        provider: formData.provider,
        plans: formData.plans
      };

      // Add plans_to_delete if we're editing and there are plans to remove
      if (editingProvider && plansToDelete.length > 0) {
        payload.plans_to_delete = plansToDelete;
      }

      let response;
      if (editingProvider) {
        // Update existing provider
        response = await axios.put(
          `${import.meta.env.VITE_APP_BASE_URL}/keys/provider-with-plans/${editingProvider.id}`,
          payload,
          { headers }
        );
      } else {
        // Create new provider
        response = await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/keys/provider-with-plans`,
          payload,
          { headers }
        );
      }

      if (response.data.success) {
        setSuccess(response.data.message || (editingProvider ? 'Provider updated successfully!' : 'Provider created successfully!'));
        fetchProviders(); // Refresh the list
        setTimeout(() => {
          handleCloseDialog();
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving provider:', err);
      setError(err.response?.data?.error || `Failed to ${editingProvider ? 'update' : 'create'} provider`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => status === 'active' ? 'success' : 'error';

  const getStatusIcon = (status) => {
    return status === 'active' ? <VisibilityIcon /> : <VisibilityOffIcon />;
  };

  if (loading && providers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      p: isMobile ? 0 : 4,
      boxSizing: 'border-box'
    }}>
      <Box sx={{ 
        p: isMobile ? 2 : 0,
        mb: 3,
        width: '100%'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add New Provider
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, mt: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
      </Box>

      <Grid container spacing={2} sx={{ 
        width: '100%', 
        m: 0,
        p: isMobile ? 1 : 0
      }}>
        {providers.map(provider => (
          <Grid key={provider.id} size={{ xs: 12 }} sx={{ p: isMobile ? 1 : 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <Card 
                sx={{ 
                  width: '100%',
                  borderRadius: 1,
                  overflow: 'hidden',
                  boxShadow: theme.shadows[3],
                  '&:hover': {
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between"
                    p={2}
                    sx={{ 
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      cursor: 'pointer'
                    }}
                    onClick={() => handleToggleExpand(provider.id)}
                  >
                    <Box display="flex" alignItems="center">
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {provider.name}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <Chip
                            icon={getStatusIcon(provider.status)}
                            label={provider.status.toUpperCase()}
                            color={getStatusColor(provider.status)}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary" ml={1}>
                            {provider.plans.length} plan{provider.plans.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(provider);
                        }}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      {expandedProviders[provider.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                  </Box>

                  <Collapse in={expandedProviders[provider.id]}>
                    <TableContainer>
                      <Table sx={{ minWidth: isMobile ? '100%' : 650 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Plan Name</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell align="right">Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {provider.plans.map(plan => (
                            <TableRow key={plan.id}>
                              <TableCell>
                                <Typography fontWeight="medium">
                                  {plan.name}
                                </Typography>
                              </TableCell>
                              <TableCell>{plan.duration}</TableCell>
                              <TableCell align="right">
                                <Typography fontWeight="bold" color="primary.main">
                                  
                                    ₹{parseFloat(plan.amount).toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Collapse>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {providers.length === 0 && !loading && (
        <Paper 
          sx={{ 
            width: '100%',
            p: 4, 
            textAlign: 'center',
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.background.default, 0.7),
            boxSizing: 'border-box'
          }}
        >
          <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="text.secondary">
            No Providers Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Get started by adding your first provider and plans.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add New Provider
          </Button>
        </Paper>
      )}

      {/* Add/Edit Provider Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            m: 0
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" component="div" fontWeight="bold">
            {editingProvider ? 'Edit Provider' : 'Add New Provider'}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Typography variant="h6" gutterBottom>
              Provider Details
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Provider Name"
                  value={formData.provider.name}
                  onChange={(e) => handleProviderChange('name', e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.provider.status}
                  onChange={(e) => handleProviderChange('status', e.target.value)}
                  required
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="div">
                Plans
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addNewPlan}
                variant="outlined"
                size="small"
              >
                Add Plan
              </Button>
            </Box>

            {formData.plans.map((plan, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                {formData.plans.length > 1 && (
                <IconButton
  size="small"
  sx={{
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1000,
  }}
  onClick={() => removePlan(index, plan.id)}
>
  <DeleteIcon fontSize="small" />
</IconButton>

                )}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      label="Plan Name"
                      value={plan.name}
                      onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Duration"
                      value={plan.duration}
                      onChange={(e) => handlePlanChange(index, 'duration', e.target.value)}
                      required
                      placeholder="e.g., 30 days"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={plan.amount}
                      onChange={(e) => handlePlanChange(index, 'amount', e.target.value)}
                      required
                      inputProps={{ step: "0.01", min: "0" }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (editingProvider ? 'Update Provider' : 'Create Provider')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add provider"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default ProviderPlans;