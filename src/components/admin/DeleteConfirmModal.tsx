'use client';

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  selectedCount: number;
  questionIds: string[];
  isPermanent?: boolean;
  onClose: () => void;
  onConfirm: (reason: string, permanent: boolean) => Promise<void>;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  selectedCount,
  questionIds,
  isPermanent = false,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmModalProps) {
  const [reason, setReason] = useState('Deleted by admin');
  const [permanentMode, setPermanentMode] = useState(isPermanent);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason.trim() || 'Deleted by admin', permanentMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-red-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Delete Question{selectedCount > 1 ? `s (${selectedCount})` : ''}
              </h3>
              <p className="text-xs text-red-400 font-tamil">
                வினா நீக்கம் மற்றும் தரவு பாதுகாப்பு
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-start space-x-2 text-amber-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>
                <strong>Data Safety Protection:</strong> Standard deletion utilizes soft deletion with{' '}
                <code className="text-amber-400">deleted_at</code> timestamp. All historical student test attempts,
                answer sheets, and scoring analytics remain 100% preserved.
              </span>
            </div>
            <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-700/60">
              Target ID(s):{' '}
              <span className="font-mono text-slate-200">
                {questionIds.slice(0, 5).join(', ')}
                {questionIds.length > 5 ? ` +${questionIds.length - 5} more` : ''}
              </span>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Deletion Reason (நீக்கத்திற்கான காரணம்)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate question, Outdated syllabus, etc."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-tamil"
            />
          </div>

          {/* Permanent Mode Toggle (Admin advanced option) */}
          <div className="flex items-center space-x-2 pt-1 text-xs text-slate-400">
            <input
              type="checkbox"
              id="permanent-mode"
              checked={permanentMode}
              onChange={(e) => setPermanentMode(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-red-500 focus:ring-red-500"
            />
            <label htmlFor="permanent-mode" className="cursor-pointer select-none">
              Permanently purge from database (Blocked if student test attempts reference these questions)
            </label>
          </div>

          {permanentMode && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Warning: Permanent deletion cannot be undone. Questions with student answers will be protected and skipped.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancel (ரத்து செய்)
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-red-900/30"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isLoading ? 'Deleting...' : permanentMode ? 'Permanent Purge' : 'Safe Delete (நீக்கு)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

