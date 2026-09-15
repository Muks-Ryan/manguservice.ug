import React from 'react';
import { User, Wrench, ShieldCheck, Sun, Moon } from 'lucide-react';

interface AuthSwitchBarProps {
  activePortal: 'user' | 'admin';
  onSelectPortal: (portal: 'user' | 'admin') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AuthSwitchBar: React.FC<AuthSwitchBarProps> = ({
  activePortal,
  onSelectPortal,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Portals toggle */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Portal:
          </span>
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Combined User Portal: Client & Technician */}
            <button
              onClick={() => onSelectPortal('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activePortal === 'user'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center -space-x-1">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span>User Sign In (Client &amp; Technician)</span>
            </button>

            {/* Separated Admin Portal */}
            <button
              onClick={() => onSelectPortal('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activePortal === 'admin'
                  ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-xs border border-emerald-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Right: Quick actions (download database.sql, theme toggle) */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <a
            href="/database.sql"
            download="database.sql"
            className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:underline inline-flex items-center gap-1"
          >
            <span>database.sql</span>
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
