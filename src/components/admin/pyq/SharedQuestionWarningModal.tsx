'use client';

import React from 'react';
import { X, AlertTriangle, Copy, Globe, ShieldAlert } from 'lucide-react';

interface SharedQuestionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoiceSelected: (choice: 'fork' | 'update_central') => void;
  questionId: string;
  paperTitle: string;
  otherPapersCount: number;
  testsCount: number;
  otherPapers?: Array<{ id: string; title: string }>;
  tests?: Array<{ id: string; title: string }>;
  loading?: boolean;
}

export default function SharedQuestionWarningModal({
  isOpen,
  onClose,
  onChoiceSelected,
  questionId,
  paperTitle,
  otherPapersCount,
  testsCount,
  otherPapers = [],
  tests = [],
  loading = false,
}: SharedQuestionWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm text-white">
              பகிரப்பட்ட வினா திருத்த எச்சரிக்கை (Shared Question Warning)
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
          <p className="text-slate-200 leading-relaxed font-tamil">
            வினா எண் <strong className="text-amber-400 font-mono">{questionId}</strong> ஏற்கனவே பிற{' '}
            <strong className="text-indigo-300">{otherPapersCount} தேர்வுத் தாள்களிலும்</strong> மற்றும்{' '}
            <strong className="text-purple-300">{testsCount} மாணவர் தேர்வுகளிலும்</strong> பகிரப்பட்டுள்ளது.
            நீங்கள் செய்யும் மாற்றங்கள் எவ்வாறு சேமிக்கப்பட வேண்டும் என்பதைத் தேர்ந்தெடுக்கவும்:
          </p>

          {/* Conflict list preview */}
          {(otherPapers.length > 0 || tests.length > 0) && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5 max-h-32 overflow-y-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">தற்போது பயன்படுத்தப்படும் இடங்கள்:</span>
              {otherPapers.map((p) => (
                <div key={p.id} className="text-slate-300 text-[11px] flex items-center space-x-1.5">
                  <span className="text-indigo-400">•</span>
                  <span>{p.title}</span>
                </div>
              ))}
              {tests.map((t) => (
                <div key={t.id} className="text-slate-300 text-[11px] flex items-center space-x-1.5">
                  <span className="text-purple-400">•</span>
                  <span>{t.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Option 1: Fork for this paper only (RECOMMENDED) */}
          <div
            onClick={() => onChoiceSelected('fork')}
            className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-950/60 transition cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <Copy className="w-4 h-4" />
                <span>விருப்பம் 1: இத்தாளுக்கு மட்டும் தனி நகல் உருவாக்கு (Fork Copy - Recommended)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                பாதுகாப்பானது
              </span>
            </div>
            <p className="text-slate-300 font-tamil leading-relaxed">
              இத்தாள் (<strong>{paperTitle}</strong>)-க்கு மட்டும் ஒரு தனி பிரத்யேக நகல் உருவாக்கப்படும். மற்ற தாள்களிலோ அல்லது மாணவர் முந்தைய தேர்வு முடிவுகளிலோ எந்த ஒரு மாற்றமும் ஏற்படாது.
            </p>
          </div>

          {/* Option 2: Update Central Question */}
          <div
            onClick={() => onChoiceSelected('update_central')}
            className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/50 transition cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Globe className="w-4 h-4" />
              <span>விருப்பம் 2: மத்திய வினாவை மாற்று (Update Central Question)</span>
            </div>
            <p className="text-slate-300 font-tamil leading-relaxed">
              மத்திய வினா வங்கியில் உள்ள அசல் வினா மாற்றப்படும். இவ்வினா பயன்படுத்தப்படும் அனைத்து பிற தாள்களிலும் புதிய பதிப்பு பிரதிபலிக்கும்.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer text-xs"
          >
            ரத்து (Cancel)
          </button>
        </div>
      </div>
    </div>
  );
}

