'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  FileCheck2,
  Clock,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Search,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Printer,
  FileSpreadsheet,
  KeyRound
} from 'lucide-react';

interface AvailableTest {
  id: string;
  title_en: string;
  title_ta: string;
  category: string;
  duration_minutes: number;
  total_marks: number;
  question_count: number;
  user_status: 'not_attempted' | 'in_progress' | 'completed';
  active_attempt_id: string | null;
  attempt_count: number;
  best_score: number;
  exams?: {
    id: string;
    title_en: string;
    title_ta: string;
  };
}

export default function LearnerTestsPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [tests, setTests] = useState<AvailableTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learner/tests');
      const data = await res.json();
      if (res.ok) {
        setTests(data.tests || []);
      }
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleStartTest = async (testId: string) => {
    setStartingId(testId);
    try {
      const res = await fetch('/api/learner/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_template_id: testId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start examination');
      }

      router.push(`/learner/tests/${data.attempt_id}`);
    } catch (err: any) {
      alert(err.message || 'Error starting test');
      setStartingId(null);
    }
  };

  const filteredTests = tests.filter((t) => {
    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : categoryFilter === 'pyq'
        ? t.title_en?.toLowerCase().includes('pyq') || t.title_ta?.includes('முந்தைய') || t.id?.includes('PYQ')
        : t.category === categoryFilter;
    const matchesSearch =
      t.title_ta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title_en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-28 sm:pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold tracking-wider uppercase mb-1">
            <span>{t('தேர்வு மையம்', 'Test Centre')}</span>
            <span>•</span>
            <span>{t('மாதிரி வினாத்தாள்கள்', 'Mock Examinations')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 break-words font-tamil">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>{t('மாதிரித் தேர்வுகள் & வினாத்தாள்கள்', 'Mock Examinations & Quizzes')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-tamil leading-relaxed break-words">
            {t(
              'அதிகாரப்பூர்வ TNPSC வினாத்தாள்கள், நேரக் கட்டுப்பாடு மற்றும் OMR மாதிரி தேர்வு முறை.',
              'Attempt real-time timed test papers with anti-tamper countdown, bilingual toggle, and offline crash protection.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            href="/learner/tests/omr-sheet"
            target="_blank"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 bg-gradient-to-r from-pink-950/80 to-purple-950/80 hover:from-pink-900/80 hover:to-purple-900/80 text-pink-300 text-xs font-bold rounded-xl border border-pink-600/40 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-pink-400 shrink-0" />
            <span>{t('Pink OMR Sheet (A4 PDF)', 'Pink OMR Sheet (PDF)')}</span>
          </Link>
          <Link
            href="/learner/syllabus"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t('பாடத்திட்டம் பார்', 'Syllabus Explorer')}</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-2.5 sm:p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none max-w-full pb-1 sm:pb-0 w-full sm:w-auto">
          {[
            { id: 'all', ta: 'அனைத்து தேர்வுகள்', en: 'All Papers' },
            { id: 'pyq', ta: '⭐ முந்தைய ஆண்டு வினாக்கள் (PYQ)', en: '⭐ PYQ Papers' },
            { id: 'unit_quiz', ta: 'அலகுத் தேர்வுகள்', en: 'Unit Quizzes' },
            { id: 'full_mock', ta: 'முழு மாதிரித் தேர்வு', en: 'Full Mocks' },
            { id: 'part_test', ta: 'பகுதித் தேர்வுகள்', en: 'Part Tests' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                categoryFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {lang === 'en' ? cat.en : cat.ta}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder={t('தேர்வுத் தாள்களைத் தேடுக...', 'Search test papers...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            {t('தேர்வுகள் ஏற்றப்படுகின்றன...', 'Loading tests...')}
          </p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800">
          <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">
            {t('தேர்வுகள் எதுவும் கிடைக்கவில்லை', 'No mock tests found')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'வேறு வகையைத் தேர்ந்தெடுக்கவும் அல்லது பாடத்திட்டத்திலிருந்து புதிய தேர்வு உருவாக்கவும்.',
              'Try choosing a different category or generate a custom test from the Syllabus Explorer.'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => {
            const isStarting = startingId === test.id;
            const primaryTitle = lang === 'en' ? (test.title_en || test.title_ta) : test.title_ta;
            const secondaryTitle = lang === 'en' ? test.title_ta : test.title_en;

            return (
              <div
                key={test.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono uppercase bg-slate-800 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/20">
                        {test.category.replace(/_/g, ' ')}
                      </span>
                      {(test.title_en?.toLowerCase().includes('pyq') || test.id?.includes('PYQ')) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>PYQ Master</span>
                        </span>
                      )}
                    </div>
                    {test.user_status === 'in_progress' && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        {t('எழுதப்பட்டு வருகிறது', 'In Progress')}
                      </span>
                    )}
                    {test.user_status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('உயர் மதிப்பெண்', 'Best')}: {test.best_score} pts
                      </span>
                    )}
                  </div>

                  <h3 className={`font-bold text-white text-base leading-snug ${lang === 'ta' ? 'font-tamil' : ''}`}>
                    {primaryTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{secondaryTitle}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">
                        {t('வினாக்கள்', 'Questions')}
                      </span>
                      <strong className="text-amber-400">{test.question_count}</strong>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">
                        {t('நேரம்', 'Time')}
                      </span>
                      <strong className="text-slate-200">{test.duration_minutes}m</strong>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">
                        {t('மதிப்பெண்', 'Marks')}
                      </span>
                      <strong className="text-emerald-400">{test.total_marks}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/80 space-y-2.5">
                  {/* Row 1: Dual 50/50 Secondary Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/learner/tests/${test.id}/print`}
                      target="_blank"
                      title={t('வினாத்தாளை அச்சிடு', 'Print Question Paper')}
                      className="h-9 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center min-w-0"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate whitespace-nowrap">{t('வினாத்தாள் PDF', 'Paper PDF')}</span>
                    </Link>
                    <Link
                      href={`/learner/tests/${test.id}/omr-sync`}
                      title={t('OMR விடை உள்ளீடு', 'Key-in OMR Sheet')}
                      className="h-9 px-2 rounded-xl bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 hover:text-pink-200 border border-pink-700/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center min-w-0"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="truncate whitespace-nowrap">OMR Key-In</span>
                    </Link>
                  </div>

                  {/* Row 2: Hero Full-Width Action Button */}
                  <div>
                    {test.user_status === 'in_progress' ? (
                      <Link
                        href={`/learner/tests/${test.active_attempt_id}`}
                        className="w-full h-10 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span className="font-tamil whitespace-nowrap">{t('தேர்வைத் தொடர்க', 'Resume Examination')}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5 shrink-0" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleStartTest(test.id)}
                        disabled={isStarting}
                        className="w-full h-10 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                      >
                        {isStarting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                            <span className="whitespace-nowrap">{t('தயாராகிறது...', 'Preparing...')}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span className="font-tamil whitespace-nowrap">
                              {test.user_status === 'completed'
                                ? t('மீண்டும் தேர்வு எழுதுக', 'Retake Test')
                                : t('தேர்வை தொடங்கு', 'Start Exam')}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 ml-0.5 shrink-0" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
