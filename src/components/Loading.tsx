import React from 'react';
import { Wrench } from 'lucide-react';

export const AppLoader: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
    <div className="relative flex h-16 w-16 items-center justify-center">
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500 dark:border-slate-800 dark:border-t-amber-400" />
      <Wrench className="h-6 w-6 text-amber-500 dark:text-amber-400" />
    </div>
    <p className="text-sm font-semibold">Loading Mangu Service...</p>
  </div>
);

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-6" aria-label="Loading page" aria-busy="true">
    <div className="rounded-3xl bg-slate-200 p-6 dark:bg-slate-800 sm:p-8"><SkeletonBlock className="h-4 w-36 bg-slate-300 dark:bg-slate-700" /><SkeletonBlock className="mt-4 h-8 w-2/3 bg-slate-300 dark:bg-slate-700" /><SkeletonBlock className="mt-3 h-4 w-full max-w-xl bg-slate-300 dark:bg-slate-700" /></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /></div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"><SkeletonBlock className="h-56" /><SkeletonBlock className="h-56" /><SkeletonBlock className="h-56" /></div>
  </div>
);
