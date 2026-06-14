import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Code } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      await signup(email, password, name, phone);
      navigate('/profile');
    } catch (err) {
      console.error("Signup failed:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email address is already registered.");
      } else {
        setError("Failed to create client account. Please verify details and retry.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="w-full max-w-md bg-white border border-gray-150 rounded-2xl p-8 sm:p-10 shadow-soft">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-premium">
            <Code size={20} />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-2xl text-gray-900">Create Account</h2>
            <p className="text-gray-500 text-xs sm:text-sm">Register to request quotes and track orders</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm rounded-xl font-medium mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Password (6+ chars)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold shadow-md transition-all hover:scale-[1.01] active:scale-99 pt-1"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500 border-t border-gray-100 pt-6">
          <span>Already have an account? </span>
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;
