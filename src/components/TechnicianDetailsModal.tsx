import React from 'react';
import {
  X,
  Pencil,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  Calendar,
  Clock,
} from 'lucide-react';
import { Technician } from '../types';

interface TechnicianDetailsModalProps {
  technician: Technician | null;
  onClose: () => void;
  onEdit: (tech: Technician) => void;
}

export const TechnicianDetailsModal: React.FC<TechnicianDetailsModalProps> = ({
  technician,
  onClose,
  onEdit,
}) => {
  if (!technician) return null;

  const getStatusBadge = (status: Technician['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            Available Now
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
            Active
          </span>
        );
      case 'Busy':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            Busy on Job
          </span>
        );
      case 'Inactive':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {technician.name}
              </h2>
              {getStatusBadge(technician.status)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              ID: {technician.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Key attributes grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                Trade Specialization
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {technician.trade}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Location
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {technician.town}, Uganda
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Standard Rate
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {technician.hourlyRateUgx.toLocaleString()} UGX/hr
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Registered On
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {new Date(technician.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Direct Contact
            </span>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium">{technician.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium">{technician.email}</span>
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Bio & Experience
            </span>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              {technician.bio}
            </p>
          </div>

          {/* Timestamps */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated: {new Date(technician.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(technician);
            }}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Technician</span>
          </button>
        </div>
      </div>
    </div>
  );
};
