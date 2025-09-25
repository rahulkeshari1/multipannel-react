import React, { createContext, useContext } from 'react';

// Create a static theme object that never changes
const staticTheme = {
  darkMode: true,
  toggleTheme: () => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Theme toggle is disabled in this implementation');
    }
  }
};

// Create context with the static value
const AppThemeContext = createContext(staticTheme);

/**
 * Lightweight hook for accessing theme
 */
export const useTheme = () => {
  return useContext(AppThemeContext);
};

/**
 * Simplified ThemeProvider - just passes through children
 * since the context value is static and never changes
 */
export const ThemeProvider = ({ children }) => {
  return (
    <AppThemeContext.Provider value={staticTheme}>
      {children}
    </AppThemeContext.Provider>
  );
};

// Export the static theme for direct usage when needed
export const appTheme = staticTheme;

export default AppThemeContext;