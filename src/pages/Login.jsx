import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Code } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect page after login
  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      // Simplify Firebase error messages for user-friendly display
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Failed to sign in. Please verify your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="w-full max-w-md bg-white border border-gray-150 rounded-2xl p-8 sm:p-10 shadow-soft">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-premium">
            <Code size={20} />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-2xl text-gray-900">Sign In</h2>
            <p className="text-gray-500 text-xs sm:text-sm">Access your DevCraft Studio dashboard</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm rounded-xl font-medium mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. client@example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
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
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500 border-t border-gray-100 pt-6">
          <span>Don't have a client account? </span>
          <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-bold hover:underline">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
