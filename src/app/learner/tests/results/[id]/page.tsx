'use client';

import { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import TimeAnalyticsHub from '@/components/learner/TimeAnalyticsHub';
import { analyzeExamTimeAndSpeed } from '@/lib/time-analytics';
import { normalizeOptionId, isMatchingOption } from '@/lib/option-utils';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Languages,
  Flame,
  Check,
  ChevronLeft,
  Timer,
  AlertTriangle,
  Printer,
  Sparkles,
  Zap,
  Target,
  Trophy,
  ShieldCheck
} from 'lucide-react';

interface AttemptResult {
  id: string;
  title_ta: string;
  title_en: string;
  score: number;
  accuracy_percentage: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  total_time_seconds: number;
  completed_at: string;
}

interface ResultItem {
  id: string;
  question_id: string;
  question_order: number;
  question_snapshot: {
    id: string;
    kind: string;
    difficulty: string;
    texts: {
      ta: {
        question: string;
        options: Array<{ id: string; text: string }>;
        explanation?: string;
      };
      en?: {
        question: string;
        options: Array<{ id: string; text: string }>;
        explanation?: string;
      };
    };
    answer: {
      correct_option_id: string;
    };
    source?: {
      book?: string;
      standard?: string;
      term?: string;
      page?: number;
    };
    tags?: string[];
  };
  selected_answer: { option_id: string } | null;
  is_answered: boolean;
  is_correct: boolean | null;
  marks_obtained: number;
  time_spent_seconds?: number;
}

