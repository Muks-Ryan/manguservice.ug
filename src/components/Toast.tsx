import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-2xl shadow-lg border flex items-start gap-3 transition-all transform translate-y-0 ${
            t.type === 'success'
              ? 'bg-white dark:bg-slate-900 border-emerald-500/40 text-slate-800 dark:text-slate-100'
              : t.type === 'error'
              ? 'bg-white dark:bg-slate-900 border-red-500/40 text-slate-800 dark:text-slate-100'
              : 'bg-white dark:bg-slate-900 border-blue-500/40 text-slate-800 dark:text-slate-100'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold">{t.title}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.message}</p>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
