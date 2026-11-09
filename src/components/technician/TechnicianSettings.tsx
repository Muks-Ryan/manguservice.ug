import React, { useState } from 'react';
import { Wrench, Phone, MapPin, DollarSign, FileText, Save, CheckCircle2, Shield } from 'lucide-react';
import { Technician, User } from '../../types';
import { technicianService, TRADES } from '../../services/technicianService';
import { authService } from '../../services/authService';

interface TechnicianSettingsProps {
  user: User;
  technician: Technician | null;
  onRefreshData: () => Promise<void>;
  onUserUpdate: (updatedUser: User) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TechnicianSettings: React.FC<TechnicianSettingsProps> = ({
  user,
  technician,
  onRefreshData,
  onUserUpdate,
  onShowToast,
}) => {
  const [name, setName] = useState(technician?.name || user.name);
  const [trade, setTrade] = useState(technician?.trade || 'Electrical');
  const [phone, setPhone] = useState(technician?.phone || user.phone || '+256 ');
  const [town, setTown] = useState(technician?.town || user.town || 'Kampala');
  const [hourlyRateUgx, setHourlyRateUgx] = useState(technician?.hourlyRateUgx || 30000);
  const [bio, setBio] = useState(technician?.bio || '');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technician) {
      onShowToast('Profile unavailable', 'Your account is not linked to a technician record. Please contact an administrator.', 'error');
      return;
    }
    if (!name.trim() || !phone.trim() || !town.trim() || !bio.trim()) {
      onShowToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    try {
      setLoading(true);

      // 1. Update Technician record in directory
      if (technician) {
        await technicianService.update(technician.id, {
          name,
          trade,
          phone,
          town,
          hourlyRateUgx: Number(hourlyRateUgx),
          bio,
        });
      }

      // 2. Update user profile
      const updatedUser = await authService.updateProfile(user.id, {
        name,
        phone,
        town,
      });
      onUserUpdate(updatedUser);

      await onRefreshData();
      setSavedSuccess(true);
      onShowToast('Settings Saved', 'Technician settings and service rates saved successfully.', 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      onShowToast('Save Error', err.message || 'Could not save technician settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Technician Profile & Service Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your publicly visible trade category, hourly rates, service area, and direct contact line.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-xs">
        {/* Trade & Rate Details */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            <span>Service & Rates</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Technician Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Trade Specialty
              </label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {TRADES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Hourly Rate (UGX)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={hourlyRateUgx}
                onChange={(e) => setHourlyRateUgx(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Base Town / District</span>
              </label>
              <input
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                placeholder="e.g. Kampala, Entebbe, Jinja"
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Direct Contact Phone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Bio & Experience Overview</span>
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your trade certifications, equipment, years of experience, and typical job assignments..."
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Verification Status */}
        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Technician account</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Your directory status is {technician?.status || 'not linked'}.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 uppercase">
            {technician?.status || 'Not linked'}
          </span>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
