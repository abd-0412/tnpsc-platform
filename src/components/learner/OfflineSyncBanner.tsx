'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  WifiOff,
  Wifi,
  Download,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { usePWA } from '@/components/pwa/PWAProvider';
import { useLanguage } from '@/context/LanguageContext';

export default function OfflineSyncBanner() {
  const { isOnline, canInstall, installPWA, pendingSyncCount, triggerManualSync } = usePWA();
  const { lang, t } = useLanguage();
  const [syncing, setSyncing] = useState(false);
  const [dismissedInstall, setDismissedInstall] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await triggerManualSync();
      if (res.syncedCount > 0) {
        setSyncMessage(
          lang === 'ta'
            ? `✅ ${res.syncedCount} ஆஃப்லைன் தேர்வுகள் வெற்றிகரமாக பதிவேற்றப்பட்டன!`
            : `✅ Successfully synced ${res.syncedCount} offline tests to server!`
        );
      } else {
        setSyncMessage(
          lang === 'ta' ? 'அனைத்து தேர்வுகளும் ஏற்கனவே ஒத்திசைக்கப்பட்டுள்ளன.' : 'All tests are already up to date.'
        );
      }
    } catch {
      setSyncMessage(lang === 'ta' ? 'ஒத்திசைவு தோல்வியடைந்தது.' : 'Sync failed. Will retry automatically.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-2 print:hidden">
      {/* Offline Alert Bar */}
      {!isOnline && (
        <div className="bg-amber-950/90 border border-amber-600/50 text-amber-200 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-tamil">
              {t(
                'நீங்கள் தற்போது ஆஃப்லைனில் உள்ளீர்கள். உங்கள் தேர்வுகள் சாதனத்தில் பாதுகாப்பாக சேமிக்கப்படும்!',
                'You are currently offline. Your test attempts will be saved locally on your device!'
              )}
            </span>
          </div>

          <Link
            href="/learner/offline"
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition text-[11px] shrink-0 font-mono"
          >
            {t('ஆஃப்லைன் மையம்', 'Offline Centre')}
          </Link>
        </div>
      )}

      {/* Pending Sync Notification (When back online and attempts waiting) */}
      {isOnline && pendingSyncCount > 0 && (
        <div className="bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <RefreshCw className={`w-4 h-4 text-indigo-400 shrink-0 ${syncing ? 'animate-spin' : ''}`} />
            <span className="font-tamil">
              {lang === 'ta'
                ? `இணையம் திரும்பியது! ${pendingSyncCount} ஆஃப்லைன் தேர்வுகள் சேமிக்கப்பட்டுள்ளன.`
                : `Back online! ${pendingSyncCount} offline test attempt(s) waiting to sync.`}
            </span>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-[11px] shrink-0 cursor-pointer disabled:opacity-50 font-mono flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : t('இப்போது ஒத்திசை', 'Sync Now')}</span>
          </button>
        </div>
      )}

      {/* Sync Success / Result Toast */}
      {syncMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-2xl text-xs flex items-center justify-between shadow-lg font-tamil animate-fadeIn">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PWA Install Banner */}
      {canInstall && !dismissedInstall && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                <span>{t('TNPSC செயலியை உங்கள் மொபைலில் Install செய்க', 'Install TNPSC Prep as a Mobile App')}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full font-mono">
                  PWA
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 font-tamil mt-0.5">
                {t(
                  'இணையம் இல்லாமலும் அதிவேகமாக இயங்க, ஆஃப்லைனில் மாதிரித் தேர்வுகளை எழுத உடனடியாக இன்ஸ்டால் செய்யுங்கள்.',
                  'Fast offline exam-taking, instant 3D flashcards, and home screen launch with zero app store download.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={installPWA}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl transition text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('செயலியை நிறுவு (Install)', 'Install App')}</span>
            </button>
            <button
              onClick={() => setDismissedInstall(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

