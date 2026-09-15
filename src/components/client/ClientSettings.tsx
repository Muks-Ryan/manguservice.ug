import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Save, CheckCircle2, Shield, Bell } from 'lucide-react';
import { User as UserType } from '../../types';
import { authService } from '../../services/authService';

interface ClientSettingsProps {
  user: UserType;
  onUserUpdate: (updatedUser: UserType) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ClientSettings: React.FC<ClientSettingsProps> = ({
  user,
  onUserUpdate,
  onShowToast,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '+256 ');
  const [town, setTown] = useState(user.town || 'Kampala');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Validation Error', 'Full Name cannot be empty.', 'error');
      return;
    }

    try {
      setLoading(true);
      const updated = await authService.updateProfile(user.id, {
        name,
        phone,
        town,
      });
      onUserUpdate(updated);
      setSavedSuccess(true);
      onShowToast('Settings Saved', 'Your client profile has been updated.', 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      onShowToast('Update Failed', err.message || 'Could not update settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Client Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your contact information and preferences for service requests across Uganda.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-xs">
        {/* Personal Details Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span>Profile Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <span className="text-[10px] text-slate-400 mt-1 block">Account identifier cannot be altered</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>Contact Phone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 700 000 000"
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>Default Town / District</span>
              </label>
              <input
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                placeholder="e.g. Kampala, Entebbe, Jinja"
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Account Info Box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Role: Verified Client</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Authorized to view contact channels and hire licensed technicians.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 uppercase">
            Active
          </span>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Saved successfully!
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
