import React from 'react';
import { Users, CheckCircle2, Briefcase, DollarSign } from 'lucide-react';
import { Technician } from '../types';

interface StatsBarProps {
  technicians: Technician[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ technicians }) => {
  const total = technicians.length;
  const available = technicians.filter((t) => t.status === 'Available' || t.status === 'Active').length;
  const uniqueTrades = new Set(technicians.map((t) => t.trade)).size;
  const avgRate =
    total > 0
      ? Math.round(technicians.reduce((acc, t) => acc + (t.hourlyRateUgx || 0), 0) / total)
      : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Technicians
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {total}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available / Active
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {available}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Trades Represented
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {uniqueTrades}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Rate (UGX/hr)
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {avgRate.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
