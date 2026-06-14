import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protect routes that require user authentication (e.g. client profile, order page)
export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Protect routes that require Admin access (e.g. /admin/*)
export const AdminRoute = ({ children }) => {
  const { currentUser, userData, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // PRD: No user can access /admin - it redirects to /admin/login if not authenticated as admin
  if (!currentUser || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

// Redirect logged-in users away from auth pages (login, signup) to profile
export const GuestRoute = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (currentUser) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/profile" replace />;
  }

  return children;
};
