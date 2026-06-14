import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Code, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const { login, logout, userData } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(email, password);
      
      // Let's resolve the user profile to confirm role
      // In hybrid/mock mode, this state will update instantly in context
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'amar@devcraft.studio';
      const isAuthorizedAdmin = email === adminEmail || email === '7047310066@paytm';

      if (!isAuthorizedAdmin) {
        // Log out client and block access
        await logout();
        setError("Access denied: You are not registered as an administrator.");
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error("Admin authentication error:", err);
      setError("Authentication failed. Invalid developer credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-premium relative">
        
        {/* Return Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-8 pt-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-premium">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-gray-950">Developer Console</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Sign in to DevCraft Studio admin workspace</p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm rounded-xl font-medium mb-6">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amar@devcraft.studio"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-800"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-800"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold shadow-md transition-all hover:scale-[1.01] active:scale-99"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Authorize Admin</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Tip for mock environment */}
        <div className="mt-8 p-4 bg-primary-50/50 rounded-2xl border border-primary-100 text-[10px] sm:text-xs text-gray-500 leading-relaxed">
          <span className="font-bold text-primary-700 block mb-1">Local Testing Tip:</span>
          If running with mock credentials, sign in with your configured admin email (e.g. <code className="bg-white px-1 py-0.5 rounded font-mono">amar@devcraft.studio</code>) and any password to access the panel!
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
