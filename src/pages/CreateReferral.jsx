import React, { memo, lazy, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// MUI Components
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
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// MUI Icons - Lazy Loaded
const Share = lazy(() => import('@mui/icons-material/Share'));
const ContentCopy = lazy(() => import('@mui/icons-material/ContentCopy'));
const Telegram = lazy(() => import('@mui/icons-material/Telegram'));
const Add = lazy(() => import('@mui/icons-material/Add'));
const List = lazy(() => import('@mui/icons-material/List'));

import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Memoized components for better performance
const MemoizedTableRow = memo(({ children }) => <TableRow>{children}</TableRow>);
const MemoizedTableCell = memo(({ children, ...props }) => <TableCell {...props}>{children}</TableCell>);

export default function CreateReferral() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [referralCodes, setReferralCodes] = useState([]);
  const [loading, setLoading] = useState({
    create: false,
    list: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createForm, setCreateForm] = useState({
    role: 'reseller'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });
  const [shareDialog, setShareDialog] = useState({
    open: false,
    code: '',
    url: ''
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`
    };
  }, []);

  const fetchReferralCodes = useCallback(async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, list: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/auth/referral-codes?page=${page}&limit=${pagination.limit}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        setReferralCodes(response.data.referral_codes || []);
        setPagination(prev => ({
          ...prev,
          page: response.data.page,
          totalPages: response.data.total_pages,
          totalItems: response.data.total_items
        }));
      }
    } catch (err) {
      console.error('Error fetching referral codes:', err);
      setError(err.response?.data?.error || 'Failed to load referral codes');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  }, [getAuthHeaders, pagination.limit]);

  const createReferralCode = useCallback(async () => {
    if (!createForm.role) {
      setError('Please select a role');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, create: true }));
      setError('');
      
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/auth/referral-codes/create`,
        { role: createForm.role },
        { 
          headers: getAuthHeaders(),
          timeout: 10000
        }
      );

      if (response.data.success) {
        setSuccess('Referral code created successfully!');
        setCreateForm({ role: 'reseller' });
        
        // Refresh the list
        fetchReferralCodes(1);
        
        // Auto-switch to list tab
        setTabValue(1);
      }
    } catch (err) {
      console.error('Error creating referral code:', err);
      setError(err.response?.data?.error || 'Failed to create referral code');
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, [createForm.role, getAuthHeaders, fetchReferralCodes]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
    }).catch(() => {
      setError('Failed to copy to clipboard');
    });
  }, []);

  const shareViaTelegram = useCallback((code, url) => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Join using my referral code: ${code}`)}`;
    window.open(telegramUrl, '_blank');
  }, []);

  const nativeShare = useCallback(async (code, url) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join with my referral code',
          text: `Use my referral code: ${code}`,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard(url);
    }
  }, [copyToClipboard]);

  const openShareDialog = useCallback((code) => {
    const shareUrl = `${window.location.origin}/register?ref=${code}`;
    setShareDialog({
      open: true,
      code: code,
      url: shareUrl
    });
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && referralCodes.length === 0) {
      fetchReferralCodes(1);
    }
  };

  const getStatusChip = useCallback((isUsed, expiresAt) => {
    if (isUsed) {
      return <Chip label="Used" color="success" size="small" />;
    }
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    
    if (expiry < now) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    
    return <Chip label="Active" color="primary" size="small" />;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Load referral codes when component mounts if user is owner
  useEffect(() => {
    if (user?.role === 'owner') {
      fetchReferralCodes(1);
    }
  }, [user?.role, fetchReferralCodes]);

if (user?.role !== 'owner' && user?.role !== 'admin') {
  return (
    <Box p={isMobile ? 2 : 3}>
      <Alert severity="error">
        You don't have permission to access this page. Only owners and admins can create referral codes.
      </Alert>
    </Box>
  );
}


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

      <Typography variant="h4" gutterBottom fontWeight="bold">
        Referral 
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create and manage referral codes 
      </Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab 
              icon={<Add />} 
              label="Create Referral" 
              id="create-tab"
            />
            <Tab 
              icon={<List />} 
              label="My Referrals" 
              id="list-tab"
            />
          </Tabs>

          {/* Create Referral Tab */}
          <Box
            role="tabpanel"
            hidden={tabValue !== 0}
            id="create-panel"
            aria-labelledby="create-tab"
            sx={{ p: 3 }}
          >
            <Grid container spacing={3}>
              <Grid size = {{xs:12, md:6}}>
                <Typography variant="h6" gutterBottom>
                  Create New Referral Code
                </Typography>
                
           <TextField
  select
  fullWidth
  label="Select Role"
  value={createForm.role}
  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
  sx={{ mb: 2 }}
>
  {(() => {
    const availableRoles = [];

    if (user?.role === 'owner') {
      availableRoles.push('admin', 'reseller');
    } else if (user?.role === 'admin') {
      availableRoles.push('reseller');
    }

    return availableRoles.map(role => (
      <MenuItem key={role} value={role}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </MenuItem>
    ));
  })()}
</TextField>


                <Button
                  variant="contained"
                  onClick={createReferralCode}
                  disabled={loading.create}
                  startIcon={loading.create ? <CircularProgress size={20} /> : <Add />}
                  size="large"
                >
                  {loading.create ? 'Creating...' : 'Generate Referral Code'}
                </Button>
              </Grid>

     
            </Grid>
          </Box>

          {/* List Referrals Tab */}
          <Box
            role="tabpanel"
            hidden={tabValue !== 1}
            id="list-panel"
            aria-labelledby="list-tab"
            sx={{ p: 0 }}
          >
            {loading.list ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ p: 3, pb: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    My Referral Codes ({pagination.totalItems})
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <MemoizedTableCell>Referral Code</MemoizedTableCell>
                        <MemoizedTableCell>Role</MemoizedTableCell>
                        <MemoizedTableCell>Status</MemoizedTableCell>
                        <MemoizedTableCell>Created</MemoizedTableCell>
                        <MemoizedTableCell>Expires</MemoizedTableCell>
                            {user?.role === 'owner' && (
                      <MemoizedTableCell>Creator</MemoizedTableCell>
                          )}

                        <MemoizedTableCell>Used By</MemoizedTableCell>
                        <MemoizedTableCell>Actions</MemoizedTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {referralCodes.map((referral) => (
                        <MemoizedTableRow key={referral.code}>
                          <MemoizedTableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {referral.code}
                            </Typography>
                          </MemoizedTableCell>
                          <MemoizedTableCell>
                            <Chip 
                              label={referral.user_role} 
                              size="small"
                              color={referral.user_role === 'admin' ? 'secondary' : 'primary'}
                            />
                          </MemoizedTableCell>
                          <MemoizedTableCell>
                            {getStatusChip(referral.is_used, referral.expires_at)}
                          </MemoizedTableCell>
                          <MemoizedTableCell>
                            {formatDate(referral.createdAt)}
                          </MemoizedTableCell>


                          <MemoizedTableCell>
                            {formatDate(referral.expires_at)}
                         
                         
                          </MemoizedTableCell>


      {user?.role === 'owner' && (
        <MemoizedTableCell>
          {referral?.creator ? referral.creator.name : '—'}
        </MemoizedTableCell>
      )}

                          <MemoizedTableCell>
                            {referral.user ? (
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {referral.user.name}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Not used
                              </Typography>
                            )}
                          </MemoizedTableCell>
                          <MemoizedTableCell>
                            <Box display="flex" gap={1}>
                              <IconButton
                                size="small"
                                onClick={() => copyToClipboard(referral.code)}
                                title="Copy code"
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => openShareDialog(referral.code)}
                                title="Share"
                                disabled={referral.is_used}
                              >
                                <Share fontSize="small" />
                              </IconButton>
                            </Box>
                          </MemoizedTableCell>
                        </MemoizedTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {referralCodes.length === 0 && (
                  <Box display="flex" justifyContent="center" py={6}>
                    <Typography variant="body1" color="text.secondary">
                      No referral codes created yet
                    </Typography>
                  </Box>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <Box display="flex" justifyContent="center" p={2} gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchReferralCodes(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Typography variant="body2" sx={{ mx: 2, alignSelf: 'center' }}>
                      Page {pagination.page} of {pagination.totalPages}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchReferralCodes(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialog.open} onClose={() => setShareDialog({ open: false, code: '', url: '' })}>
        <DialogTitle>Share Referral Code</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Share your referral code: <strong>{shareDialog.code}</strong>
          </Typography>
          
          <TextField
            fullWidth
            value={shareDialog.url}
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
            helperText="Registration URL with your referral code"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => copyToClipboard(shareDialog.url)}
            startIcon={<ContentCopy />}
          >
            Copy URL
          </Button>
          <Button 
            onClick={() => shareViaTelegram(shareDialog.code, shareDialog.url)}
            startIcon={<Telegram />}
            color="primary"
          >
            Telegram
          </Button>
          <Button 
            onClick={() => nativeShare(shareDialog.code, shareDialog.url)}
            startIcon={<Share />}
            variant="contained"
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}