import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Shield } from 'lucide-react';

const AdminLogin = () => {
  const { login, logout, error, setError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Clear global auth errors when component mounts
  useEffect(() => {
    setError(null);
    if (searchParams.get('session_expired') === 'true') {
      setSessionExpired(true);
    }
  }, [setError, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSessionExpired(false);

    // Form client-side validation
    if (!email || !password) {
      setValidationError('Please fill in both email and password fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      // Validate that the logged in user is actually an admin
      if (loggedInUser && loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        // Log out the user if they are not an admin to prevent unauthorized session state
        logout();
        setValidationError('Access Denied: This portal is restricted to administrators.');
        setIsSubmitting(false);
      }
    } catch (err) {
      // Error is stored globally in AuthContext and will display via useAuth
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 relative bg-slate-950 min-h-screen">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-rose-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-rose-950/5 p-8 space-y-6 relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-600 to-primary-500"></div>

        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-primary-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/10 mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">Authorized Personnel Only</span>
          <h2 className="font-outfit text-3xl font-extrabold text-white tracking-tight mt-1">
            Admin Portal
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to access the platform administration control center.
          </p>
        </div>

        {/* Notices and Alerts */}
        {sessionExpired && (
          <div className="bg-amber-950/30 border border-amber-800/50 text-amber-300 p-3.5 rounded-xl flex items-start space-x-2.5 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {validationError && (
          <div className="bg-rose-950/30 border border-rose-850 text-rose-400 p-3.5 rounded-xl flex items-start space-x-2.5 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/30 border border-rose-850 text-rose-400 p-3.5 rounded-xl flex items-start space-x-2.5 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@entreskill.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-slate-900 transition-all text-white placeholder-slate-600"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-slate-900 transition-all text-white placeholder-slate-600"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl font-medium shadow-md shadow-rose-950/20 hover:shadow-lg hover:shadow-rose-900/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-800/60 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Not an administrator?{' '}
            <Link to="/login" className="text-rose-500 hover:underline font-semibold">
              Go to User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
