import React, { useState } from 'react';
import { CalendarDays, Clock, X } from 'lucide-react';
import { Technician } from '../../types';

interface BookingModalProps {
  technician: Technician | null;
  onClose: () => void;
  onSubmit: (data: { technicianId: string; serviceDescription: string; scheduledFor: string; estimatedHours: number }) => Promise<void>;
}

export const BookingModal: React.FC<BookingModalProps> = ({ technician, onClose, onSubmit }) => {
  const [serviceDescription, setServiceDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [saving, setSaving] = useState(false);
  if (!technician) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ technicianId: technician.id, serviceDescription, scheduledFor, estimatedHours: Number(estimatedHours) });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
    <form onSubmit={submit} className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
      <div className="flex items-start justify-between">
        <div><p className="text-xs font-bold text-blue-600">New service request</p><h3 className="font-bold text-slate-900 dark:text-white text-lg">Book {technician.name}</h3><p className="text-xs text-slate-500">{technician.trade} in {technician.town}</p></div>
        <button type="button" onClick={onClose} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
      </div>
      <label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700 dark:text-slate-300">What do you need help with?</span><textarea required minLength={10} value={serviceDescription} onChange={(event) => setServiceDescription(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the work needed" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Date and time</span><input required type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs" /></label>
        <label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Hours</span><input required min="0.5" max="24" step="0.5" type="number" value={estimatedHours} onChange={(event) => setEstimatedHours(event.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs" /></label>
      </div>
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3 text-xs text-blue-900 dark:text-blue-200">Estimated cost: <strong>UGX {(technician.hourlyRateUgx * Number(estimatedHours || 0)).toLocaleString()}</strong></div>
      <button disabled={saving} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold">{saving ? 'Sending request...' : 'Send booking request'}</button>
    </form>
  </div>;
};