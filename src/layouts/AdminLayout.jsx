import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, isMock } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  MessageSquare, 
  Users, 
  FolderOpen, 
  Settings, 
  LogOut, 
  ArrowLeft,
  Code,
  Bell
} from 'lucide-react';

const AdminLayout = () => {
  const { userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error("Admin logout failed:", error);
    }
  };

  // Listen for unread messages from clients to show badge count in sidebar
  useEffect(() => {
    if (isMock) {
      // Setup a periodic check or default mock value
      setUnreadChatCount(2); // Mock count for demo
      return;
    }

    const chatsQuery = query(
      collection(db, 'chats'), 
      where('sender', '==', 'client'), 
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      // Find number of unique client conversations that have unread messages
      const uniqueUsers = new Set();
      snapshot.forEach((doc) => {
        const msg = doc.data();
        if (msg.userId) {
          uniqueUsers.add(msg.userId);
        }
      });
      setUnreadChatCount(uniqueUsers.size);
    }, (error) => {
      console.error("Error listening to unread chats:", error);
    });

    return unsubscribe;
  }, []);

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Invoices', path: '/admin/invoices', icon: Receipt },
    { 
      name: 'Chats', 
      path: '/admin/chat', 
      icon: MessageSquare, 
      badge: unreadChatCount > 0 ? unreadChatCount : null 
    },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Portfolio CMS', path: '/admin/portfolio', icon: FolderOpen },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Helper to determine active page name
  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Admin Panel';
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        
        {/* Brand Header */}
        <div className="h-16 border-b border-gray-100 flex items-center px-6 gap-2.5 bg-white">
          <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="admin-logo-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1A56DB" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <linearGradient id="admin-logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <path d="M32 25 L12 50 L32 75" stroke="url(#admin-logo-primary)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M68 25 L88 50 L68 75" stroke="url(#admin-logo-primary)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M58 15 L42 85" stroke="url(#admin-logo-accent)" strokeWidth="9" strokeLinecap="round" />
            <path d="M50 38 L56 50 L50 62 L44 50 Z" fill="url(#admin-logo-accent)" />
          </svg>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-sm text-gray-900 tracking-tight leading-none">DevCraft Admin</span>
            <span className="text-[9px] text-primary-600 font-bold uppercase tracking-wider mt-0.5">Control Panel</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={
                  `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-premium' 
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-primary-600' : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
              AB
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-gray-800 truncate">{userData?.name || 'Amar Biswas'}</span>
              <span className="text-[10px] text-gray-400 truncate">{userData?.email || 'amar@devcraft.studio'}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link 
              to="/" 
              className="flex-grow flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-[11px] font-bold transition-all"
            >
              <ArrowLeft size={12} />
              <span>View Site</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-red-100 bg-white hover:bg-red-50 text-red-500 text-[11px] font-bold transition-all flex items-center justify-center"
              title="Logout Admin"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Panel */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-display font-bold text-lg text-gray-800">{getPageTitle()}</h2>
          
          <div className="flex items-center gap-4">
            {/* Quick Unread Chats Indicator */}
            {unreadChatCount > 0 && (
              <Link 
                to="/admin/chat" 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative transition-colors"
                title="Unread Messages"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              </Link>
            )}
            
            <div className="h-6 w-px bg-gray-200"></div>
            
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Live Control</span>
            </span>
          </div>
        </header>

        {/* Sub-page Body Container */}
        <main className="flex-grow overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
