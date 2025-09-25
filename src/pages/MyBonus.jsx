import React, {memo, lazy, useState, useEffect, Suspense, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';


// MUI Icons - Lazy Loaded
const AccountCircle = lazy(() => import('@mui/icons-material/AccountCircle'));
const Visibility = lazy(() => import('@mui/icons-material/Visibility'));
const ExpandMore = lazy(() => import('@mui/icons-material/ExpandMore'));
const ExpandLess = lazy(() => import('@mui/icons-material/ExpandLess'));
const AttachMoney = lazy(() => import('@mui/icons-material/AttachMoney'));
const History = lazy(() => import('@mui/icons-material/History'));
const Group = lazy(() => import('@mui/icons-material/Group'));
const Info = lazy(() => import('@mui/icons-material/Info'));

import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Memoized components for better performance
const MemoizedTableRow = memo(({ children }) => <TableRow>{children}</TableRow>);
const MemoizedTableCell = memo(({ children, ...props }) => <TableCell {...props}>{children}</TableCell>);

export default function MyBonus() {
  const [bonusInfo, setBonusInfo] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSales, setUserSales] = useState(null);
  const [loading, setLoading] = useState({
    bonus: true,
    stats: false,
    history: false,
    userSales: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimAmount, setClaimAmount] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Memoized functions
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`
    };
  }, []);

  const fetchBonusInfo = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, bonus: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/bonus/info`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        setBonusInfo(response.data.bonusInfo);
      }
    } catch (err) {
      console.error('Error fetching bonus info:', err);
      setError(err.response?.data?.error || 'Failed to load bonus information');
    } finally {
      setLoading(prev => ({ ...prev, bonus: false }));
    }
  }, [getAuthHeaders]);

  const fetchReferralStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/bonus/referral-stats`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        setReferralStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching referral stats:', err);
      setError(err.response?.data?.error || 'Failed to load referral statistics');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [getAuthHeaders]);

  const fetchWithdrawalHistory = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, history: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/bonus/withdrawal-history`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        setWithdrawalHistory(response.data.claims);
      }
    } catch (err) {
      console.error('Error fetching withdrawal history:', err);
      setError(err.response?.data?.error || 'Failed to load withdrawal history');
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  }, [getAuthHeaders]);

  const fetchUserSales = useCallback(async (userId) => {
    try {
      setLoading(prev => ({ ...prev, userSales: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/bonus/referred-user-sales/${userId}`,
        { 
          headers: getAuthHeaders(),
          timeout: 10000 // 10 second timeout
        }
      );
      
      if (response.data.success) {
        setUserSales(response.data);
        setSelectedUser(userId);
      }
    } catch (err) {
      console.error('Error fetching user sales:', err);
      setError(err.response?.data?.error || 'Failed to load user sales data');
    } finally {
      setLoading(prev => ({ ...prev, userSales: false }));
    }
  }, [getAuthHeaders]);

  const handleClaimBonus = useCallback(async () => {
    if (!claimAmount || isNaN(claimAmount) || parseFloat(claimAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(claimAmount) > parseFloat(bonusInfo?.available_bonus || 0)) {
      setError('Claim amount cannot exceed available bonus');
      return;
    }

    try {
      setClaiming(true);
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/bonus/request-withdrawal`,
        { amount: claimAmount },
        { 
          headers: getAuthHeaders(),
          timeout: 10000
        }
      );

      if (response.data.success) {
        setSuccess('Bonus claim request submitted successfully!');
        setClaimDialogOpen(false);
        setClaimAmount('');
        fetchBonusInfo();
      }
    } catch (err) {
      console.error('Error claiming bonus:', err);
      setError(err.response?.data?.error || 'Failed to claim bonus');
    } finally {
      setClaiming(false);
    }
  }, [claimAmount, bonusInfo, getAuthHeaders, fetchBonusInfo]);

  const toggleUserExpansion = useCallback((userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  }, []);

  // Load bonus info on component mount
  useEffect(() => {
    fetchBonusInfo();
  }, [fetchBonusInfo]);

  // Memoized components for better rendering performance
  const BonusCards = memo(() => (
    <Grid container spacing={2} mb={3}>
      <Grid size ={{xs:6, sm:6}} >
        <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Total Earned
            </Typography>
            {loading.bonus ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              <Typography variant="h5" fontWeight="bold">
                ₹{bonusInfo?.total_bonus_earned || '0.00'}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size ={{xs:6, sm:6}}>
        <Card sx={{ height: '100%', bgcolor: 'secondary.main', color: 'white' }}>
          <CardContent sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Total Claimed
            </Typography>
            {loading.bonus ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              <Typography variant="h5" fontWeight="bold">
                ₹{bonusInfo?.total_bonus_claimed || '0.00'}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size ={{xs:12}}>
        <Card sx={{ height: '100%', bgcolor: 'success.main', color: 'white' }}>
          <CardContent sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Available
            </Typography>
            {loading.bonus ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              <>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  ₹{bonusInfo?.available_bonus || '0.00'}
                </Typography>
                <Button
                  variant="contained"
                  color="inherit"
                  size="small"
                  onClick={() => setClaimDialogOpen(true)}
                  startIcon={<AttachMoney />}
                  disabled={!bonusInfo || parseFloat(bonusInfo.available_bonus) <= 0}
                  sx={{ 
                    fontWeight: 'bold',
                    background:'red',
                    // '&:hover': { opacity: 0.9 }
                  }}
                >
                  Claim Bonus
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ));

  const UserRow = memo(({ user }) => (
    <React.Fragment key={user.id}>
      <TableRow>
        <MemoizedTableCell>
          <Box display="flex" alignItems="center">
            <AccountCircle sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2">{user.name}</Typography>
          </Box>
        </MemoizedTableCell>
        <MemoizedTableCell>
          <Typography variant="body2">{user.email}</Typography>
        </MemoizedTableCell>
        <MemoizedTableCell>
          <Typography variant="body2">
            {new Date(user.created_at).toLocaleDateString()}
          </Typography>
        </MemoizedTableCell>
        <MemoizedTableCell>
          <IconButton
            size="small"
            onClick={() => toggleUserExpansion(user.id)}
          >
            {expandedUsers[user.id] ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => fetchUserSales(user.id)}
          >
            View
          </Button>
        </MemoizedTableCell>
      </TableRow>
      
      <TableRow>
        <MemoizedTableCell colSpan={4} sx={{ py: 0 }}>
          <Collapse in={expandedUsers[user.id]} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Key Statistics
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <MemoizedTableCell>Plan</MemoizedTableCell>
                    <MemoizedTableCell>Provider</MemoizedTableCell>
                    <MemoizedTableCell>Keys Sold</MemoizedTableCell>
                    <MemoizedTableCell>Total Sales</MemoizedTableCell>
                    <MemoizedTableCell>Avg Price</MemoizedTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referralStats.key_statistics
                    ?.filter(stat => stat.keys_sold > 0)
                    .map((stat, index) => (
                      <MemoizedTableRow key={index}>
                        <MemoizedTableCell>{stat.plan_name}</MemoizedTableCell>
                        <MemoizedTableCell>{stat.provider_name}</MemoizedTableCell>
                        <MemoizedTableCell>{stat.keys_sold}</MemoizedTableCell>
                        <MemoizedTableCell>₹{stat.total_sales_amount}</MemoizedTableCell>
                        <MemoizedTableCell>₹{stat.average_sale_price}</MemoizedTableCell>
                      </MemoizedTableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </MemoizedTableCell>
      </TableRow>
    </React.Fragment>
  ));

  return (
    <Box p={isMobile ? 2 : 3}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <BonusCards />

      {/* Referral Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <Group sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Referral</Typography>
            </Box>
            {!referralStats && (
              <Button 
                variant="outlined" 
                size="small"
                onClick={fetchReferralStats}
                startIcon={<Group />}
                disabled={loading.stats}
              >
                {loading.stats ? <CircularProgress size={16} /> : 'Load Stats'}
              </Button>
            )}
          </Box>
          
          {loading.stats ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : referralStats ? (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Referred Users: {referralStats.total_referred_users || 0}
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <MemoizedTableCell>User</MemoizedTableCell>
                      <MemoizedTableCell>Email</MemoizedTableCell>
                      <MemoizedTableCell>Joined Date</MemoizedTableCell>
                      <MemoizedTableCell>Actions</MemoizedTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {referralStats.referred_users?.map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Box display="flex" justifyContent="center" py={3}>
              <Button 
                variant="contained" 
                onClick={fetchReferralStats}
                startIcon={<Group />}
              >
                Load Referral Statistics
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* User Sales Dialog */}
      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User Sales Details</DialogTitle>
        <DialogContent>
          {loading.userSales ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : userSales ? (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <MemoizedTableCell>Plan</MemoizedTableCell>
                      <MemoizedTableCell>Provider</MemoizedTableCell>
                      <MemoizedTableCell>Keys Sold</MemoizedTableCell>
                      <MemoizedTableCell>Total Sales</MemoizedTableCell>
                      <MemoizedTableCell>Commission</MemoizedTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userSales.grouped?.map((item, index) => (
                      <MemoizedTableRow key={index}>
                        <MemoizedTableCell>{item.plan_name}</MemoizedTableCell>
                        <MemoizedTableCell>{item.provider_name}</MemoizedTableCell>
                        <MemoizedTableCell>{item.keys_sold}</MemoizedTableCell>
                        <MemoizedTableCell>₹{item.total_sales_amount}</MemoizedTableCell>
                        <MemoizedTableCell>₹{item.total_commission}</MemoizedTableCell>
                      </MemoizedTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {userSales.totals && (
                <Box sx={{ mt: 2, p: 2,  borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Totals: {userSales.totals.total_keys_sold} keys sold, 
                    ₹{userSales.totals.total_sales_amount} total sales, 
                    ₹{userSales.totals.total_commission} total commission
                  </Typography>
                </Box>
              )}
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Withdrawal History */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <History sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">History</Typography>
            </Box>
            {!withdrawalHistory && (
              <Button 
                variant="outlined" 
                size="small"
                onClick={fetchWithdrawalHistory}
                startIcon={<History />}
                disabled={loading.history}
              >
                {loading.history ? <CircularProgress size={16} /> : 'Load History'}
              </Button>
            )}
          </Box>

          {loading.history ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : withdrawalHistory ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <MemoizedTableCell>Amount</MemoizedTableCell>
                    <MemoizedTableCell>Total Bonus</MemoizedTableCell>
                    <MemoizedTableCell>Status</MemoizedTableCell>
                    <MemoizedTableCell>Claimed At</MemoizedTableCell>
                    <MemoizedTableCell>Processed At</MemoizedTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawalHistory.map((claim) => (
                    <MemoizedTableRow key={claim.id}>
                      <MemoizedTableCell
                      sx={{padding:'15px 0'}}
                      >₹{claim.claimed_amount}</MemoizedTableCell>
                      <MemoizedTableCell>₹{claim.total_bonus}</MemoizedTableCell>
                      <MemoizedTableCell>
                        <Chip
                          label={claim.status}
                          color={getStatusColor(claim.status)}
                          size="small"
                        />
                      </MemoizedTableCell>
                      <MemoizedTableCell>
                        {new Date(claim.claimed_at).toLocaleDateString()}
                      </MemoizedTableCell>
                      <MemoizedTableCell>
                        {claim.processed_at ? new Date(claim.processed_at).toLocaleDateString() : 'Pending'}
                      </MemoizedTableCell>
                    </MemoizedTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box display="flex" justifyContent="center" py={3}>
              <Button 
                variant="contained" 
                onClick={fetchWithdrawalHistory}
                startIcon={<History />}
              >
                Load Withdrawal History
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Claim Bonus Dialog */}
      <Dialog open={claimDialogOpen} onClose={() => setClaimDialogOpen(false)}>
        <DialogTitle>Claim Bonus</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount to claim"
            type="number"
            fullWidth
            variant="outlined"
            value={claimAmount}
            onChange={(e) => setClaimAmount(e.target.value)}
            helperText={`Available bonus: ₹${bonusInfo?.available_bonus || '0.00'}`}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleClaimBonus}
            disabled={claiming}
            variant="contained"
          >
            {claiming ? <CircularProgress size={24} /> : 'Claim'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bonus Calculation Info */}
      <Paper sx={{ p: 2, mb: 3, mt: 3 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Info sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="bold">
            How Bonus is Calculated
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Your bonus is calculated as: (Referred User's Sale Price - Your Key Price) × Number of Keys Sold
        </Typography>
        <Typography variant="caption" color="text.secondary">
          For each plan and provider, you earn the difference between what your referral sold keys for and your cost price
        </Typography>
      </Paper>
    </Box>
  );
}