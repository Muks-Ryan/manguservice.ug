import React from 'react';
import { X, Phone, Mail, MapPin, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { Technician } from '../../types';

interface ContactTechnicianModalProps {
  technician: Technician | null;
  onClose: () => void;
}

export const ContactTechnicianModal: React.FC<ContactTechnicianModalProps> = ({ technician, onClose }) => {
  if (!technician) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              {technician.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{technician.name}</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{technician.trade}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Location:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{technician.town}, Uganda</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Standard Rate:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              UGX {technician.hourlyRateUgx.toLocaleString()} / hr
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Status:
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                technician.status === 'Available'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {technician.status}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Direct Contact Channels:</p>

          <a
            href={`tel:${technician.phone}`}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Call: {technician.phone}</span>
            </div>
            <span className="text-[11px] font-bold bg-emerald-600 text-white px-2 py-1 rounded-md">Dial Now</span>
          </a>

          <a
            href={`mailto:${technician.email}?subject=Mangu%20Service%20Inquiry`}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>Email: {technician.email}</span>
            </div>
            <span className="text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md">
              Send Email
            </span>
          </a>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
