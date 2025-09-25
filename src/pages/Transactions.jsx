import React, { useState, useEffect } from 'react';
// MUI Material imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// MUI Icons imports
import TransactionIcon from '@mui/icons-material/AccountBalance';
import UserIcon from '@mui/icons-material/AccountCircle';
import DateIcon from '@mui/icons-material/DateRange';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import FilterIcon from '@mui/icons-material/FilterList';

import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Transactions = () => {
  const [transactionsData, setTransactionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
    user_id: '',
    done_by: ''
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchTransactionsData();
  }, [page, rowsPerPage, filters]);

  const fetchTransactionsData = async () => {
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

      // Build query parameters
      const params = new URLSearchParams({
        page: page,
        limit: rowsPerPage,
        ...(filters.type && { type: filters.type }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
        ...(filters.min_amount && { min_amount: filters.min_amount }),
        ...(filters.max_amount && { max_amount: filters.max_amount }),
      });

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/dashboard/transactions?${params}`,
        { headers }
      );

      if (response.data.success) {
        setTransactionsData(response.data);

        console.log(transactionsData);
      }
    } catch (err) {
      console.error('Error fetching transactions data:', err);
      setError(err.response?.data?.error || 'Failed to load transactions data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
      user_id: '',
      done_by: ''
    });
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'key_purchase':
        return 'primary';
      case 'recharge':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'key_purchase':
        return <ReceiptIcon />;
      case 'recharge':
        return <PaymentIcon />;
      case 'commission':
           return <PaymentIcon />;
      default:
        return <TransactionIcon />;
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'key_purchase':
        return 'Key Purchase';
      case 'recharge':
        return 'Recharge';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 1 : 3} sx={{ paddingBottom: "70px" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <TransactionIcon sx={{ mr: 1, fontSize: 32, color: theme.palette.primary.main }} />
          {/* <Typography variant="h4" fontWeight="bold" color="text.glass">
            Transactions
          </Typography> */}
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            onClick={() => setFiltersOpen(true)}
            startIcon={<FilterIcon />}
          >
            Filters
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleClearFilters}
            color="secondary"
          >
            Clear Filters
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid  size={{ xs: 6, sm: 6, md: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <Card 
              sx={{ 
                borderRadius: 1,
                background: theme.palette.background.glass,
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: theme.shadows[8],
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.glass">
                  {transactionsData?.data.pagination.total_items || 0}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
         

    <Grid  size={{ xs: 6, sm: 6, md: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <Card 
              sx={{ 
                borderRadius: 1,
                background: theme.palette.background.glass,
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: theme.shadows[8],
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                 Total Recharge
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.glass">
                  {transactionsData?.data?.totals.total_recharge || 0} 
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>



 <Grid  size={{ xs: 6, sm: 6, md: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <Card 
              sx={{ 
                borderRadius: 1,
                background: theme.palette.background.glass,
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: theme.shadows[8],
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                 Key Amount
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.glass">
                  {transactionsData?.data?.totals.total_key_purchases || 1} 
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>




        <Grid  size={{ xs: 6, sm: 6, md: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <Card 
              sx={{ 
                borderRadius: 1,
                background: theme.palette.background.glass,
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: theme.shadows[8],
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Current Page
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.glass">
                  {transactionsData?.data.pagination.current_page || 1} / {transactionsData?.data.pagination.total_pages || 1}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
   
      
      </Grid>

      {/* Filters Dialog */}
      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Transaction Filters
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={filters.type}
                label="Transaction Type"
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="key_purchase">Key Purchase</MenuItem>
                <MenuItem value="recharge">Recharge</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'}>
              <FormControl fullWidth>
                <InputLabel>Min Amount</InputLabel>
                <Select
                  value={filters.min_amount}
                  label="Min Amount"
                  onChange={(e) => setFilters({...filters, min_amount: e.target.value})}
                >
                  <MenuItem value="">Any Amount</MenuItem>
                  <MenuItem value="100">₹100+</MenuItem>
                  <MenuItem value="500">₹500+</MenuItem>
                  <MenuItem value="1000">₹1,000+</MenuItem>
                  <MenuItem value="5000">₹5,000+</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Max Amount</InputLabel>
                <Select
                  value={filters.max_amount}
                  label="Max Amount"
                  onChange={(e) => setFilters({...filters, max_amount: e.target.value})}
                >
                  <MenuItem value="">Any Amount</MenuItem>
                  <MenuItem value="500">Up to ₹500</MenuItem>
                  <MenuItem value="1000">Up to ₹1,000</MenuItem>
                  <MenuItem value="5000">Up to ₹5,000</MenuItem>
                  <MenuItem value="10000">Up to ₹10,000</MenuItem>
                </Select>
              </FormControl>
            </Box>


         
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltersOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setFiltersOpen(false);
              fetchTransactionsData();
            }}
            variant="contained"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {transactionsData && (
        <>
          {/* Transactions Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper 
              sx={{ 
                width: '100%', 
                overflow: 'hidden',
                borderRadius: 1,
                background: theme.palette.background.glass,
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: theme.shadows[8],
              }}
            >
              <TableContainer sx={{ maxHeight: '100vh' }}>
                <Table stickyHeader aria-label="transactions table">
                  <TableHead>
                    <TableRow sx={{ background: "rgba(19, 19, 19, 0.8)", padding: 0 }}>
                      <TableCell sx={{ color: theme.palette.text.glass, fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ color: theme.palette.text.glass, fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ color: theme.palette.text.glass, fontWeight: 600, minWidth:20,}}>Info</TableCell>
                      <TableCell sx={{ color: theme.palette.text.glass, fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: theme.palette.text.glass, fontWeight: 600 }}>User</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence>
                      {transactionsData.data.transactions.map((transaction) => (
                        <TableRow 
                          key={transaction.id}
                          component={motion.tr}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { 
                              backgroundColor: alpha(theme.palette.primary.main, 0.05) 
                            }
                          }}
                        >
                       
                          <TableCell>
                            <Chip 
                              icon={getTransactionTypeIcon(transaction.type)}
                              label={getTransactionTypeLabel(transaction.type)}
                              color={getTransactionTypeColor(transaction.type)}
                              size="small"
                              sx={{ 
                                // background: alpha(theme.palette[getTransactionTypeColor(transaction.type)].main, 0.2),
                                // color: theme.palette[getTransactionTypeColor(transaction.type)].main,
                                // border: `1px solid ${alpha(theme.palette[getTransactionTypeColor(transaction.type)].main, 0.3)}`
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold" color={theme.palette.success.main}>
                              {formatAmount(transaction.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell
                          sx={{
                            minWidth:"100px !important"
                          }}
                          >
                            <Typography variant="body2" color="text.glass"
                              sx={{
                            minWidth:"100px !important"
                          }}
                            >
                              {transaction.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary"
                              sx={{
                            minWidth:"100px !important"
                          }}
                            >
                              {formatDate(transaction.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <UserIcon sx={{ mr: 1, fontSize: 20, color: theme.palette.secondary.main }} />
                              <Box>
                                <Typography variant="body2" color="text.glass">
                                  {transaction.user?.name || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                 
                      
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
                component="div"
                count={transactionsData.data.pagination.total_items}
                rowsPerPage={rowsPerPage}
                page={transactionsData.data.pagination.current_page - 1}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ 
                  color: theme.palette.text.glass,
                  '& .MuiTablePagination-selectIcon': {
                    color: theme.palette.text.glass
                  }
                }}
              />
            </Paper>
          </motion.div>
        </>
      )}
    </Box>
  );
};

export default Transactions;