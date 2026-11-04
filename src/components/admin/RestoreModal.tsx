'use client';

import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

interface RestoreModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm: (targetStatus: 'draft' | 'published', reason: string) => Promise<void>;
  isLoading?: boolean;
}

export default function RestoreModal({
  isOpen,
  selectedCount,
  onClose,
  onConfirm,
  isLoading = false,
}: RestoreModalProps) {
  const [targetStatus, setTargetStatus] = useState<'draft' | 'published'>('draft');
  const [reason, setReason] = useState('Restored from archive');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(targetStatus, reason.trim() || 'Restored by admin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-emerald-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Restore Question{selectedCount > 1 ? `s (${selectedCount})` : ''}
              </h3>
              <p className="text-xs text-emerald-400 font-tamil">
                காப்பகத்திலிருந்து மீட்டெடு (Restore)
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
          <p className="text-xs text-slate-300">
            Choose the target workflow status for <strong className="text-emerald-400">{selectedCount}</strong> restored question(s):
          </p>

          <div className="space-y-2">
            <label
              className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                targetStatus === 'draft'
                  ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-slate-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="targetStatus"
                value="draft"
                checked={targetStatus === 'draft'}
                onChange={() => setTargetStatus('draft')}
                className="mt-1 text-amber-500 focus:ring-amber-500"
              />
              <div className="text-xs space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Draft / Pending Review (Recommended)</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Restores question to Draft state for verification check before making it available in mock tests.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                targetStatus === 'published'
                  ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'bg-slate-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="targetStatus"
                value="published"
                checked={targetStatus === 'published'}
                onChange={() => setTargetStatus('published')}
                className="mt-1 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="text-xs space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Published / Active (Direct Publish)</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Immediately re-activates question into live student question bank.
                </p>
              </div>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Restore Reason / Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Revised textbook edition re-introduced"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-tamil"
            />
          </div>

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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-900/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isLoading ? 'Restoring...' : 'Confirm Restore (மீட்டெடு)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

