import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { AuthProvider, useAuth } from './context/AuthContext';
import { getTheme } from './themes/theme';
import Layout from './components/Layout/Layout';

// Lazy loaded components
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Keys = lazy(() => import('./pages/Key'));
const GenerateKeys = lazy(() => import('./pages/Generate'));
const Transactions = lazy(() => import('./pages/Transactions'));
const ProviderPlans = lazy(() => import('./pages/ProviderPlans'));
const UploadKey = lazy(() => import('./pages/UploadKey'));
const Users = lazy(() => import('./pages/Users'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const UnsoldKeys = lazy(() => import('./pages/UnsoldKeys'));
const InstallPWA = lazy(() => import('./pages/InstallPWA'));
const ResetKey = lazy(() => import("./pages/ResetKey"));
const MyBonus = lazy(()=> import("./pages/MyBonus"));
const BonusList = lazy(()=> import("./pages/BonusList"));
const CreateReferral = lazy(()=> import("./pages/CreateReferral"))






// const Analytics = lazy(() => import('./pages/Analytics'));
// const Profile = lazy(() => import('./pages/Profile'));
// const Settings = lazy(() => import('./pages/Settings'));


// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
          <h2>Something went wrong.</h2>
          <p>Try reloading the page.</p>
        </Box>
      );
    }
    return this.props.children;
  }
}

// Loading fallback component
const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" />;
};

// Public Route Wrapper
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  const theme = getTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />

                <Route path="/download-app" element={
                  <PublicRoute>
                      <InstallPWA />
                   
                  </PublicRoute>
                } />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/keys" element={
                  <ProtectedRoute>
                    <Layout>
                      <Keys />
                    </Layout>
                  </ProtectedRoute>
                } />



              <Route path="/transactions" element={
                  <ProtectedRoute>
                    <Layout>
                      <Transactions />
                    </Layout>
                  </ProtectedRoute>
                } />


                    <Route path="/provider-plans" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProviderPlans />
                    </Layout>
                  </ProtectedRoute>
                } />
                  
               <Route path="/upload-keys" element={
                    <ProtectedRoute>
                    <Layout>
                      <UploadKey />
                    </Layout>
                    </ProtectedRoute>
                } />

                  <Route path="/reset-key" element={
                    <ProtectedRoute>
                    <Layout>
                      <ResetKey />
                    </Layout>
                    </ProtectedRoute>
                } />

                

                  <Route path="/users" element={
                    <ProtectedRoute>
                    <Layout>
                      <Users />
                    </Layout>
                    </ProtectedRoute>
                } />

                

                        <Route path="/user-profile/:userId" element={
                    <ProtectedRoute>
                    <Layout>
                      <UserProfile />
                    </Layout>
                    </ProtectedRoute>
                } />

                 <Route path="/generate-keys" element={
                  <ProtectedRoute>
                    <Layout>
                      <GenerateKeys />
                    </Layout>
                  </ProtectedRoute>
                } />

                   <Route path="/change-password" element={
                  <ProtectedRoute>
                    <Layout>
                      <ChangePassword />
                    </Layout>
                  </ProtectedRoute>
                } />

                    <Route path="/unsold-keys" element={
                  <ProtectedRoute>
                    <Layout>
                      <UnsoldKeys />
                    </Layout>
                  </ProtectedRoute>
                } />


                <Route path="/my-bonus" element={
                  <ProtectedRoute>
                    <Layout>
                      <MyBonus />
                    </Layout>
                  </ProtectedRoute>
                } />

                  <Route path="/bonus-list" element={
                  <ProtectedRoute>
                    <Layout>
                      <BonusList />
                    </Layout>
                  </ProtectedRoute>
                } />


                   <Route path="/create-ref" element={
                  <ProtectedRoute>
                    <Layout>
                      <CreateReferral />
                    </Layout>
                  </ProtectedRoute>
                } />
                
              



             
                <Route path="/" element={<Navigate to="/dashboard" />} />

                {/* 404 Not Found */}
                <Route path="*" element={
                  <ProtectedRoute>
                    <Layout>
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <h1>404 - Page Not Found</h1>
                        <p>The page you're looking for doesn't exist.</p>
                      </Box>
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
