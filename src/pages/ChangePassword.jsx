import React, { useState, useEffect } from 'react';
// MUI Material imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

// MUI Icons imports
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';

import { motion } from 'framer-motion';
import axios from 'axios';

const ChangePassword = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Show/hide password
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password validation
  const [passwordErrors, setPasswordErrors] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    validatePassword(newPassword);
  }, [newPassword]);

  const fetchProfile = async () => {
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
        `${import.meta.env.VITE_APP_BASE_URL}/auth/profile`,
        { headers }
      );

      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const errors = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasMinLength: password.length >= 8
    };
    
    setPasswordErrors(errors);
    return Object.values(errors).every(v => v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setError('New password does not meet requirements');
      return;
    }
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        currentPassword,
        newPassword
      };

      const response = await axios.put(
        'http://localhost:5000/api/v1/auth/change-password',
        payload,
        { headers }
      );

      if (response.data.success) {
        setSuccess('Password changed successfully!');
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading profile... 🔄
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 4} sx={{ marginBottom: '80px' }}>
      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LockIcon sx={{ mr: 1 }} />
        Change Password
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Update your password to keep your account secure 🔒
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setError('')}
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
        <Grid >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Profile Information
                </Typography>
                
                {profile && (
                  <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Name:</strong> {profile.name || 'Not provided'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Email:</strong> {profile.email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Username:</strong> {profile.username}
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[3], height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  Change Password
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    type={showCurrentPassword ? 'text' : 'password'}
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    margin="normal"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    type={showNewPassword ? 'text' : 'password'}
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    margin="normal"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    margin="normal"
                    required
                    error={newPassword !== confirmPassword && confirmPassword !== ''}
                    helperText={newPassword !== confirmPassword && confirmPassword !== '' ? 'Passwords do not match' : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  {newPassword && (
                    <Box sx={{ 
                      p: 2, 
                      mt: 2, 
                      backgroundColor: alpha(theme.palette.info.main, 0.1), 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" gutterBottom>
                        Password must contain:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        <Typography 
                          component="li" 
                          variant="body2" 
                          color={passwordErrors.hasUpperCase ? 'success.main' : 'text.secondary'}
                        >
                          At least one uppercase letter
                        </Typography>
                        <Typography 
                          component="li" 
                          variant="body2" 
                          color={passwordErrors.hasLowerCase ? 'success.main' : 'text.secondary'}
                        >
                          At least one lowercase letter
                        </Typography>
                        <Typography 
                          component="li" 
                          variant="body2" 
                          color={passwordErrors.hasNumber ? 'success.main' : 'text.secondary'}
                        >
                          At least one number
                        </Typography>
                        <Typography 
                          component="li" 
                          variant="body2" 
                          color={passwordErrors.hasSpecialChar ? 'success.main' : 'text.secondary'}
                        >
                          At least one special character
                        </Typography>
                        <Typography 
                          component="li" 
                          variant="body2" 
                          color={passwordErrors.hasMinLength ? 'success.main' : 'text.secondary'}
                        >
                          Minimum 8 characters
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={updating}
                    sx={{ mt: 3, py: 1.5 }}
                  >
                    {updating ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChangePassword;