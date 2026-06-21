import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Lock, Mail, AlertCircle, ArrowRight, Compass, Award } from 'lucide-react';

const Register = () => {
  const { register, error, setError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard States: 'role_selection' or 'form_details'
  const [step, setStep] = useState('role_selection');
  const [role, setRole] = useState('user'); // default role is 'user' (Entrepreneur)

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read role from query param on mount if present
  useEffect(() => {
    setError(null);
    const roleParam = searchParams.get('role');
    if (roleParam && ['user', 'mentor'].includes(roleParam)) {
      setRole(roleParam);
      setStep('form_details');
    }
  }, [searchParams, setError]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep('form_details');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Input Validations
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all details.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 relative">
      {/* Decorative gradient blur */}
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-secondary-200 rounded-full blur-[100px] opacity-20 -z-10 animate-pulse"></div>

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-8 space-y-6 relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

        {/* Step 1: Role Selection Wizard */}
        {step === 'role_selection' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Your Account
              </h2>
              <p className="text-sm text-slate-500">
                Choose how you want to participate on EntreSkill Hub.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Option A: Entrepreneur */}
              <button
                type="button"
                onClick={() => handleRoleSelect('user')}
                className="w-full text-left p-5 border border-slate-200 hover:border-primary-500 hover:bg-primary-50/20 rounded-2xl flex items-start space-x-4 transition-all group cursor-pointer"
              >
                <div className="bg-primary-50 text-primary-600 p-3 rounded-xl group-hover:bg-primary-100 transition-colors">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="font-outfit text-base font-bold text-slate-950 flex items-center">
                    <span>Entrepreneur / Individual</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary-600" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    I want to list my skills, match with micro-business concepts, and follow structured roadmaps.
                  </p>
                </div>
              </button>

              {/* Option B: Mentor */}
              <button
                type="button"
                onClick={() => handleRoleSelect('mentor')}
                className="w-full text-left p-5 border border-slate-200 hover:border-secondary-500 hover:bg-secondary-50/10 rounded-2xl flex items-start space-x-4 transition-all group cursor-pointer"
              >
                <div className="bg-secondary-50 text-secondary-600 p-3 rounded-xl group-hover:bg-secondary-100 transition-colors">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="font-outfit text-base font-bold text-slate-955 flex items-center">
                    <span>Mentor / Trainer</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-secondary-600" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    I want to guide emerging entrepreneurs, offer templates, and track development milestones.
                  </p>
                </div>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:underline font-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Form Fields */}
        {step === 'form_details' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStep('role_selection')}
                className="text-xs text-slate-500 hover:text-primary-600 font-semibold flex items-center cursor-pointer"
              >
                ← Back
              </button>
              <div className="h-4 w-px bg-slate-200"></div>
              <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full capitalize font-semibold">
                {role === 'user' ? 'Entrepreneur' : 'Mentor'} Role
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="font-outfit text-2xl font-extrabold text-slate-900 tracking-tight">
                Enter Your Details
              </h2>
              <p className="text-xs text-slate-500">
                Set up your login credentials below.
              </p>
            </div>

            {validationError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium shadow-md shadow-primary-100 hover:shadow-lg hover:shadow-primary-200 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Register Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
