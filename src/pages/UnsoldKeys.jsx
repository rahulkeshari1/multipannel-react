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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

// MUI Icons imports
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';


import { motion } from 'framer-motion';
import axios from 'axios';

const UnsoldKeys = () => {
  const [keys, setKeys] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
    has_next: false,
    has_prev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    provider_id: '',
    plan_id: '',
    duration: '',
    min_amount: '',
    max_amount: '',
    sort_by: 'created_at',
    sort_order: 'ASC'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchUnsoldKeys();
  }, [filters, pagination.current_page]);

  const fetchUnsoldKeys = async () => {
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

      const params = {
        page: pagination.current_page,
        limit: pagination.items_per_page,
        ...filters
      };

      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/dashboard/unsold-keys`,
        { headers, params }
      );

      if (response.data.success) {
        setKeys(response.data.data.keys);
        setStatistics(response.data.data.statistics);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching unsold keys:', err);
      setError(err.response?.data?.error || 'Failed to load unsold keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      current_page: newPage + 1
    }));
  };

  const handleRowsPerPageChange = (event) => {
    setPagination(prev => ({
      ...prev,
      items_per_page: parseInt(event.target.value, 10),
      current_page: 1
    }));
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = keys.map((key) => key.id);
      setSelectedKeys(newSelected);
      return;
    }
    setSelectedKeys([]);
  };

  const handleSelectKey = (id) => {
    const selectedIndex = selectedKeys.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedKeys, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedKeys.slice(1));
    } else if (selectedIndex === selectedKeys.length - 1) {
      newSelected = newSelected.concat(selectedKeys.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedKeys.slice(0, selectedIndex),
        selectedKeys.slice(selectedIndex + 1),
      );
    }

    setSelectedKeys(newSelected);
  };

  const handleDeleteKeys = async () => {
    if (selectedKeys.length === 0) {
      setError('Please select at least one key to delete');
      return;
    }

    try {
      setDeleteLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Get provider_id and plan_id from the first selected key
      const firstKey = keys.find(key => key.id === selectedKeys[0]);
      
      const payload = {
        key_ids: selectedKeys,
        provider_id: firstKey.provider.id,
        plan_id: firstKey.plan.id,
        confirm:true
      };

      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/dashboard/unsold-keys`,
        { headers, data: payload }
      );

      if (response.data.success) {
        setSuccess(`Successfully deleted ${selectedKeys.length} key(s)`);
        setDeleteDialogOpen(false);
        setSelectedKeys([]);
        fetchUnsoldKeys(); // Refresh the list
      }
    } catch (err) {
      console.error('Error deleting keys:', err);
      setError(err.response?.data?.error || 'Failed to delete keys');
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      provider_id: '',
      plan_id: '',
      duration: '',
      min_amount: '',
      max_amount: '',
      sort_by: 'created_at',
      sort_order: 'ASC'
    });
    setFilterDialogOpen(false);
  };

  const isSelected = (id) => selectedKeys.indexOf(id) !== -1;

  return (
    <Box p={isMobile ? 2 : 4} sx={{ marginBottom: '80px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Unsold Keys 🔑
        </Typography>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchUnsoldKeys}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filters">
            <IconButton onClick={() => setFilterDialogOpen(true)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your unsold keys inventory
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

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {statistics && (
          <>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[2] }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {statistics.total.keys}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Keys
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 6, md: 3 }}>
              <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[2] }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    {statistics.total.providers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Providers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 6, md: 3 }}>
              <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[2] }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {statistics.total.plans}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Plans
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 6, md: 3 }}>
              <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[2] }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    ₹{statistics.total.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Search and Actions */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], p: 2 }}>
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} alignItems="center">
              <TextField
                placeholder="Search by provider name..."
                value={filters.search}
                onChange={handleSearchChange}
                size="small"
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  disabled={selectedKeys.length === 0}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete ({selectedKeys.length})
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Keys Table */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3] }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress />
              </Box>
            ) : keys.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4} flexDirection="column">
                <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No unsold keys found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search or filters
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedKeys.length > 0 && selectedKeys.length < keys.length}
                            checked={keys.length > 0 && selectedKeys.length === keys.length}
                            onChange={handleSelectAllClick}
                          />
                        </TableCell>
                        <TableCell>Key Code</TableCell>
                        <TableCell>Provider</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Created At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {keys.map((key) => {
                        const isItemSelected = isSelected(key.id);
                        
                        return (
                          <TableRow
                            key={key.id}
                            hover
                            onClick={() => handleSelectKey(key.id)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            selected={isItemSelected}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox checked={isItemSelected} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {key.key_code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={key.provider.name} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            </TableCell>
                            <TableCell>{key.plan.name}</TableCell>
                            <TableCell>{key.duration}</TableCell>
                            <TableCell>₹{key.price}</TableCell>
                            <TableCell>
                              {new Date(key.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={pagination.total_items}
                  rowsPerPage={pagination.items_per_page}
                  page={pagination.current_page - 1}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete {selectedKeys.length} selected key(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteKeys} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog 
        open={filterDialogOpen} 
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Filter Keys
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Provider</InputLabel>
                <Select
                  value={filters.provider_id}
                  label="Provider"
                  onChange={(e) => handleFilterChange('provider_id', e.target.value)}
                >
                  <MenuItem value="">All Providers</MenuItem>
                  {statistics?.providers.map(provider => (
                    <MenuItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Plan</InputLabel>
                <Select
                  value={filters.plan_id}
                  label="Plan"
                  onChange={(e) => handleFilterChange('plan_id', e.target.value)}
                >
                  <MenuItem value="">All Plans</MenuItem>
                  {statistics?.plans.map(plan => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name} ({plan.duration})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Min Amount"
                type="number"
                value={filters.min_amount}
                onChange={(e) => handleFilterChange('min_amount', e.target.value)}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Max Amount"
                type="number"
                value={filters.max_amount}
                onChange={(e) => handleFilterChange('max_amount', e.target.value)}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sort_by}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                >
                  <MenuItem value="created_at">Created Date</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="duration">Duration</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={filters.sort_order}
                  label="Sort Order"
                  onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                >
                  <MenuItem value="ASC">Ascending</MenuItem>
                  <MenuItem value="DESC">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>Reset</Button>
          <Button 
            onClick={() => setFilterDialogOpen(false)} 
            variant="contained"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnsoldKeys;