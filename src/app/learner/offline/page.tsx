'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  WifiOff,
  Wifi,
  Download,
  Trash2,
  Play,
  RefreshCw,
  Smartphone,
  HardDrive,
  Sparkles,
  BookOpen,
  FileCheck2,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap
} from 'lucide-react';
import {
  getAllOfflineTests,
  deleteOfflineTest,
  getPendingSubmissions,
  seedSampleOfflineBundle,
  OfflineTestBundle,
  OfflineSubmission
} from '@/lib/offline-storage';
import { usePWA } from '@/components/pwa/PWAProvider';
import { useLanguage } from '@/context/LanguageContext';

export default function OfflineCentrePage() {
  const { isOnline, canInstall, installPWA, triggerManualSync, pendingSyncCount } = usePWA();
  const { lang, t } = useLanguage();

  const [cachedTests, setCachedTests] = useState<OfflineTestBundle[]>([]);
  const [pendingSubs, setPendingSubs] = useState<OfflineSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Load offline tests and pending submissions
  const loadStorageData = async () => {
    setLoading(true);
    try {
      const tests = await getAllOfflineTests();
      const subs = await getPendingSubmissions();
      setCachedTests(tests);
      setPendingSubs(subs);
    } catch (err) {
      console.warn('Failed to load offline data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  // Download Sample Offline Test
  const handleDownloadSample = async () => {
    setDownloading(true);
    try {
      const bundle = await seedSampleOfflineBundle();
      await loadStorageData();
      setActionMessage(
        lang === 'ta'
          ? `✅ "${bundle.title}" ஆஃப்லைனில் வெற்றிகரமாக பதிவிறக்கப்பட்டது!`
          : `✅ "${bundle.title}" successfully downloaded for offline practice!`
      );
    } catch {
      setActionMessage('Failed to download test bundle.');
    } finally {
      setDownloading(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Delete Cached Test
  const handleDeleteTest = async (testId: string) => {
    await deleteOfflineTest(testId);
    await loadStorageData();
    setActionMessage(lang === 'ta' ? 'தேர்வு சாதனத்திலிருந்து நீக்கப்பட்டது.' : 'Test removed from local cache.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Manual Sync
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await triggerManualSync();
      await loadStorageData();
      if (res.syncedCount > 0) {
        setActionMessage(
          lang === 'ta'
            ? `✅ ${res.syncedCount} தேர்வுகள் சர்வரில் ஒத்திசைக்கப்பட்டன!`
            : `✅ Successfully synced ${res.syncedCount} test(s) to server!`
        );
      } else {
        setActionMessage(lang === 'ta' ? 'ஒத்திசைக்க புதிய தேர்வுகள் இல்லை.' : 'No new tests to sync.');
      }
    } catch {
      setActionMessage('Sync failed.');
    } finally {
      setSyncing(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-7 pb-16 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Phase 13: Offline Study Engine
              </span>
              <span className="text-xs text-indigo-300 font-mono hidden sm:inline">•</span>
              <span className="text-xs text-indigo-300 font-mono flex items-center gap-1.5">
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300 font-semibold">{t('இணைப்பில் உள்ளது (Online)', 'Online')}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-300 font-semibold">{t('ஆஃப்லைன் பயன்முறை (Offline)', 'Offline')}</span>
                  </>
                )}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 break-words">
              <WifiOff className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 shrink-0" />
              <span>{t('ஆஃப்லைன் தேர்வு மையம் & PWA ஆப்', 'Offline Study Centre & PWA App')}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-tamil max-w-2xl leading-relaxed break-words">
              {lang === 'ta'
                ? 'இணைய வசதி இல்லாத இடங்களிலும், பேருந்துப் பயணங்களிலும் மாதிரித் தேர்வுகளைத் தடையின்றி எழுதுங்கள். இணையம் திரும்பியவுடன் மதிப்பெண்கள் தானாக சர்வருடன் Sync ஆகிவிடும்.'
                : 'Study and take authentic mock tests with zero internet dependency. Once connectivity returns, your scores and analytics will automatically sync.'}
            </p>
          </div>

          {/* Action Message Toast */}
          {actionMessage && (
            <div className="p-3 bg-indigo-950 border border-indigo-500/50 rounded-2xl text-xs text-indigo-200 font-tamil shadow-xl shrink-0 break-words max-w-full">
              {actionMessage}
            </div>
          )}
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
          <div className="bg-slate-950/80 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <HardDrive className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">CACHED</span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-white">{cachedTests.length}</span>
                <span className="text-[10px] text-slate-500 font-mono">tests</span>
              </div>
              <span className="text-[11px] font-bold text-slate-300 block font-tamil mt-0.5">
                {t('சேமித்த தேர்வுகள்', 'Cached Tests')}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">SYNC</span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">{pendingSubs.length}</span>
                <span className="text-[10px] text-slate-500 font-mono">attempts</span>
              </div>
              <span className="text-[11px] font-bold text-slate-300 block font-tamil mt-0.5">
                {t('ஒத்திசைவு நிலுவை', 'Pending Sync')}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">ENGINE</span>
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold font-mono text-indigo-300 block">IndexedDB</span>
              <span className="text-[11px] font-bold text-slate-300 block font-tamil mt-0.5">
                {t('உள்ளூர் சேமிப்பகம்', 'Local Storage')}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">PWA APP</span>
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 block">
                {canInstall ? t('தயார் (Ready)', 'Installable') : t('இயங்குகிறது', 'Active')}
              </span>
              <span className="text-[11px] font-bold text-slate-300 block font-tamil mt-0.5">
                {t('ஆஃப்லைன் ஆப்', 'Offline App')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: DOWNLOADED OFFLINE TESTS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>{t('சாதனத்தில் பதிவிறக்கப்பட்ட தேர்வுகள்', 'Downloaded Offline Tests')}</span>
            </h2>
            <p className="text-xs text-slate-400 font-tamil mt-0.5">
              {t(
                'இந்தத் தேர்வுகளை எழுத இன்டர்நெட் இணைப்பு தேவையில்லை.',
                'These tests can be attempted immediately without any internet connection.'
              )}
            </p>
          </div>

          {/* Quick Pre-Seed Sample Test Button */}
          <button
            onClick={handleDownloadSample}
            disabled={downloading}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
            <span>
              {downloading
                ? t('பதிவிறக்குகிறது...', 'Downloading...')
                : t('+ 6-ஆம் வகுப்பு மாதிரித் தேர்வை பதிவிறக்கு', '+ Download Sample 6th Std Mock')}
            </span>
          </button>
        </div>

        {/* List of Cached Tests */}
        {cachedTests.length === 0 ? (
          <div className="p-6 sm:p-8 text-center bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl space-y-3">
            <HardDrive className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">
              {t('இன்னும் தேர்வுகள் பதிவிறக்கப்படவில்லை', 'No Offline Tests Downloaded Yet')}
            </h3>
            <p className="text-xs text-slate-500 font-tamil max-w-md mx-auto">
              மேலே உள்ள "+ 6-ஆம் வகுப்பு மாதிரித் தேர்வை பதிவிறக்கு" பொத்தானை அழுத்தி சோதனைத் தேர்வை உடனே உங்கள் சாதனத்தில் சேமியுங்கள்.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cachedTests.map((test) => (
              <div
                key={test.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                      {test.standard ? `${test.standard}-ஆம் வகுப்பு` : 'TNPSC Mock'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(test.cachedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-tamil leading-snug break-words">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-tamil line-clamp-1">
                    {test.examTitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                      {test.questions.length} வினாக்கள்
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {test.durationMinutes} நிமிடங்கள்
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-slate-800">
                  <Link
                    href={`/learner/tests/${test.id}`}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t('தேர்வைத் தொடங்கு', 'Start Offline Exam')}</span>
                  </Link>

                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 rounded-xl transition cursor-pointer shrink-0"
                    title="Delete from local cache"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: PENDING SYNC QUEUE */}
      {pendingSubs.length > 0 && (
        <div className="bg-slate-900/90 border border-amber-600/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>{t('ஒத்திசைக்க காத்திருக்கும் தேர்வுகள்', 'Pending Sync Queue')}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono">
                  {pendingSubs.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-tamil mt-0.5">
                {t(
                  'இணையம் இல்லாதபோது நீங்கள் எழுதிய தேர்வுகள். இணையம் கிடைத்ததும் தானாக அல்லது உடனே ஒத்திசைக்கலாம்.',
                  'Tests completed while offline. Click sync to save marks to the cloud server.'
                )}
              </p>
            </div>

            <button
              onClick={handleManualSync}
              disabled={syncing || !isOnline}
              className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer font-mono shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : t('இப்போது ஒத்திசை (Sync Now)', 'Sync to Cloud')}</span>
            </button>
          </div>

          <div className="space-y-2">
            {pendingSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <h4 className="text-white font-bold font-tamil break-words">{sub.testTitle}</h4>
                  <span className="text-[11px] text-slate-400 font-mono break-words">
                    Completed: {new Date(sub.submittedAt).toLocaleTimeString()} • {Object.keys(sub.answers).length} வினாக்கள் விடையளிக்கப்பட்டன
                  </span>
                </div>

                <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-full self-start sm:self-center shrink-0">
                  Pending Sync
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: REVISION CAPSULES OFFLINE PROMPT */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white break-words">
              {t('3D Flashcards & திருப்புதல் குறிப்புகள் ஆஃப்லைனில் உள்ளன', 'High-Yield Flashcards & Capsules are Cached')}
            </h3>
            <p className="text-xs text-slate-400 font-tamil mt-0.5 leading-relaxed break-words">
              அனைத்து 28+ சமச்சீர் கல்வி 3D Flashcards மற்றும் கணித சூத்திரங்கள் இணையம் இல்லாமலும் உடனடி நினைவாற்றல் பயிற்சிக்குத் தயாராக உள்ளன.
            </p>
          </div>
        </div>

        <Link
          href="/learner/capsules"
          className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition shrink-0 text-center"
        >
          {t('கார்டுகளைப் பார் (Open Flashcards)', 'Open Revision Deck')}
        </Link>
      </div>

      {/* SECTION 4: HOW TO INSTALL PWA GUIDE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{t('TNPSC செயலியை உங்கள் போனில் நிறுவுவது எப்படி?', 'How to Install on Mobile & PC')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Android Chrome */}
          <div className="p-3.5 sm:p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1.5">
            <strong className="text-indigo-300 font-bold block text-sm">
              🤖 Android (Chrome Browser)
            </strong>
            <p className="text-slate-400 font-tamil leading-relaxed">
              1. பிரவுசரின் மேல் வலது மூலையில் உள்ள <strong>மூன்று புள்ளிகளை (⋮)</strong> கிளிக் செய்யவும்.
              <br />
              2. <strong>"Install app"</strong> அல்லது <strong>"Add to Home screen"</strong> என்பதைத் தேர்ந்தெடுக்கவும்.
              <br />
              3. இப்போது செயலி உங்கள் முகப்புத் திரையில் ஆப் போல தோன்றும்!
            </p>
          </div>

          {/* iOS Safari */}
          <div className="p-3.5 sm:p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1.5">
            <strong className="text-cyan-300 font-bold block text-sm">
              🍏 iPhone / iPad (Safari Browser)
            </strong>
            <p className="text-slate-400 font-tamil leading-relaxed">
              1. Safari-ன் கீழ்ப்பகுதியில் உள்ள <strong>Share பட்டனை (பகிர்தல் சின்னம்)</strong> கிளிக் செய்யவும்.
              <br />
              2. கீழே உருட்டி <strong>"Add to Home Screen (முகப்புத் திரையில் சேர்)"</strong> என்பதைத் தேர்ந்தெடுக்கவும்.
              <br />
              3. 'Add' கொடுத்ததும் தனி ஆப் போல இயங்கும்!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

