import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AuthNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}

export const AuthNavigation: React.FC<AuthNavigationProps> = ({ canGoBack, canGoForward, onBack, onForward }) => (
  <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
    <button type="button" onClick={onBack} disabled={!canGoBack} aria-label="Go back" title="Go back" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-300 dark:hover:bg-slate-800">
      <ArrowLeft className="h-3.5 w-3.5" /> Back
    </button>
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</span>
    <button type="button" onClick={onForward} disabled={!canGoForward} aria-label="Go forward" title="Go forward" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-300 dark:hover:bg-slate-800">
      Forward <ArrowRight className="h-3.5 w-3.5" />
    </button>
  </div>
);
