import React, { useState } from 'react';
import { ShieldCheck, LogIn, AlertCircle, Lock, User, Wrench } from 'lucide-react';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onSwitchToUserPortal: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onSwitchToUserPortal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    try {
      setLoading(true);
      await authService.login(email, password, 'admin', rememberMe);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Administrative verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center font-bold shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-3 h-3" />
            <span>AUTHORISED ACCESS ONLY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            System Administration
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Full control panel for managing technician records, directory moderation, and platform settings.
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mangu.ug"
              required
              className="w-full bg-slate-800/90 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Security Key / Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-800/90 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="accent-emerald-500" />Show password</label>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-emerald-500" />
            <span>Remember me</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Verifying Credentials...' : 'Authenticate as Admin'}</span>
          </button>
        </form>

        {/* Return to User Portal */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onSwitchToUserPortal}
            className="hover:text-white inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium transition-colors"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-500">/</span>
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>&larr; Return to User Portal (Client &amp; Technician)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
