import React from 'react';
import { Rocket, Mail, Globe, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white">
                <Rocket className="w-4 h-4" />
              </div>
              <span className="font-outfit text-lg font-bold text-white tracking-tight">
                EntreSkill<span className="text-primary-400">Hub</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering individuals to convert their practical skills—from tailoring and handicrafts to food prep and digital services—into thriving, sustainable micro-businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-primary-400 transition-colors">Features</a>
              </li>
              <li>
                <a href="#about" className="hover:text-primary-400 transition-colors">About Us</a>
              </li>
              <li>
                <a href="/register" className="hover:text-primary-400 transition-colors">Register as Mentor</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>support@entreskillhub.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-primary-400" />
                <span>www.entreskillhub.com</span>
              </li>
              <li className="flex items-center space-x-2 text-xs text-slate-500 pt-2 border-t border-slate-800">
                <Shield className="w-3.5 h-3.5" />
                <span>Secure Sprint 1 Sandbox</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} EntreSkill Hub. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
