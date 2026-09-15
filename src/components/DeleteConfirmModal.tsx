import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Technician } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  technician: Technician | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  technician,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !technician) return null;

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Technician
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {technician.name}
                </strong>{' '}
                ({technician.trade} in {technician.town})? This record will be permanently removed from the directory.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={deleting}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? 'Deleting...' : 'Yes, Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
