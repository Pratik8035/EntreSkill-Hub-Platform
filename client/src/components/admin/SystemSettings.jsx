import React, { useState } from 'react';
import {
  Settings, Shield, Bell, Globe, Database, Palette,
  ChevronRight, CheckCircle, Info
} from 'lucide-react';
import useAdminDashboard from '../../hooks/useAdminDashboard';

const SettingRow = ({ label, description, children }) => (
  <div className="flex items-start justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
    <div className="flex-1 pr-8">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
      enabled ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
    }`}
    role="switch"
    aria-checked={enabled}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        enabled ? 'translate-x-5' : 'translate-x-1'
      }`}
    />
  </button>
);

const SystemSettings = () => {
  const { stats, loading } = useAdminDashboard();

  // Settings state (UI only — persisting these would require a settings API)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    maintenanceMode: false,
    publicRegistration: true,
    adminApprovalRequired: false,
    darkModeDefault: false,
    analyticsEnabled: true,
    rateLimitingEnabled: true,
    emailVerificationRequired: true,
  });

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      {/* Platform Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
            <Database className="w-4.5 h-4.5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-outfit text-sm font-extrabold text-slate-900 dark:text-white">Platform Status</h3>
            <p className="text-[11px] text-slate-400">Live system metrics snapshot</p>
          </div>
        </div>
        {loading ? (
          <p className="text-xs text-slate-400 animate-pulse">Loading platform metrics...</p>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'text-primary-600' },
              { label: 'Total Courses', value: stats.totalCourses, color: 'text-indigo-600' },
              { label: 'Certificates Issued', value: stats.totalCertificates, color: 'text-amber-600' },
              { label: 'Business Goals', value: stats.totalGoals, color: 'text-emerald-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 text-center">
                <div className={`font-outfit text-2xl font-extrabold ${color}`}>{value ?? '—'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No platform data available.</p>
        )}
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h3 className="font-outfit text-sm font-extrabold text-slate-900 dark:text-white">Security & Access</h3>
            <p className="text-[11px] text-slate-400">Authentication and access control policies</p>
          </div>
        </div>
        <SettingRow
          label="Public Registration"
          description="Allow new users to register on the platform without an invite"
        >
          <Toggle enabled={settings.publicRegistration} onChange={() => toggle('publicRegistration')} />
        </SettingRow>
        <SettingRow
          label="Admin Approval Required"
          description="New accounts require administrator approval before activation"
        >
          <Toggle enabled={settings.adminApprovalRequired} onChange={() => toggle('adminApprovalRequired')} />
        </SettingRow>
        <SettingRow
          label="Email Verification Required"
          description="Users must verify their email before accessing the platform"
        >
          <Toggle enabled={settings.emailVerificationRequired} onChange={() => toggle('emailVerificationRequired')} />
        </SettingRow>
        <SettingRow
          label="Rate Limiting Enabled"
          description="Protect endpoints from abuse with request rate limits"
        >
          <Toggle enabled={settings.rateLimitingEnabled} onChange={() => toggle('rateLimitingEnabled')} />
        </SettingRow>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-outfit text-sm font-extrabold text-slate-900 dark:text-white">Notifications</h3>
            <p className="text-[11px] text-slate-400">Email and in-app notification preferences</p>
          </div>
        </div>
        <SettingRow
          label="Email Notifications"
          description="Send transactional emails for key platform events"
        >
          <Toggle enabled={settings.emailNotifications} onChange={() => toggle('emailNotifications')} />
        </SettingRow>
      </div>

      {/* System Settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Settings className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h3 className="font-outfit text-sm font-extrabold text-slate-900 dark:text-white">System Configuration</h3>
            <p className="text-[11px] text-slate-400">Platform behavior and feature toggles</p>
          </div>
        </div>
        <SettingRow
          label="Maintenance Mode"
          description="Put the platform in maintenance mode — only admins can access it"
        >
          <Toggle enabled={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} />
        </SettingRow>
        <SettingRow
          label="Analytics Enabled"
          description="Collect platform usage analytics and generate reports"
        >
          <Toggle enabled={settings.analyticsEnabled} onChange={() => toggle('analyticsEnabled')} />
        </SettingRow>
      </div>

      {/* Info Notice */}
      <div className="flex items-start space-x-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/30 rounded-2xl p-4">
        <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-sky-700 dark:text-sky-400">
          Settings shown here reflect platform configuration toggles. Some changes require a server restart or config update to take full effect.
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;
