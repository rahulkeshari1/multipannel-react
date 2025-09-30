import React, { useState, useEffect, lazy } from 'react';
// MUI Material imports
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';

// MUI Icons imports
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import AccountCircle from '@mui/icons-material/AccountCircle';
const InstallPWA = lazy(() => import('../../pages/InstallPWA'));

import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // API call to login endpoint
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/auth/login`, {
        email,
        password
      });

      const data = response.data;

      if (data.success) {
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call the login function from auth context
        await login(data.user, data.token);
        
        navigate('/dashboard');
      } else {
        setError(data.error || 'Failed to login');
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        // The server responded with an error status
        setError(err.response.data.error || 'Login failed');
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Calculate gradient position based on mouse position
  const gradientX = (mousePosition.x / window.innerWidth) * 100;
  const gradientY = (mousePosition.y / window.innerHeight) * 100;

  return (
    <Container 
      maxWidth={false} 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Floating elements */}
      <Box sx={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: 100,
        height: 100,
        borderRadius: '20%',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(45deg, rgba(144, 202, 249, 0.2), rgba(144, 202, 249, 0.05))'
          : 'linear-gradient(45deg, rgba(255, 255, 255, 0.4), rgba(200, 200, 255, 0.2))',
        filter: 'blur(10px)',
        animation: 'float 15s ease-in-out infinite',
        zIndex: 0,
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(180deg)' },
        }
      }} />
      
      <Box sx={{
        position: 'absolute',
        bottom: '30%',
        right: '15%',
        width: 150,
        height: 150,
        borderRadius: '20%',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(45deg, rgba(244, 143, 177, 0.2), rgba(244, 143, 177, 0.05))'
          : 'linear-gradient(45deg, rgba(255, 220, 220, 0.4), rgba(255, 200, 200, 0.2))',
        filter: 'blur(15px)',
        animation: 'float2 20s ease-in-out infinite',
        zIndex: 0,
        '@keyframes float2': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(40px) rotate(-180deg)' },
        }
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            background: theme.palette.mode === 'dark' 
              ? 'rgba(17, 25, 40, 0.65)' 
              : 'rgba(255, 255, 255, 0.55)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.125)'
              : '1px solid rgba(255, 255, 255, 0.5)',
            boxSizing: 'border-box',
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.36)'
              : '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: -1,
            }
          }}
        >
          <div>
            <AccountCircle sx={{ 
              fontSize: 60, 
              color: theme.palette.primary.main, 
              mb: 1,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
            }} />
          </div>
          
          {error && (
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {error}
              </Alert>
            </div>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              mt: 1, 
              width: '100%',
              '& .MuiTextField-root': {
                mb: 2,
              }
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(''); // Clear error when user starts typing
              }}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-input': {
                  color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.8)',
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                },
                '& .MuiOutlinedInput-root': {
                  backdropFilter: 'blur(5px)',
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                },
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); // Clear error when user starts typing
              }}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                      sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiInputBase-input': {
                  color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.8)',
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                },
                '& .MuiOutlinedInput-root': {
                  backdropFilter: 'blur(5px)',
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 2, 
                mb: 2, 
                backdropFilter: 'blur(10px)',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, rgba(144, 202, 249, 0.25), rgba(144, 202, 249, 0.15))'
                  : 'linear-gradient(45deg, rgba(144, 202, 249, 0.4), rgba(144, 202, 249, 0.3))',
                color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.8)',
                fontWeight: 'bold',
                fontSize: '1rem',
                py: 1.5,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 20px rgba(0,0,0,0.3)'
                  : '0 4px 20px rgba(0,0,0,0.1)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, rgba(144, 202, 249, 0.35), rgba(144, 202, 249, 0.25))'
                    : 'linear-gradient(45deg, rgba(144, 202, 249, 0.5), rgba(144, 202, 249, 0.4))',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
                '&:disabled': {
                  opacity: 0.7,
                  transform: 'none',
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.8)' }} /> : 'Sign In'}
            </Button>
            
            <Box textAlign="center">
              <Link 
                to="/register" 
                style={{ 
                  color: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : 'rgba(0, 0, 0, 0.8)', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  wordBreak: 'break-word',
                  display: 'block',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.03)',
                  border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(0, 0, 0, 0.05)',
                  pointerEvents: loading ? 'none' : 'auto',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.background = theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)';
                    e.target.style.color = theme.palette.primary.main;
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.background = theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.03)';
                    e.target.style.color = theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.9)' 
                      : 'rgba(0, 0, 0, 0.8)';
                  }
                }}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </div>
      <InstallPWA />
    </Container>
  );
};

export default Login;