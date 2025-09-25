import React, { useState, useEffect, lazy } from 'react';
// MUI Material imports - import each component separately
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';

// MUI Icons imports - import each icon separately
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import Person from '@mui/icons-material/Person';
import CardGiftcard from '@mui/icons-material/CardGiftcard';

import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
const InstallPWA = lazy(() => import('../../pages/InstallPWA'))

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { register } = useAuth();
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
  
  try {
    setError('');
    setLoading(true);
    
    // API call to register endpoint
    const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        referral_id: referralCode
      }),
    });
    
    const data = await response.json();

    console.log(data)
    
    if (data.success) {
      // Store token in secure storage
      localStorage.setItem('authToken', data.token);

      localStorage.setItem('user', JSON.stringify(data.user));

      
      await register({ name, email }, data.token);
      
      navigate('/dashboard');
    } else {
      setError(data.error || 'Failed to create an account');
    }
  } catch (err) {
    setError(err.message || 'Failed to create an account');
  }
  
  setLoading(false);
};

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Calculate gradient position based on mouse position
  const gradientX = (mousePosition.x / window.innerWidth) * 100;
  const gradientY = (mousePosition.y / window.innerHeight) * 100;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, 
             #0f0c29 0%, 
             #302b63 ${gradientY}%, 
             #24243e 100%)` 
          : `linear-gradient(135deg, 
             #E2E2E2 0%, 
             #C9D6FF ${gradientY}%, 
             #E2E2E2 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(120, 119, 198, 0.3) 0%, transparent 40%),
               radial-gradient(circle at ${100 - gradientX}% ${100 - gradientY}%, rgba(255, 100, 100, 0.2) 0%, transparent 40%),
               radial-gradient(circle at ${gradientY}% ${gradientX}%, rgba(100, 100, 255, 0.2) 0%, transparent 40%)`
            : `radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(255, 255, 255, 0.6) 0%, transparent 40%),
               radial-gradient(circle at ${100 - gradientX}% ${100 - gradientY}%, rgba(200, 200, 255, 0.4) 0%, transparent 40%),
               radial-gradient(circle at ${gradientY}% ${gradientX}%, rgba(255, 220, 220, 0.4) 0%, transparent 40%)`,
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backdropFilter: 'blur(5px) contrast(120%)',
          WebkitBackdropFilter: 'blur(5px) contrast(120%)',
          zIndex: 1,
          pointerEvents: 'none',
        }
      }}
    >
      {/* Animated floating elements */}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <Paper
          elevation={0}
          component={motion.div}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
          sx={{
            padding: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 450,
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Person sx={{ 
              fontSize: 60, 
              color: theme.palette.primary.main, 
              mb: 1,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
            }} />
          </motion.div>
          
          <Typography 
            component="h3" 
            variant="h4" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.8)',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Create Account
          </Typography>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 2,
                  backdropFilter: 'blur(10px)',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                  color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.8)',
                  border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  '& .MuiAlert-icon': {
                    color: theme.palette.error.main
                  }
                }}
              >
                {error}
              </Alert>
            </motion.div>
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
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }} />
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
            </motion.div>
            
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            </motion.div>
            
            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            </motion.div>
            
            {/* Referral Code Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <TextField
                margin="normal"
                fullWidth
                name="referralCode"
                label="Referral Code"
                type="text"
                id="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CardGiftcard sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }} />
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
            </motion.div>
            
            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
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
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.8)' }} /> : 'Sign Up'}
              </Button>
            </motion.div>
            
            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Box textAlign="center">
                <Link 
                  to="/login" 
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
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)';
                    e.target.style.color = theme.palette.primary.main;
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.03)';
                    e.target.style.color = theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.9)' 
                      : 'rgba(0, 0, 0, 0.8)';
                  }}
                >
                  Already have an account? Sign In
                </Link>
              </Box>
            </motion.div>
          </Box>
        </Paper>


      </motion.div>

      <InstallPWA />
    </Box>
  );
};

export default Register;