'use client';

import React from 'react';
import { X, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RemoveQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  paperTitle: string;
  questionIds: string[];
  questionSnippet?: string;
  isBulk?: boolean;
  loading?: boolean;
}

export default function RemoveQuestionModal({
  isOpen,
  onClose,
  onConfirm,
  paperTitle,
  questionIds,
  questionSnippet,
  isBulk = false,
  loading = false,
}: RemoveQuestionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">
              {isBulk
                ? `வினாக்களைத் தாளிலிருந்து நீக்கு (Remove ${questionIds.length} Questions from Paper)`
                : 'வினாவைத் தாளிலிருந்து நீக்கு (Remove Question from Paper)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Critical Policy Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Safe Disassociation Policy (பாதுகாப்புக் கொள்கை)</span>
            </div>
            <p className="text-slate-300 font-tamil leading-relaxed">
              இச்செயல் இத்தேர்வுத் தாளிலிருந்து (<strong>{paperTitle}</strong>) மட்டுமே தேர்ந்தெடுக்கப்பட்ட வினா இணைப்பை நீக்கும்.
              மத்திய <strong>வினா வங்கியில் (Question Bank)</strong> உள்ள அசல் வினா எக்காரணம் கொண்டும் நிரந்தரமாக அழியாது.
            </p>
          </div>

          {/* Details */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Paper Title:</span>
              <span className="font-semibold text-white">{paperTitle}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">
                {isBulk ? 'Question IDs to be removed:' : 'Question ID:'}
              </span>
              <div className="font-mono text-amber-400 max-h-24 overflow-y-auto break-all pt-0.5">
                {questionIds.join(', ')}
              </div>
            </div>

            {questionSnippet && !isBulk && (
              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Question Preview:</span>
                <p className="text-slate-200 font-tamil mt-0.5 line-clamp-3">{questionSnippet}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer text-xs"
          >
            ரத்து (Cancel)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 text-xs shadow-lg shadow-red-950/50"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {loading
                ? 'நீக்கப்படுகிறது...'
                : isBulk
                ? `Remove ${questionIds.length} from Paper`
                : 'Remove from Paper'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
