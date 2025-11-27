import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AppsPage from './pages/AppsPage';
import AppDetailPage from './pages/AppDetailPage';
import TemplatesPage from './pages/TemplatesPage';
import JourneyBuilderPage from './pages/JourneyBuilderPage';
import MessagesPage from './pages/MessagesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import WalletPage from './pages/WalletPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Store
import { useAuthStore } from './store/authStore';

function App() {
  const { initAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/apps" element={<AppsPage />} />
                  <Route path="/apps/:appId" element={<AppDetailPage />} />
                  <Route path="/apps/:appId/templates" element={<TemplatesPage />} />
                  <Route path="/apps/:appId/journey-builder" element={<JourneyBuilderPage />} />
                  <Route path="/apps/:appId/journeys/:journeyId" element={<JourneyBuilderPage />} />
                  <Route path="/apps/:appId/messages" element={<MessagesPage />} />
                  <Route path="/apps/:appId/analytics" element={<AnalyticsPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
