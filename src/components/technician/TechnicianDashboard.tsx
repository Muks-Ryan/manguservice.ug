import React, { useState } from 'react';
import { Wrench, CheckCircle2, Clock, MapPin, Phone, Mail, Edit3, ShieldCheck, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Booking, Technician, TechnicianStatus, User } from '../../types';
import { technicianService } from '../../services/technicianService';
import { bookingService } from '../../services/bookingService';
import { TechnicianFormModal } from '../TechnicianFormModal';

interface TechnicianDashboardProps {
  user: User;
  technician: Technician | null;
  onRefreshData: () => Promise<void>;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToSettings: () => void;
  bookings: Booking[];
  onBookingsChange: () => Promise<void>;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  user,
  technician,
  onRefreshData,
  onShowToast,
  onNavigateToSettings,
  bookings,
  onBookingsChange,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: TechnicianStatus) => {
    if (!technician) return;
    try {
      setUpdatingStatus(true);
      await technicianService.update(technician.id, { status: newStatus });
      await onRefreshData();
      onShowToast('Status Updated', `Your availability status is now set to ${newStatus}.`, 'success');
    } catch (err: any) {
      onShowToast('Status Update Failed', err.message || 'Could not update status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateProfile = async (formData: any) => {
    if (!technician) return;
    try {
      await technicianService.update(technician.id, formData);
      await onRefreshData();
      setIsEditModalOpen(false);
      onShowToast('Profile Updated', 'Your technician profile and rates were successfully updated.', 'success');
    } catch (err: any) {
      onShowToast('Update Failed', err.message || 'Could not save technician updates.', 'error');
    }
  };

  const updateBooking = async (id: string, status: 'Accepted' | 'Declined' | 'Completed') => {
    try {
      await bookingService.updateStatus(id, status);
      await onBookingsChange();
      onShowToast('Booking updated', `The request is now ${status.toLowerCase()}.`, 'success');
    } catch (error: any) {
      onShowToast('Booking update failed', error.message || 'Could not update booking.', 'error');
    }
  };

  if (!technician) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Record Not Linked</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          We could not find an associated directory technician record for {user.email}.
        </p>
        <button
          onClick={onNavigateToSettings}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors"
        >
          Open Technician Settings
        </button>
      </div>
    );
  }

  const isAvailable = technician.status === 'Available';
  const isBusy = technician.status === 'Busy';
  const isInactive = technician.status === 'Inactive';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/15 backdrop-blur-xs text-slate-950">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Technician Workspace • {technician.trade} Specialist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {technician.name}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-900/90 leading-relaxed">
              Control your public directory card, toggle real-time availability for dispatch, and adjust your hourly rates.
            </p>
          </div>

          {/* Quick status control box */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-white/40 dark:border-slate-800 text-slate-900 dark:text-white shrink-0 min-w-[240px] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Current Status:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isAvailable
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : isBusy
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {technician.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => handleStatusChange('Available')}
                disabled={updatingStatus || isAvailable}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center ${
                  isAvailable
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => handleStatusChange('Busy')}
                disabled={updatingStatus || isBusy}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center ${
                  isBusy
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                Busy
              </button>
              <button
                onClick={() => handleStatusChange('Inactive')}
                disabled={updatingStatus || isInactive}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center ${
                  isInactive
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Off
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Overview Card & Quick Actions */}
      {bookings.length > 0 && <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-bold text-slate-900 dark:text-white">Incoming service requests</h2><span className="text-xs text-slate-500">{bookings.length} total</span></div>
        <div className="space-y-3">{bookings.map((booking) => <div key={booking.id} className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"><div><p className="font-bold text-slate-900 dark:text-white">{booking.clientName} · {booking.trade}</p><p className="text-slate-600 dark:text-slate-400">{booking.serviceDescription}</p><p className="text-slate-500">{new Date(booking.scheduledFor).toLocaleString()} · {booking.estimatedHours} hr · UGX {Number(booking.estimatedCostUgx).toLocaleString()}</p></div><div className="flex items-center gap-2"><span className="font-bold text-amber-700 dark:text-amber-300">{booking.status}</span>{booking.status === 'Pending' && <><button onClick={() => updateBooking(booking.id, 'Accepted')} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">Accept</button><button onClick={() => updateBooking(booking.id, 'Declined')} className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold">Decline</button></>}{booking.status === 'Accepted' && <button onClick={() => updateBooking(booking.id, 'Completed')} className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold">Mark complete</button>}</div></div>)}</div>
      </section>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detailed Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-black text-xl flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                {technician.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {technician.name}
                </h2>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {technician.trade} • {technician.town}, Uganda
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile & Rates</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hourly Rate</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                UGX {technician.hourlyRateUgx.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Area</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {technician.town}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Trade</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {technician.trade}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Record Status</span>
              <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                {technician.status}
              </span>
            </div>
          </div>

          {/* Bio statement */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Professional Biography & Skill Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
              {technician.bio}
            </p>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{technician.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{technician.email}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Client View Preview */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Client Directory Preview
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                  {technician.trade}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {technician.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{technician.name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>{technician.town}, Uganda</span>
                </p>
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-white">
                UGX {technician.hourlyRateUgx.toLocaleString()}{' '}
                <span className="text-[10px] font-normal text-slate-500">/hr</span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {technician.bio}
              </p>
            </div>

            <button
              onClick={onNavigateToSettings}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage Account Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT TECHNICIAN MODAL */}
      <TechnicianFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProfile}
        initialData={technician}
      />
    </div>
  );
};
