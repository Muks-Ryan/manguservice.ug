import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Technician, TechnicianFormData, TechnicianStatus } from '../types';
import { TRADES, TOWNS, STATUSES } from '../services/technicianService';

interface TechnicianFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TechnicianFormData) => Promise<void>;
  initialData?: Technician | null;
}

export const TechnicianFormModal: React.FC<TechnicianFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<TechnicianFormData>({
    name: '',
    trade: TRADES[0],
    phone: '',
    email: '',
    town: TOWNS[0],
    hourlyRateUgx: 30000,
    bio: '',
    status: 'Available',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        trade: initialData.trade,
        phone: initialData.phone,
        email: initialData.email,
        town: initialData.town,
        hourlyRateUgx: initialData.hourlyRateUgx,
        bio: initialData.bio,
        status: initialData.status,
      });
    } else {
      setFormData({
        name: '',
        trade: TRADES[0],
        phone: '+256 ',
        email: '',
        town: TOWNS[0],
        hourlyRateUgx: 30000,
        bio: '',
        status: 'Available',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    if (!formData.trade.trim()) {
      newErrors.trade = 'Trade or specialization is required.';
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      newErrors.phone = 'Valid Ugandan phone number is required (e.g. +256 701 234 567).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Valid email address is required.';
    }

    if (!formData.town.trim()) {
      newErrors.town = 'Operating town/location is required.';
    }

    if (formData.hourlyRateUgx === undefined || isNaN(formData.hourlyRateUgx) || formData.hourlyRateUgx < 0) {
      newErrors.hourlyRateUgx = 'Hourly rate must be 0 or higher.';
    }

    if (!formData.bio.trim() || formData.bio.trim().length < 5) {
      newErrors.bio = 'Bio / description must be at least 5 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save technician record.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Technician' : 'Add New Technician'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditing
                ? 'Update profile, rates, and contact details'
                : 'Register a new service technician in the directory'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errors.form && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Kato Joseph"
              className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500'
              } focus:outline-none focus:ring-2`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Trade & Town (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trade / Skill <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.trade}
                onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {TRADES.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Town / Location <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.town}
                onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {TOWNS.map((town) => (
                  <option key={town} value={town}>
                    {town}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone & Email (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+256 700 000 000"
                className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500'
                } focus:outline-none focus:ring-2`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="technician@mangu.ug"
                className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500'
                } focus:outline-none focus:ring-2`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Rate & Status (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hourly Rate (UGX) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={formData.hourlyRateUgx}
                onChange={(e) =>
                  setFormData({ ...formData, hourlyRateUgx: Number(e.target.value) })
                }
                placeholder="30000"
                className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border ${
                  errors.hourlyRateUgx
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500'
                } focus:outline-none focus:ring-2 font-mono`}
              />
              {errors.hourlyRateUgx && (
                <p className="text-xs text-red-500 mt-1">{errors.hourlyRateUgx}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TechnicianStatus })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bio / Specialization <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief summary of skills, certifications, and experience..."
              className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm p-3 rounded-xl border ${
                errors.bio
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500'
              } focus:outline-none focus:ring-2`}
            />
            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio}</p>}
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Technician' : 'Create Technician'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
