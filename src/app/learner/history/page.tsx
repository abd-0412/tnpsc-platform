'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  FileText,
  Calendar,
  Play
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

export default function LearnerHistoryPage() {
  const { lang, t } = useLanguage();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learner/history');
      const data = await res.json();
      if (res.ok) {
        setAttempts(data.attempts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold tracking-wider uppercase mb-1">
            <span>{t('தேர்வு வரலாறு', 'Assessment Record')}</span>
            <span>•</span>
            <span>{t('மதிப்பெண் பதிவேடு', 'Score Log')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 break-words font-tamil">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>{t('தேர்வு வரலாறு & முந்தைய முயற்சிகள்', 'Test History & Past Attempts')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-tamil leading-relaxed break-words">
            {t(
              'நீங்கள் எழுதிய முந்தைய மாதிரி தேர்வுகள், மதிப்பெண்கள், துல்லிய விகிதம் மற்றும் தீர்வு விளக்கங்கள்.',
              'Review detailed question snapshots, accuracy rates, and answer keys from all your previous exam sessions.'
            )}
          </p>
        </div>

        <Link
          href="/learner/tests"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer shrink-0 text-center"
        >
          <span>{t('புதிய தேர்வு எழுது', 'Take New Test')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* History List */}
      {loading ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            {t('வரலாறு ஏற்றப்படுகிறது...', 'Loading attempt history...')}
          </p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300 font-tamil">
            {t('முந்தைய தேர்வுகள் எதுவும் இல்லை', 'No test attempts yet')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4 font-tamil">
            {t(
              'மாதிரி தேர்வுகள் அல்லது பாடத்திட்டத்திலிருந்து புதிய தேர்வை எழுதினால் உங்கள் வரலாறு இங்கு தோன்றும்.',
              'Start a test from the Test Centre or Syllabus Explorer to see your performance history here.'
            )}
          </p>
          <Link
            href="/learner/tests"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
          >
            {t('தேர்வு மையத்திற்கு செல்', 'Go to Test Centre')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((att) => {
            const isCompleted = att.status === 'completed';
            const minutes = Math.floor((att.total_time_seconds || 0) / 60);
            const seconds = (att.total_time_seconds || 0) % 60;
            const primaryTitle = lang === 'en' ? (att.title_en || att.title_ta) : att.title_ta;
            const secondaryTitle = lang === 'en' ? att.title_ta : att.title_en;

            return (
              <div
                key={att.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-6 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isCompleted ? t('முடிந்தது', 'Completed') : t('தொடர்கிறது', 'In Progress')}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {new Date(att.completed_at || att.started_at).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className={`text-sm sm:text-base font-bold text-white leading-snug break-words ${lang === 'ta' ? 'font-tamil' : ''}`}>
                    {primaryTitle || (lang === 'en' ? 'Mock Examination' : 'மாதிரித் தேர்வு')}
                  </h3>
                  <p className="text-xs text-slate-400 break-words">{secondaryTitle}</p>

                  {isCompleted && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs pt-1">
                      <span className="text-slate-400 font-tamil">
                        {t('மதிப்பெண்:', 'Score:')} <strong className="text-amber-400 font-mono">{att.score} pts</strong>
                      </span>
                      <span className="text-slate-600 hidden sm:inline">•</span>
                      <span className="text-slate-400 font-tamil">
                        {t('துல்லியம்:', 'Accuracy:')} <strong className="text-emerald-400 font-mono">{att.accuracy_percentage}%</strong>
                      </span>
                      <span className="text-slate-600 hidden sm:inline">•</span>
                      <span className="text-slate-400 font-tamil">
                        {t('நேரம்:', 'Time:')} <strong className="text-cyan-400 font-mono">{minutes}m {seconds}s</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {isCompleted ? (
                    <Link
                      href={`/learner/tests/results/${att.id}`}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{t('மதிப்பெண் அட்டை & தீர்வுகள்', 'Scorecard & Solutions')}</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/learner/tests/${att.id}`}
                      className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>{t('தேர்வைத் தொடர்க', 'Resume Examination')}</span>
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
