import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/RouteGuards';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import Order from './pages/Order';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { PrivacyPolicy, RefundPolicy, TermsOfService } from './pages/Legal';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Invoices from './pages/admin/Invoices';
import Chat from './pages/admin/Chat';
import Users from './pages/admin/Users';
import PortfolioCMS from './pages/admin/PortfolioCMS';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="refund-policy" element={<RefundPolicy />} />
            <Route path="terms" element={<TermsOfService />} />
            
            {/* Guest Only Routes */}
            <Route path="login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
            <Route path="signup" element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            } />

            {/* Authenticated Client Routes */}
            <Route path="order" element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>

          {/* Admin Authentication */}
          <Route path="/admin/login" element={
            <GuestRoute>
              <AdminLogin />
            </GuestRoute>
          } />

          {/* Protected Admin Console Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="chat" element={<Chat />} />
            <Route path="users" element={<Users />} />
            <Route path="portfolio" element={<PortfolioCMS />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
