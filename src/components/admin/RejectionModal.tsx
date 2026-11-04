'use client';

import React, { useState } from 'react';
import { X, AlertCircle, XCircle } from 'lucide-react';

interface RejectionModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const COMMON_REASONS = [
  'Factual inaccuracy in question or answer options (வினா அல்லது விடைகளில் உண்மைப் பிழை உள்ளது)',
  'Typo or grammatical error in Tamil text (தமிழ் வினாவில் எழுத்துப் பிழை அல்லது இலக்கணப் பிழை உள்ளது)',
  'Ambiguous or conflicting answer key (விடைக்குறிப்பில் தெளிவின்மை அல்லது முரண்பாடு உள்ளது)',
  'Incorrect syllabus / Unit / Lesson mapping (பாடத்திட்டம் அல்லது பாடப்பிரிவு தவறாக இணைக்கப்பட்டுள்ளது)',
  'Missing Samacheer Kalvi textbook citation (பாடநூல் ஆதாரம் அல்லது பக்க எண் குறிப்பிடப்படவில்லை)',
];

export default function RejectionModal({
  isOpen,
  selectedCount,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectionModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() || selectedPreset.trim();
    if (!finalReason) {
      setErrorMsg('Please select a preset reason or enter a detailed custom reason.');
      return;
    }
    setErrorMsg('');
    await onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-rose-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Reject Question{selectedCount > 1 ? `s (${selectedCount})` : ''}
              </h3>
              <p className="text-xs text-rose-400 font-tamil">
                நிராகரிப்பு காரணத்தை பதிவு செய்க (Mandatory)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-300">
            Select a common reason or write a specific note for why{' '}
            <strong className="text-rose-400">{selectedCount}</strong> question(s) should be rejected and returned for revision.
          </p>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Common Reasons (பொதுவான காரணங்கள்)
            </label>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {COMMON_REASONS.map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(reason);
                    setCustomReason('');
                    setErrorMsg('');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition border cursor-pointer ${
                    selectedPreset === reason
                      ? 'bg-rose-950/50 border-rose-500 text-rose-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Area */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Or Custom Rejection Feedback (குறிப்பிட்ட கருத்துக்கள்)
            </label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                if (e.target.value) setSelectedPreset('');
                setErrorMsg('');
              }}
              placeholder="Explain what needs correction in Tamil or English..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 font-tamil"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
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
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-rose-900/30"
            >
              <XCircle className="w-4 h-4" />
              <span>{isLoading ? 'Processing...' : 'Confirm Rejection (நிராகரி)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

