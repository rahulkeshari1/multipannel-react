import React, { useState, useEffect } from 'react';
// MUI Material imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

// MUI Icons imports
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import BalanceIcon from '@mui/icons-material/AccountBalanceWallet';
import CartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';



import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [providers, setProviders] = useState([]);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [userEditDialogOpen, setUserEditDialogOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeDescription, setRechargeDescription] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [processing, setProcessing] = useState(false);
  const [userStatus, setUserStatus] = useState('');
  const [userRole, setUserRole] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    fetchCurrentUser();
    fetchUserProfile();
  }, [userId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/auth/profile`,
        { headers }
      );

      if (response.data.success) {
        setCurrentUser(response.data.user);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchUserProfile = async () => {
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
        `${import.meta.env.VITE_APP_BASE_URL}/dashboard/user-profile/${userId}`,
        { headers }
      );

      if (response.data.success) {
        setUserData(response.data.data);
        // Set initial values for edit form
        setUserStatus(response.data.data.user_profile.status);
        setUserRole(response.data.data.user_profile.role);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.response?.data?.error || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`
      };

      // console.log(currentUser?.role);
      // Determine which API to call based on user role
      const apiUrl = currentUser?.role === 'owner' 
        ? `${import.meta.env.VITE_APP_BASE_URL}/keys/providers-plans`
        : `${import.meta.env.VITE_APP_BASE_URL}/keys/available-providers`;

      const response = await axios.get(apiUrl, { headers });

      if (response.data.success) {
        setProviders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  const handleRecharge = async () => {
    try {
      setProcessing(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Validate amount
      if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
        setError('Please enter a valid positive amount');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const payload = {
        user_id: userId,
        amount: rechargeAmount,
        description: rechargeDescription || 'Manual recharge'
      };

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/balance/recharge`,
        payload,
        { headers }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message || 'Balance recharged successfully');
        setRechargeDialogOpen(false);
        setRechargeAmount('');
        setRechargeDescription('');
        fetchUserProfile(); // Refresh data
      } else {
        setError(response.data.error || 'Failed to recharge balance');
      }
    } catch (err) {
      console.error('Error recharging balance:', err);
      setError(err.response?.data?.error || 'Failed to recharge balance');
    } finally {
      setProcessing(false);
    }
  };

  const handleSetCustomPrice = async () => {
         fetchProviders();


    try {
      setProcessing(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Validate custom price
      if (!customPrice || parseFloat(customPrice) <= 0) {
        setError('Please enter a valid positive price');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const payload = {
        bulk_prices: [
          {
            referral_id: userId,
            plan_id: selectedPlan,
            custom_price: parseFloat(customPrice)
          }
        ]
      };

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/price/referral-prices`,
        payload,
        { headers }
      );

      if (response.data.success) {
        // Check if there were any errors
        if (response.data.errors && response.data.errors.length > 0) {
          const errorMsg = response.data.errors[0].error || 'Failed to set custom price';
          setError(errorMsg);
        } else {
          setSuccessMessage(response.data.message || 'Custom price set successfully');
          setPriceDialogOpen(false);
          setSelectedProvider('');
          setSelectedPlan('');
          setCustomPrice('');
          fetchUserProfile(); // Refresh data
        }
      } else {
        setError(response.data.error || 'Failed to set custom price');
      }
    } catch (err) {
      console.error('Error setting custom price:', err);
      setError(err.response?.data?.error || 'Failed to set custom price');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCustomPrice = async (planId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this custom price?')) {
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const payload = {
        user_id: userId,
        plan_id: planId
      };

      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/price/user-prices`,
        { headers, data: payload }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message || 'Custom price deleted successfully');
        fetchUserProfile(); // Refresh data
      } else {
        setError(response.data.error || 'Failed to delete custom price');
      }
    } catch (err) {
      console.error('Error deleting custom price:', err);
      setError(err.response?.data?.error || 'Failed to delete custom price');
    }
  };

  const handleUpdateUserStatus = async () => {
    try {
      setProcessing(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const payload = {
        user_id: userId,
        status: userStatus,
        role: userRole
      };

      const response = await axios.patch(
        `${import.meta.env.VITE_APP_BASE_URL}/price/user-status`,
        payload,
        { headers }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message || 'User updated successfully');
        setUserEditDialogOpen(false);
        fetchUserProfile(); // Refresh data
      } else {
        setError(response.data.error || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setProcessing(false);
    }
  };

  // Get plans for the selected provider
  const getPlansForSelectedProvider = () => {
    if (!selectedProvider) return [];
    const provider = providers.find(p => p.id === selectedProvider);
    return provider ? provider.plans : [];
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setError('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box p={isMobile ? 2 : 4}>
        <Alert severity="error">User not found</Alert>
      </Box>
    );
  }

  const { user_profile, statistics, custom_prices, recharge_history, recent_transactions, referred_users } = userData;
  const isOwner = currentUser?.role === 'owner';

  return (
    <Box p={isMobile ? 2 : 4}>
      <Box display="flex" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <ArrowBackIcon 
          onClick={() => navigate(-1)} 
          sx={{ cursor: 'pointer' }}
        />
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          User Profile
        </Typography>
        
        <Box ml="auto" display="flex" gap={1} flexWrap="wrap">
          {isOwner && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setUserEditDialogOpen(true)}
            >
              Edit User
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<MoneyIcon />}
            onClick={() => setRechargeDialogOpen(true)}
          >
            Recharge
          </Button>
          <Button
            variant="outlined"
            startIcon={<PriceChangeIcon />}
onClick={() => {
  fetchProviders();
  setPriceDialogOpen(true);
}}          >
            Set Custom Price
          </Button>
        </Box>
      </Box>  
      

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1">{user_profile.name}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{user_profile.email}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip 
                  label={user_profile.status} 
                  size="small" 
                  color={user_profile.status === 'active' ? 'success' : 'error'}
                  icon={user_profile.status === 'active' ? <CheckCircleIcon /> : <BlockIcon />}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Role</Typography>
                <Chip 
                  label={user_profile.role} 
                  size="small" 
                  color={user_profile.role === 'admin' ? 'error' : user_profile.role === 'reseller' ? 'primary' : 'default'}
                  icon={user_profile.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Balance</Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <BalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                  ₹{user_profile.balance}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Referral ID</Typography>
                <Typography variant="body1">{user_profile.referral_id}</Typography>
              </Box>

       

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Last Login</Typography>
                <Typography variant="body1">
                  {user_profile.last_login ? new Date(user_profile.last_login).toLocaleString() : 'Never'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">Joined Date</Typography>
                <Typography variant="body1">
                  {new Date(user_profile.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">Total Sold Keys</Typography>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CartIcon sx={{ mr: 1, color: 'primary.main' }} />
                      {statistics.total_sold_keys}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 1, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                      <BalanceIcon sx={{ mr: 1, color: 'success.main' }} />
                      ₹{statistics.total_revenue}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">Referred Users</Typography>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 1, color: 'info.main' }} />
                      {statistics.total_referred_users}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">Custom Prices</Typography>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PriceChangeIcon sx={{ mr: 1, color: 'warning.main' }} />
                      {statistics.total_custom_prices}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Custom Prices */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3] }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  Custom Prices
                </Typography>
                <Tooltip title="Add Custom Price">
                  <IconButton onClick={() => setPriceDialogOpen(true)}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {custom_prices && custom_prices.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Custom Price</TableCell>
                        <TableCell>Created At</TableCell>
                        {isOwner && <TableCell>Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {custom_prices.map((price, index) => {
                        const originalPrice = parseFloat(price.plan.original_amount);
                        const customPriceValue = parseFloat(price.custom_price);
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>{price.plan.provider}</TableCell>
                            <TableCell>{price.plan.name} ({price.plan.duration})</TableCell>
                            <TableCell>₹{customPriceValue.toFixed(2)}</TableCell>
                            <TableCell>
                              {new Date(price.created_at).toLocaleDateString()}
                            </TableCell>
                            {isOwner && (
                              <TableCell>
                                <Tooltip title="Delete custom price">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteCustomPrice(price.plan.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={3}>
                  <PriceChangeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No custom prices set for this user
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        {recent_transactions && recent_transactions.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3] }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recent_transactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip 
                              label={transaction.type} 
                              size="small" 
                              color={transaction.type === 'recharge' ? 'success' : 'primary'}
                            />
                          </TableCell>
                          <TableCell>₹{transaction.amount}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recharge History */}
        {recharge_history && recharge_history.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3] }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recharge History
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Amount</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recharge_history.map((recharge, index) => (
                        <TableRow key={index}>
                          <TableCell>₹{recharge.amount}</TableCell>
                          <TableCell>{recharge.description}</TableCell>
                          <TableCell>
                            {new Date(recharge.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Referred Users */}
        {referred_users && referred_users.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3] }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Referred Users ({referred_users.length})
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Joined Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {referred_users.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip 
                              label={user.status} 
                              size="small" 
                              color={user.status === 'active' ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Recharge Dialog */}
      <Dialog open={rechargeDialogOpen} onClose={() => setRechargeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Recharge User Balance</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={rechargeAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                setRechargeAmount(value);
              }
            }}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={rechargeDescription}
            onChange={(e) => setRechargeDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRechargeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRecharge} 
            variant="contained" 
            disabled={processing || !rechargeAmount || parseFloat(rechargeAmount) <= 0}
          >
            {processing ? <CircularProgress size={24} /> : 'Recharge'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Set Custom Price Dialog */}
      <Dialog open={priceDialogOpen} onClose={() => setPriceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set Custom Price</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Provider"
            fullWidth
            variant="outlined"
            value={selectedProvider}
            onChange={(e) => {
              setSelectedProvider(e.target.value);
              setSelectedPlan(''); // Reset plan when provider changes
            }}
            sx={{ mb: 2 }}
          >
            {providers.map((provider) => (
              <MenuItem key={provider.id} value={provider.id}>
                {provider.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            margin="dense"
            label="Plan"
            fullWidth
            variant="outlined"
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            disabled={!selectedProvider}
            sx={{ mb: 2 }}
          >
            {getPlansForSelectedProvider().map((plan) => (
              <MenuItem key={plan.id} value={plan.id}>
                {plan.name} - ₹{plan.amount} ({plan.duration})
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            margin="dense"
            label="Custom Price"
            type="number"
            fullWidth
            variant="outlined"
            value={customPrice}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                setCustomPrice(value);
              }
            }}
            inputProps={{ min: 0, step: 0.01 }}
            disabled={!selectedPlan}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSetCustomPrice} 
            variant="contained" 
            disabled={processing || !selectedProvider || !selectedPlan || !customPrice || parseFloat(customPrice) <= 0}
          >
            {processing ? <CircularProgress size={24} /> : 'Set Price'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog (Owner only) */}
      {isOwner && (
        <Dialog open={userEditDialogOpen} onClose={() => setUserEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={userStatus}
                label="Status"
                onChange={(e) => setUserStatus(e.target.value)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={userRole}
                label="Role"
                onChange={(e) => setUserRole(e.target.value)}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="reseller">Reseller</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateUserStatus} 
              variant="contained" 
              disabled={processing}
            >
              {processing ? <CircularProgress size={24} /> : 'Update User'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          onClose={handleCloseSnackbar}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;