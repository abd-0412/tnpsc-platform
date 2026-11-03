'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Calendar,
  ArrowRight,
  RefreshCw,
  Search,
  BookOpen,
  ChevronRight,
  Flame,
  Printer,
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';

interface Attempt {
  id: string;
  test_template_id: string | null;
  title_ta: string;
  title_en: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  accuracy_percentage: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  total_time_seconds: number;
  started_at: string;
  completed_at: string | null;
}

export default function LearnerTestResultsIndexPage() {
  const { lang, t } = useLanguage();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learner/history');
      const data = await res.json();
      if (res.ok) {
        setAttempts(data.attempts || []);
      }
    } catch (err) {
      console.error('Failed to load test results history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Compute aggregate KPIs
  const stats = useMemo(() => {
    const completedAttempts = attempts.filter((a) => a.status === 'completed');
    const totalCount = attempts.length;
    const completedCount = completedAttempts.length;

    let avgAccuracy = 0;
    let highestScore = 0;
    let totalQuestionsSolved = 0;

    if (completedAttempts.length > 0) {
      const totalAccuracy = completedAttempts.reduce((sum, a) => sum + (a.accuracy_percentage || 0), 0);
      avgAccuracy = Math.round(totalAccuracy / completedAttempts.length);
      highestScore = Math.max(...completedAttempts.map((a) => a.score || 0));
      totalQuestionsSolved = completedAttempts.reduce((sum, a) => sum + (a.correct_count || 0), 0);
    }

    return {
      totalCount,
      completedCount,
      avgAccuracy,
      highestScore,
      totalQuestionsSolved,
    };
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    return attempts.filter((att) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && att.status === 'completed') ||
        (statusFilter === 'in_progress' && att.status === 'in_progress');

      const matchesSearch =
        searchQuery.trim() === '' ||
        (att.title_ta || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (att.title_en || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [attempts, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto py-2 sm:py-4 pb-28 sm:pb-20">
      {/* 1. Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold tracking-wider uppercase">
            <Link href="/learner/tests" className="hover:text-indigo-300 transition">
              {t('தேர்வு மையம்', 'Test Centre')}
            </Link>
            <span>/</span>
            <span className="text-slate-400">{t('முடிவுகள் பதிவேடு', 'Results Registry')}</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3 break-words font-tamil">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Award className="w-6 h-6" />
            </div>
            <span>{t('தேர்வு முடிவுகள் & மதிப்பெண் அட்டை பதிவேடு', 'Scorecards & Test Results')}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-tamil leading-relaxed break-words">
            {t(
              'நீங்கள் எழுதிய அனைத்து மாதிரித் தேர்வுகளின் மதிப்பெண்கள், துல்லிய விகிதம், நேர ஆய்வு மற்றும் முழுமையான விடைக்குறிப்புகள்.',
              'Official examination scorecards, question snapshots, time-speed analytics, and textbook explanations.'
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            href="/learner/mistake-vault"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t('தவறு பெட்டகம்', 'Mistake Vault')}</span>
          </Link>

          <Link
            href="/learner/tests"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition text-center"
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{t('புதிய மாதிரித் தேர்வு', 'Take New Test')}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tests */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              {t('மொத்த தேர்வுகள்', 'TOTAL TESTS')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {stats.totalCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 block mt-0.5 truncate">
              {stats.completedCount} {t('முழுமை பெற்றது', 'completed')}
            </span>
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
              {t('சராசரி துல்லியம்', 'AVG ACCURACY')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono tracking-tight">
              {stats.avgAccuracy}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-400/90 block mt-0.5 truncate">
              {stats.avgAccuracy >= 75 ? '🎯 High Performance' : '📈 Good Progress'}
            </span>
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
              {t('அதிகபட்ச மதிப்பெண்', 'TOP SCORE')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
              {stats.highestScore}
            </span>
            <span className="text-[11px] font-semibold text-amber-400/90 block mt-0.5 truncate">
              {t('மதிப்பெண்கள் (Highest pts)', 'Highest marks')}
            </span>
          </div>
        </div>

        {/* Correct Answers Solved */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              {t('தீர்க்கப்பட்ட வினாக்கள்', 'SOLVED')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono tracking-tight">
              {stats.totalQuestionsSolved}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 block mt-0.5 truncate">
              {t('சரியான விடைகள்', 'Correct answers')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Pills & Instant Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-2.5 sm:p-3 rounded-2xl border border-slate-800 shadow-sm">
        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', ta: `அனைத்தும் (${attempts.length})`, en: `All (${attempts.length})` },
            { id: 'completed', ta: `முடிந்தவை (${stats.completedCount})`, en: `Completed (${stats.completedCount})` },
            { id: 'in_progress', ta: `தொடர்பவை (${attempts.length - stats.completedCount})`, en: `In Progress (${attempts.length - stats.completedCount})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                statusFilter === pill.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {lang === 'en' ? pill.en : pill.ta}
            </button>
          ))}
        </div>

        {/* Search Bar with Clear Button */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder={t('தேர்வு பெயரைத் தேடுக...', 'Search by exam title...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full bg-slate-700"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 4. Scorecard List */}
      {loading ? (
        /* Branded concentric ring loading state */
        <div className="text-center py-24 bg-slate-900/40 rounded-3xl border border-slate-800 flex flex-col items-center justify-center p-6 text-slate-100">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10">
              <Award className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div className="absolute -inset-1.5 rounded-2xl border-2 border-amber-500/40 border-t-transparent animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-white font-tamil tracking-tight">
            {t('மதிப்பெண் அட்டைகள் ஏற்றப்படுகின்றன...', 'Loading scorecards and test records...')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs font-tamil">
            {t('முந்தைய தேர்வு முயற்சிகள் பெறப்படுகின்றன...', 'Fetching your past test attempts and analytics...')}
          </p>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-pulse rounded-full w-full" />
          </div>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-6 space-y-3">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300 font-tamil">
            {t('தேர்வு முடிவுகள் எதுவும் கிடைக்கவில்லை', 'No test results found')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-tamil">
            {searchQuery
              ? t('உங்கள் தேடலுக்கு ஏற்ற முடிவுகள் இல்லை. தேடல் சொல்லை மாற்றவும்.', 'No test matched your search query. Try clearing the filter.')
              : t('மாதிரி தேர்வுகள் அல்லது பாடத்திட்டத்திலிருந்து புதிய தேர்வை எழுதினால் உங்கள் மதிப்பெண் அட்டை இங்கு தோன்றும்.', 'Start a mock test to view detailed scorecards, answer keys, and explanations here.')}
          </p>
          <div className="pt-2">
            <Link
              href="/learner/tests"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('தேர்வு மையத்திற்கு செல்', 'Go to Test Centre')}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAttempts.map((att) => {
            const isCompleted = att.status === 'completed';
            const minutes = Math.floor((att.total_time_seconds || 0) / 60);
            const seconds = (att.total_time_seconds || 0) % 60;
            const primaryTitle = lang === 'en' ? (att.title_en || att.title_ta) : att.title_ta;
            const secondaryTitle = lang === 'en' ? att.title_ta : att.title_en;

            return (
              <div
                key={att.id}
                className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 rounded-3xl p-5 sm:p-6 transition-all flex flex-col justify-between shadow-md space-y-4"
              >
                {/* Card Top: Status & Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{t('முடிந்தது', 'Completed')}</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>{t('எழுதப்பட்டு வருகிறது', 'In Progress')}</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {new Date(att.completed_at || att.started_at).toLocaleDateString(
                        lang === 'ta' ? 'ta-IN' : 'en-IN',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-base font-bold text-white leading-snug break-words ${lang === 'ta' ? 'font-tamil' : ''}`}>
                    {primaryTitle || (lang === 'en' ? 'Mock Examination' : 'மாதிரித் தேர்வு')}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 break-words">{secondaryTitle}</p>

                  {/* 3 Micro Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">
                        {t('மதிப்பெண்', 'Score')}
                      </span>
                      <strong className="text-amber-400 font-mono text-sm block mt-0.5">
                        {att.score} pts
                      </strong>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">
                        {t('துல்லியம்', 'Accuracy')}
                      </span>
                      <strong className="text-emerald-400 font-mono text-sm block mt-0.5">
                        {att.accuracy_percentage}%
                      </strong>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">
                        {t('நேரம்', 'Time')}
                      </span>
                      <strong className="text-cyan-300 font-mono text-xs block mt-0.5">
                        {minutes}m {seconds}s
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {isCompleted ? (
                    <>
                      <Link
                        href={`/learner/tests/results/${att.id}`}
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition text-center cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-amber-300 shrink-0" />
                        <span className="font-tamil">{t('மதிப்பெண் அட்டை & தீர்வுகள்', 'View Scorecard & Solutions')}</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </Link>

                      <Link
                        href={`/learner/tests/${att.test_template_id || att.id}/print`}
                        target="_blank"
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                        title={t('வினாத்தாளை அச்சிடு', 'Print Question Paper')}
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="hidden sm:inline">{t('அச்சிடு', 'Print')}</span>
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/learner/tests/${att.id}`}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition text-center cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span className="font-tamil">{t('தேர்வைத் தொடர்க', 'Resume Examination')}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

