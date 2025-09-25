import { createTheme, alpha } from '@mui/material/styles';

export const getTheme = () => {
  // Modern color palette options (choose one set or mix and match)
  
  // Option 1: Deep Purple & Teal (your original but enhanced)
  // const primaryColor = '#7c4dff';
  // const secondaryColor = '#18ffff';
  
  // Option 2: Modern Cyber (vibrant purple with electric blue)
  // const primaryColor = '#8A2BE2'; // Blue violet
  // const secondaryColor = '#00DDFF'; // Electric blue
  
  // Option 3: Sophisticated Dark (deep indigo with mint)
  // const primaryColor = '#6366F1'; // Indigo
  // const secondaryColor = '#0D9488'; // Teal
  
  // Option 4: Contemporary Gradient (purple to pink)
  const primaryColor = '#8B5CF6'; // Purple-500
  const secondaryColor = '#EC4899'; // Pink-500
  
  // Option 5: Muted Professional (slate with coral)
  // const primaryColor = '#475569'; // Slate-600
  // const secondaryColor = '#F97316'; // Orange-500
  
  const backgroundGradient = 'linear-gradient(135deg, #0F0F13 0%, #1A1B23 50%, #16161D 100%)';
  
  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: primaryColor,
        light: alpha(primaryColor, 0.7),
        dark: alpha(primaryColor, 0.9),
      },
      secondary: {
        main: secondaryColor,
        light: alpha(secondaryColor, 0.7),
        dark: alpha(secondaryColor, 0.9),
      },
      background: {
        default: 'rgba(15, 15, 19, 0.95)',
        paper: 'rgba(26, 27, 35, 0.75)',
        glass: 'rgba(35, 35, 45, 0.5)',
        highlight: alpha(primaryColor, 0.15),
      },
      text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.8)',
        glass: 'rgba(255, 255, 255, 0.9)',
        accent: secondaryColor,
      },
      divider: 'rgba(255, 255, 255, 0.12)',
      gradients: {
        primary: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        background: backgroundGradient,
        glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: [
      'none',
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      ...Array(19).fill('none'),
      '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
      '0 25px 50px 0 rgba(0, 0, 0, 0.5)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: backgroundGradient,
            backgroundAttachment: 'fixed',
            '&::before': {
              content: '""',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              zIndex: -1,
            },
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(primaryColor, 0.4)} transparent`,
          },
          '*::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '*::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '*::-webkit-scrollbar-thumb': {
            background: alpha(primaryColor, 0.4),
            borderRadius: 4,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: alpha(primaryColor, 0.6),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            background: 'rgba(26, 27, 35, 0.75)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundImage: 'none',
          },
        },
        defaultProps: {
          elevation: 0,
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            background: 'rgba(26, 27, 35, 0.85)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
          },
        },
        defaultProps: {
          elevation: 0,
          color: 'transparent',
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.15)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 20px 0 ${alpha(primaryColor, 0.25)}`,
            },
          },
          contained: {
            background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${alpha(primaryColor, 0.9)}, ${alpha(secondaryColor, 0.9)})`,
            },
          },
          outlined: {
            borderWidth: 2,
            borderColor: alpha(primaryColor, 0.3),
            color: primaryColor,
            '&:hover': {
              borderWidth: 2,
              borderColor: primaryColor,
              backgroundColor: alpha(primaryColor, 0.05),
            },
          },
          text: {
            '&:hover': {
              backgroundColor: alpha(primaryColor, 0.1),
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              borderRadius: 12,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                borderColor: alpha(primaryColor, 0.5),
              },
              '&.Mui-focused': {
                borderColor: primaryColor,
                boxShadow: `0 0 0 2px ${alpha(primaryColor, 0.2)}`,
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            background: 'rgba(35, 35, 45, 0.6)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 40px 0 ${alpha(primaryColor, 0.2)}`,
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            background: 'rgba(30, 30, 40, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(primaryColor, 0.2),
              transform: 'scale(1.1)',
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '4px 8px',
            '&:hover': {
              backgroundColor: alpha(primaryColor, 0.1),
            },
            '&.Mui-selected': {
              backgroundColor: alpha(primaryColor, 0.2),
              '&:hover': {
                backgroundColor: alpha(primaryColor, 0.3),
              },
            },
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        backgroundClip: 'text',
        textFillColor: 'transparent',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      h2: {
        fontWeight: 700,
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        backgroundClip: 'text',
        textFillColor: 'transparent',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 600,
      },
    },
  });
};