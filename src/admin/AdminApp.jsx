import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Enquiries from './pages/Enquiries';
import FleetManager from './pages/FleetManager';
import ServicesManager from './pages/ServicesManager';
import DayTripsManager from './pages/DayTripsManager';
import BlogsManager from './pages/BlogsManager';
import PagesManager from './pages/PagesManager';
import MediaLibrary from './pages/MediaLibrary';
import ReviewsManager from './pages/ReviewsManager';
import TranslationsManager from './pages/TranslationsManager';
import SeoManager from './pages/SeoManager';
import UsersManager from './pages/UsersManager';
import SettingsManager from './pages/SettingsManager';

function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7F4' }}>
        <div style={{ textAlign: 'center', color: '#C69C50', fontFamily: 'serif', fontSize: '1.2rem' }}>
          Verifying Vienna Day Trip Authorization...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role && user?.role !== 'SUPER_ADMIN') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Access Restricted</h2>
        <p>Your current role does not have permission to view this administrative screen.</p>
      </div>
    );
  }

  return children;
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="enquiries"
          element={
            <ProtectedRoute>
              <Enquiries />
            </ProtectedRoute>
          }
        />
        <Route
          path="fleet"
          element={
            <ProtectedRoute>
              <FleetManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="services"
          element={
            <ProtectedRoute>
              <ServicesManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="day-trips"
          element={
            <ProtectedRoute>
              <DayTripsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="blogs"
          element={
            <ProtectedRoute>
              <BlogsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="pages"
          element={
            <ProtectedRoute>
              <PagesManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="media"
          element={
            <ProtectedRoute>
              <MediaLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="reviews"
          element={
            <ProtectedRoute>
              <ReviewsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="translations"
          element={
            <ProtectedRoute>
              <TranslationsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="seo"
          element={
            <ProtectedRoute>
              <SeoManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <UsersManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <SettingsManager />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
