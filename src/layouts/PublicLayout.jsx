import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowRight, User, LogOut, Code, Mail, Phone, MapPin, Globe } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import { db, isMock } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

// Custom SVG Icons because brand icons are missing in the latest Lucide bundles
const Linkedin = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const Github = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const PublicLayout = () => {
  const { currentUser, userData, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [globalSettings, setGlobalSettings] = useState({
    phone: '7047310066',
    email: 'amarbiswas@gmail.com',
    address: 'Krishnagar, West Bengal - 741163',
    socialLinks: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      whatsapp: 'https://wa.me/917047310066'
    }
  });

  useEffect(() => {
    if (isMock) {
      const stored = localStorage.getItem('mock_global_settings');
      if (stored) {
        setGlobalSettings(JSON.parse(stored));
      }
      return;
    }
    const docRef = doc(db, 'settings', 'global');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setGlobalSettings(docSnap.data());
      }
    }, (error) => {
      console.warn("Could not retrieve global settings from Firestore, using default.");
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <svg className="w-9 h-9 transition-transform group-hover:scale-105" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="header-logo-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1A56DB" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                  <linearGradient id="header-logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <path d="M32 25 L12 50 L32 75" stroke="url(#header-logo-primary)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M68 25 L88 50 L68 75" stroke="url(#header-logo-primary)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M58 15 L42 85" stroke="url(#header-logo-accent)" strokeWidth="9" strokeLinecap="round" />
                <path d="M50 38 L56 50 L50 62 L44 50 Z" fill="url(#header-logo-accent)" />
              </svg>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg text-gray-900 leading-none tracking-tight">DevCraft</span>
                <span className="text-[9px] text-primary-600 font-bold uppercase tracking-widest mt-0.5">Studio</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `font-medium text-sm transition-colors hover:text-primary-600 ${
                      isActive ? 'text-primary-600 border-b-2 border-primary-600 py-1' : 'text-gray-600'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Auth CTAs */}
            <div className="hidden md:flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={userData?.role === 'admin' ? '/admin' : '/profile'}
                    className="flex items-center gap-2 px-4 h-10 rounded-full bg-primary-50 text-primary-600 border border-primary-100 hover:bg-primary-100 text-sm font-semibold transition-all shadow-sm"
                  >
                    <User size={16} />
                    <span>{userData?.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary-600 text-sm font-semibold px-3 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/order"
                    className="flex items-center gap-1.5 px-5 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-premium hover:shadow-lg"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-gray-100 my-3" />
            {currentUser ? (
              <div className="space-y-2">
                <Link
                  to={userData?.role === 'admin' ? '/admin' : '/profile'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary-50 text-primary-600 text-sm font-semibold transition-all"
                >
                  <User size={16} />
                  <span>{userData?.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 text-sm font-semibold transition-all"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Page Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Branding Column */}
            <div className="flex flex-col gap-4">
              <Link to="/" className="flex items-center gap-2.5 group">
                <svg className="w-8 h-8 transition-transform group-hover:scale-105" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="footer-logo-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1A56DB" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient id="footer-logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  <path d="M32 25 L12 50 L32 75" stroke="url(#footer-logo-primary)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M68 25 L88 50 L68 75" stroke="url(#footer-logo-primary)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M58 15 L42 85" stroke="url(#footer-logo-accent)" strokeWidth="9" strokeLinecap="round" />
                  <path d="M50 38 L56 50 L50 62 L44 50 Z" fill="url(#footer-logo-accent)" />
                </svg>
                <span className="font-display font-extrabold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">DevCraft Studio</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">
                Professional bespoke web solutions for small businesses, eCommerce brands, and enterprise software.
              </p>
              <div className="flex flex-col gap-2 mt-2 text-sm text-gray-600">
                <a href={`tel:${globalSettings.phone}`} className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                  <Phone size={14} />
                  <span>+91 {globalSettings.phone}</span>
                </a>
                <span className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{globalSettings.address}</span>
                </span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div>
              <h3 className="font-display font-semibold text-gray-900 text-sm uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-gray-500 hover:text-primary-600 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/order" className="text-gray-500 hover:text-primary-600 transition-colors font-medium">
                    Order a Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services Column */}
            <div>
              <h3 className="font-display font-semibold text-gray-900 text-sm uppercase tracking-wider mb-4">Our Services</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="text-gray-500 hover:text-primary-600 transition-colors">eCommerce Store</Link></li>
                <li><Link to="/services" className="text-gray-500 hover:text-primary-600 transition-colors">CRM Custom Portals</Link></li>
                <li><Link to="/services" className="text-gray-500 hover:text-primary-600 transition-colors">CMS Platform / Blog</Link></li>
                <li><Link to="/services" className="text-gray-500 hover:text-primary-600 transition-colors">Business / Showcase Sites</Link></li>
                <li><Link to="/services" className="text-gray-500 hover:text-primary-600 transition-colors">Custom Web Applications</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="font-display font-semibold text-gray-900 text-sm uppercase tracking-wider mb-4">Legal & Policies</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="text-gray-500 hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/refund-policy" className="text-gray-500 hover:text-primary-600 transition-colors">Refund & Cancellation Policy</Link></li>
                <li><Link to="/terms" className="text-gray-500 hover:text-primary-600 transition-colors">Terms of Service</Link></li>
              </ul>
              <div className="flex gap-4 mt-6">
                <a href={globalSettings.socialLinks?.linkedin || 'https://linkedin.com'} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50 transition-all" title="LinkedIn Profile">
                  <Linkedin size={16} />
                </a>
                <a href={globalSettings.socialLinks?.github || 'https://github.com'} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50 transition-all" title="GitHub Profile">
                  <Github size={16} />
                </a>
              </div>
            </div>

          </div>

          <hr className="border-gray-100 mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} DevCraft Studio. All rights reserved.</p>
            <p>Designed and Developed by <strong className="font-semibold text-gray-600">Amar Biswas</strong></p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default PublicLayout;