export default function TestResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: attemptId } = use(params);
  const router = useRouter();
  const { lang, toggleLang, t } = useLanguage();

  const [attempt, setAttempt] = useState<AttemptResult | null>(null);
  const [items, setItems] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [viewTab, setViewTab] = useState<'solutions' | 'time_analytics'>('solutions');

  const timeReport = useMemo(() => {
    return analyzeExamTimeAndSpeed(items as any, attempt?.total_time_seconds || 0);
  }, [items, attempt]);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/learner/tests/${attemptId}`);
        const data = await res.json();
        if (res.ok) {
          setAttempt(data.attempt);
          setItems(data.items || []);
        } else {
          alert(data.error || 'Failed to load result');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [attemptId]);

  if (loading || !attempt) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none z-50">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10">
            <Award className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white font-tamil tracking-tight">
          {t('தேர்வு முடிவுகள் ஏற்றப்படுகின்றன...', 'Loading your examination scorecard...')}
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs font-tamil leading-relaxed">
          {t(
            'மதிப்பெண், துல்லிய விகிதம் மற்றும் தீர்வு விளக்கங்கள் பெறப்படுகின்றன...',
            'Evaluating score breakdown, accuracy percentiles and time traps...'
          )}
        </p>
        <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 animate-pulse rounded-full w-full" />
        </div>
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'correct') return item.is_correct === true;
    if (activeFilter === 'wrong') return item.is_correct === false;
    if (activeFilter === 'unanswered') return !item.is_answered;
    return true;
  });

  const minutes = Math.floor((attempt.total_time_seconds || 0) / 60);
  const seconds = (attempt.total_time_seconds || 0) % 60;
  const avgSecondsPerQ = Math.round((attempt.total_time_seconds || 0) / Math.max(1, attempt.total_questions));

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 sm:py-4 pb-28 sm:pb-20">
      {/* Back button & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5 min-w-0">
          <Link
            href="/learner/tests/results"
            className="inline-flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-1 transition py-1 px-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 w-fit"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span className="font-tamil">{t('அனைத்து தேர்வு முடிவுகள்', 'All Test Results')}</span>
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 break-words font-tamil">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Award className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span>{lang === 'en' ? attempt.title_en || attempt.title_ta : attempt.title_ta}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 break-words font-tamil">
            {lang === 'en' ? attempt.title_ta : attempt.title_en}
          </p>
        </div>

        {/* Action Buttons: Responsive wrap without clipping */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={toggleLang}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-indigo-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Languages className="w-4 h-4 shrink-0" />
            <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Print Scorecard (Ctrl + P)"
          >
            <Printer className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-tamil">{t('அச்சிடு', 'Print')}</span>
          </button>

          <Link
            href="/learner/mistake-vault"
            className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-tamil">{t('தவறு திருத்த பெட்டகம்', 'Mistake Vault')}</span>
          </Link>

          <Link
            href="/learner/tests"
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="font-tamil">{t('புதிய தேர்வு', 'New Test')}</span>
          </Link>
        </div>
      </div>

      {/* Scorecard Hero */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Final Score */}
        <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider block">
            {t('இறுதி மதிப்பெண்', 'Final Score')}
          </span>
          <p className="text-3xl sm:text-4xl font-black text-white mt-1.5 font-mono">
            {attempt.score}
            <span className="text-xs sm:text-sm font-semibold text-indigo-300 font-sans ml-1">
              {t('மதிப்பெண்', 'pts')}
            </span>
          </p>
          <span className="inline-block mt-2 text-[10px] sm:text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
            {t('வெற்றி நிலை: சிறந்த முயற்சி', 'Result: Completed')}
          </span>
        </div>

        {/* Card 2: Accuracy */}
        <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider block">
            {t('துல்லிய விகிதம்', 'Accuracy')}
          </span>
          <p className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1.5 font-mono">
            {attempt.accuracy_percentage}%
          </p>
          <span className="inline-block mt-2 text-[10px] sm:text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            {attempt.accuracy_percentage >= 80 ? '🎯 Target Surpassed' : '📈 Scope to Improve'}
          </span>
        </div>

        {/* Card 3: Correct vs Total */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center shadow-lg">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            {t('சரியானவை / மொத்தம்', 'Correct / Total')}
          </span>
          <p className="text-3xl sm:text-4xl font-black text-slate-100 mt-1.5 font-mono">
            <span className="text-emerald-400">{attempt.correct_count}</span>
            <span className="text-slate-500 text-2xl font-normal mx-1">/</span>
            <span>{attempt.total_questions}</span>
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-mono font-semibold">
            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              {attempt.wrong_count} {t('தவறு', 'Wrong')}
            </span>
            <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {attempt.unanswered_count} {t('விடுபட்டவை', 'Blank')}
            </span>
          </div>
        </div>

        {/* Card 4: Time Taken & Speed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center shadow-lg">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            {t('எடுத்துக்கொண்ட நேரம்', 'Time Taken')}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-cyan-300 mt-1.5 font-mono">
            {minutes}m {seconds}s
          </p>
          <span className="inline-block mt-2 text-[10px] sm:text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
            ~{avgSecondsPerQ}s / {t('வினா', 'Q')}
          </span>
        </div>
      </div>

      {/* Top View Mode Switcher: Solutions vs Time & Speed Analytics */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
        <button
          onClick={() => setViewTab('solutions')}
          className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            viewTab === 'solutions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>{t('முழு விடைக்குறிப்பு & தீர்வுகள்', 'Detailed Solutions')} ({items.length})</span>
        </button>

        <button
          onClick={() => setViewTab('time_analytics')}
          className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            viewTab === 'time_analytics'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Timer className="w-4 h-4 shrink-0" />
          <span>{t('வேகம் & நேரப் பொறி ஆய்வு', 'Speed & Time-Trap Analytics')}</span>
          {timeReport.timeTraps.length > 0 ? (
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0">
              {timeReport.timeTraps.length} {t('பொறிகள்', 'Traps')}
            </span>
          ) : (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0">
              ✓ Optimal
            </span>
          )}
        </button>
      </div>

      {viewTab === 'time_analytics' ? (
        <TimeAnalyticsHub report={timeReport} />
      ) : (
        <div className="space-y-6">
          {/* Performance Summary Pill Bar - Horizontally Scrollable on Mobile */}
          <div className="bg-slate-900/60 p-2.5 sm:p-3 rounded-2xl border border-slate-800 overflow-x-auto">
            <div className="flex items-center space-x-2 min-w-max">
              {[
                { id: 'all', label: lang === 'en' ? `All (${items.length})` : `அனைத்தும் (${items.length})` },
                { id: 'correct', label: lang === 'en' ? `Correct (${attempt.correct_count})` : `சரியானவை (${attempt.correct_count})` },
                { id: 'wrong', label: lang === 'en' ? `Incorrect (${attempt.wrong_count})` : `தவறானவை (${attempt.wrong_count})` },
                { id: 'unanswered', label: lang === 'en' ? `Skipped (${attempt.unanswered_count})` : `விடை தெரியவில்லை (${attempt.unanswered_count})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    activeFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

      {/* Question by Question Detailed Solutions */}
      <div className="space-y-5">
        {filteredItems.map((item) => {
          const snapshot = item.question_snapshot;
          const correctOptId = snapshot.answer?.correct_option_id;
          const userOptId = item.selected_answer?.option_id;
          const isCorrect = item.is_correct === true;
          const isSkipped = !item.is_answered;

          const isTamil = (snapshot.source?.book || '').includes('தமிழ்') || (snapshot.tags || []).includes('general_tamil');

          const questionText =
            isTamil || lang === 'ta'
              ? snapshot.texts?.ta?.question
              : snapshot.texts?.en?.question || snapshot.texts?.ta?.question;

          const options =
            isTamil || lang === 'ta'
              ? snapshot.texts?.ta?.options
              : snapshot.texts?.en?.options || snapshot.texts?.ta?.options;

          const explanation =
            isTamil || lang === 'ta'
              ? snapshot.texts?.ta?.explanation
              : snapshot.texts?.en?.explanation || snapshot.texts?.ta?.explanation;

          return (
            <div
              key={item.id}
              className={`bg-slate-900/80 border rounded-2xl p-6 space-y-4 shadow-sm transition ${
                isCorrect
                  ? 'border-emerald-500/40'
                  : isSkipped
                  ? 'border-slate-800'
                  : 'border-rose-500/40'
              }`}
            >
              {/* Question Item Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {t('வினா', 'Q')} {item.question_order}
                  </span>
                  {isCorrect && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t(`சரி (+${item.marks_obtained} மதிப்பெண்)`, `Correct (+${item.marks_obtained}m)`)}
                    </span>
                  )}
                  {!isCorrect && !isSkipped && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                      <XCircle className="w-3.5 h-3.5" />
                      {t('தவறு (பெட்டகத்தில் சேர்க்கப்பட்டது)', 'Incorrect (Saved to Mistake Vault)')}
                    </span>
                  )}
                  {isSkipped && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {t('விடை தெரியவில்லை / விடுபட்டது (0 மதிப்பெண்)', 'Answer Not Known / Skipped (0m)')}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2.5">
                  {item.time_spent_seconds !== undefined && item.time_spent_seconds > 0 && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        item.time_spent_seconds > 80 && !isCorrect
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                          : item.time_spent_seconds < 35 && isCorrect
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-cyan-300'
                      }`}
                      title="Time spent on this question"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{item.time_spent_seconds}s</span>
                      {item.time_spent_seconds > 80 && !isCorrect && (
                        <span className="text-[10px] text-rose-400 ml-0.5">⚠️ Trap</span>
                      )}
                    </span>
                  )}

                  {snapshot.source && (
                    <div className="text-xs text-indigo-300 hidden sm:flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {snapshot.source.book || `Std ${snapshot.source.standard}`} (Term {snapshot.source.term || '1'})
                        {snapshot.source.page ? ` • p. ${snapshot.source.page}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <h3 className={`text-base font-medium text-white leading-relaxed ${isTamil || lang === 'ta' ? 'font-tamil' : ''}`}>
                {questionText}
              </h3>

              {/* Options Breakdown */}
              <div className="space-y-2 pt-1">
                {options?.map((opt, optIdx) => {
                  const normOptId = normalizeOptionId(opt.id, optIdx);
                  const isUserSelection = isMatchingOption(userOptId, normOptId);
                  const isThisCorrect = isMatchingOption(correctOptId, normOptId);

                  let optClass = 'bg-slate-950/60 border-slate-800 text-slate-300';
                  if (isThisCorrect) {
                    optClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isUserSelection && !isThisCorrect) {
                    optClass = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
                  }

                  return (
                    <div
                      key={opt.id || optIdx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${optClass}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono text-slate-400 font-semibold">{normOptId}:</span>
                        <span className={isTamil || lang === 'ta' ? 'font-tamil' : ''}>{opt.text}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] flex-shrink-0">
                        {isThisCorrect && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {t('சரியான விடை', 'Correct Answer')}
                          </span>
                        )}
                        {isUserSelection && !isThisCorrect && (
                          <span className="text-rose-400 font-bold">{t('உங்கள் தேர்வு', 'Your Choice')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {explanation && (
                <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <strong className="text-amber-400 block font-semibold">
                    {t('பாடப்புத்தக விளக்கம் (Explanation):', 'Textbook Explanation:')}
                  </strong>
                  <p className={`leading-relaxed ${isTamil || lang === 'ta' ? 'font-tamil' : ''}`}>
                    {explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>
  );
}
