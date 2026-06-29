import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Rocket, LogOut, Menu, X, Compass, Award, Shield, Users, BarChart3, Moon, Sun, Landmark, Network,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold shadow-sm'
        : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`;

  const mobileNavLinkClass = (path) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400'
    }`;

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/learning', label: 'Learning' },
    { to: '/recommendations', label: 'Recommendations', icon: Compass },
    { to: '/networking', label: 'Networking', icon: Network },
    { to: '/schemes', label: 'Schemes & Funding', icon: Landmark },
    { to: '/mentors', label: 'Mentors', icon: Users },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/ai-mentor', label: 'AI Mentor' },
  ];

  if (user && user.role === 'admin') {
    userLinks.push({ to: '/admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <nav className="sticky top-0 z-50 glass dark:dark-glass border-b border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-100 group-hover:scale-105 transition-all duration-300">
                <Rocket className="w-5 h-5 animate-pulse" />
              </div>
              <span className="font-outfit text-xl font-bold bg-gradient-to-r from-primary-700 via-primary-800 to-secondary-700 bg-clip-text text-transparent tracking-tight">
                EntreSkill<span className="font-medium text-slate-700 dark:text-slate-300">Hub</span>
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            {user && userLinks.map((link) => (
              <Link key={link.to} to={link.to} className={navLinkClass(link.to)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-full">
                  {user.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-secondary-500" />
                  ) : user.role === 'mentor' ? (
                    <Award className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Compass className="w-4 h-4 text-primary-500" />
                  )}
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">{user.role}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-100 rounded-lg text-sm font-medium transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg text-sm font-medium shadow-md transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden space-x-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass dark:dark-glass border-b border-slate-100 dark:border-slate-800 px-2 pt-2 pb-4 space-y-1">
          <Link to="/" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/')}>Home</Link>
          {user && userLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)} className={mobileNavLinkClass(link.to)}>
              {link.label}
            </Link>
          ))}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 px-2">
            {user ? (
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-base font-medium transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="w-full text-center py-2.5 text-sm font-medium bg-primary-600 text-white rounded-lg">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
