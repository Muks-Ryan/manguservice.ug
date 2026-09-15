import React, { useState } from 'react';
import { ShieldCheck, Save, Users, Database, Globe, Phone, Mail, CheckCircle2, Download } from 'lucide-react';
import { User, SystemSettings } from '../../types';
import { authService } from '../../services/authService';

interface AdminSettingsProps {
  currentUser: User;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser, onShowToast }) => {
  const initialSettings = authService.getSettings();
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load all users from localStorage to view registered accounts
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const raw = localStorage.getItem('mangu_users_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = authService.updateSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      onShowToast('Settings Saved', 'Platform configuration successfully saved.', 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      onShowToast('Error', err.message || 'Failed to update settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ADMINISTRATIVE CONFIGURATION</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System Administration & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure platform defaults, inspect user accounts, and review database connectivity.
        </p>
      </div>

      {/* Platform Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <span>Platform General Configuration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Default Currency
            </label>
            <input
              type="text"
              value={settings.defaultCurrency}
              onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>Support Contact Email</span>
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Support Telephone</span>
            </label>
            <input
              type="text"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Platform settings updated!
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* User Accounts Overview Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Registered Role Accounts ({allUsers.length})</span>
          </h2>
          <span className="text-[11px] text-slate-500">Live Role-Based Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-bold">Name</th>
                <th className="py-2.5 px-3 font-bold">Email</th>
                <th className="py-2.5 px-3 font-bold">Role</th>
                <th className="py-2.5 px-3 font-bold">Town</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    {u.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono">
                    {u.email}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200'
                          : u.role === 'technician'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {u.town || 'Kampala'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Schema File Box */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">PostgreSQL Schema & Seed Script</h4>
            <p className="text-xs text-slate-400">
              Download clean SQL ready for execution in PostgreSQL, Supabase, or DBeaver.
            </p>
          </div>
        </div>

        <a
          href="/database.sql"
          download="database.sql"
          className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download database.sql</span>
        </a>
      </div>
    </div>
  );
};
