'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  Flame,
  FileCheck2,
  Target,
  BarChart3,
  BookOpen,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  WifiOff,
  Layers,
  GraduationCap,
  Calendar,
  Award,
  ChevronRight,
  HelpCircle,
  Play,
  CheckSquare
} from 'lucide-react';

interface Props {
  profile: any;
  totalAttempts: number;
  avgAccuracy: string;
  avgScore: string;
  dueRevisionsCount: number;
  activeExams: any[];
}

export default function LearnerDashboardClient({
  profile,
  totalAttempts,
  avgAccuracy,
  avgScore,
  dueRevisionsCount,
  activeExams,
}: Props) {
  const { lang, t } = useLanguage();
  const [streakData, setStreakData] = useState<any>(null);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { ta: 'காலை வணக்கம்', en: 'Good morning' };
    } else if (hour < 17) {
      return { ta: 'மதிய வணக்கம்', en: 'Good afternoon' };
    } else {
      return { ta: 'மாலை வணக்கம்', en: 'Good evening' };
    }
  }, []);

  // Today formatted in IST
  const todayDateString = useMemo(() => {
    return new Date().toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [lang]);

  useEffect(() => {
    fetch('/api/learner/daily-goal')
      .then((res) => res.json())
      .then((json) => {
        if (json && !json.error) {
          setStreakData(json);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const todayCompleted = streakData?.today?.completedQuestions || 0;
  const todayTarget = streakData?.today?.targetQuestions || 50;
  const todayPercentage = Math.min(100, streakData?.today?.percentage || Math.round((todayCompleted / todayTarget) * 100));
  const isGoalDone = todayCompleted >= todayTarget;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* 1. Hero Welcome & Quick Launch Banner */}
      <div className="relative overflow-hidden p-5 sm:p-7 lg:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950/80 border border-indigo-500/30 shadow-2xl">
        {/* Subtle background glow circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>TNPSC 2025 • {t('மாணவர் தளம்', 'Learner Portal')}</span>
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-400 font-medium capitalize">
                📅 {todayDateString}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              {lang === 'en'
                ? `${greeting.en}, ${profile?.full_name || 'Learner'}!`
                : `${greeting.ta}, ${profile?.full_name || 'மாணவர்'}!`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-tamil break-words">
              {t(
                'தினசரி பயிற்சி இலக்குகளை அடையுங்கள், மாதிரி தேர்வுகளை எழுதுங்கள், தவறு திருத்த பெட்டகம் (Mistake Vault) மூலம் பலவீனமான பகுதிகளை நினைவுகூருங்கள்.',
                'Achieve daily study targets, attempt real-time mock tests, and master weak areas using Spaced Repetition Mistake Vault.'
              )}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full lg:w-auto">
            <Link
              href="/learner/practice"
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer text-center"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{t('உடனடி பயிற்சி செய்', 'Practice Questions')}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>

            <Link
              href="/learner/tests"
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs sm:text-sm transition-all cursor-pointer text-center"
            >
              <FileCheck2 className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>{t('முழு மாதிரி தேர்வு எழுது', 'Take Full Mock Test')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Daily Streak & Target Consistency Banner (Linear / Apple Health Style) */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 shadow-xl space-y-3.5">
        {/* Top Header: Flame + Streak + Status Pill on left, Sleek Link on right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-pulse fill-amber-400/20" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight">
                  {streakData?.currentStreak ?? 0} {t('நாட்கள் தொடர்', 'Day Streak')}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                    streakData?.streakStatus === 'active_today'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {streakData?.streakStatus === 'active_today'
                    ? t('உறுதியானது 🔥', 'Protected 🔥')
                    : t('நிலுவை', 'Pending')}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/learner/tracker"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg hover:bg-amber-500/10 transition"
          >
            <span>Streak Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Progress & Goal Status */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium truncate pr-2">
              {isGoalDone
                ? t('இன்றைய 50 வினாக்கள் இலக்கு நிறைவடைந்தது! 🎉', 'Today 50 questions goal achieved! 🎉')
                : lang === 'en'
                ? `Today: ${todayCompleted} / ${todayTarget} questions completed`
                : `இன்று: ${todayCompleted} / ${todayTarget} வினாக்கள் முடிந்தது`}
            </span>
            <span className="font-mono font-bold text-amber-400 shrink-0">{todayPercentage}%</span>
          </div>

          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/90">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isGoalDone
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-sm shadow-amber-500/50'
              }`}
              style={{ width: `${todayPercentage}%` }}
            />
          </div>
        </div>

        {/* 3-Column Subject Micro-Grid (Always fits horizontally on 100% of screens) */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <div className="bg-slate-950/70 border border-indigo-500/20 rounded-xl px-2 py-1.5 text-center">
            <span className="text-[10px] text-indigo-300 font-medium block truncate">
              {t('பொதுத்தமிழ்', 'Tamil')}
            </span>
            <strong className="text-xs sm:text-sm text-white font-mono block mt-0.5">
              {streakData?.today?.subjectBreakdown?.tamil || 0}
            </strong>
          </div>

          <div className="bg-slate-950/70 border border-purple-500/20 rounded-xl px-2 py-1.5 text-center">
            <span className="text-[10px] text-purple-300 font-medium block truncate">
              {t('கணிதம்', 'Aptitude')}
            </span>
            <strong className="text-xs sm:text-sm text-white font-mono block mt-0.5">
              {streakData?.today?.subjectBreakdown?.aptitude || 0}
            </strong>
          </div>

          <div className="bg-slate-950/70 border border-teal-500/20 rounded-xl px-2 py-1.5 text-center">
            <span className="text-[10px] text-teal-300 font-medium block truncate">
              {t('பொது அறிவு', 'GS')}
            </span>
            <strong className="text-xs sm:text-sm text-white font-mono block mt-0.5">
              {streakData?.today?.subjectBreakdown?.generalStudies || 0}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Primary KPI Metric Cards (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tests Completed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">TESTS</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">{totalAttempts}</span>
            <span className="text-xs font-bold text-slate-200 block mt-0.5 truncate">
              {t('எழுதிய தேர்வுகள்', 'Tests Attempted')}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {t('மொத்த தேர்வுகள்', 'Total Sessions')}
            </span>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">ACCURACY</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">{avgAccuracy}%</span>
            <span className="text-xs font-bold text-slate-200 block mt-0.5 truncate">
              {t('சராசரி துல்லியம்', 'Overall Accuracy')}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {t('துல்லிய விகிதம்', 'Accuracy Rate')}
            </span>
          </div>
        </div>

        {/* Average Score */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">SCORE</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">{avgScore}</span>
            <span className="text-xs font-bold text-slate-200 block mt-0.5 truncate">
              {t('சராசரி மதிப்பெண்', 'Average Score')}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {t('மதிப்பெண் நிலை', 'Score Trajectory')}
            </span>
          </div>
        </div>

        {/* Mistake Vault Due */}
        <Link
          href="/learner/mistake-vault"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 transition-all group flex flex-col justify-between shadow-md space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">{dueRevisionsCount || 0}</span>
            <span className="text-xs font-bold text-amber-300 block mt-0.5 truncate">
              {t('மீள்பார்வை நிலுவை', 'Due for Revision')}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {t('தவறு திருத்த பெட்டகம்', 'Mistake Vault')}
            </span>
          </div>
        </Link>
      </div>

      {/* 4. Target Examinations Hub (Full Responsive Cards) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>{t('இலக்கு தேர்வுகள் (Target Examinations)', 'Target Examinations')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t(
                'அதிகாரப்பூர்வ TNPSC பாடத்திட்டம் மற்றும் தேர்வு முறைகளின் படி கட்டமைக்கப்பட்டது.',
                'Curated syllabus, questions, and full-length timed mock tests for active examinations.'
              )}
            </p>
          </div>

          <Link
            href="/learner/exams"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>{t('அனைத்து தேர்வுகள்', 'View All Exams')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeExams?.map((exam) => (
            <div
              key={exam.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase font-mono">
                    {exam.code || 'TNPSC'}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{t('செயலில்', 'Active')}</span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {lang === 'en' ? exam.title_en : exam.title_ta}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {lang === 'en' ? exam.title_ta : exam.title_en}
                </p>
              </div>

              {/* Action Buttons: Responsive Wrap */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800/80">
                <Link
                  href={`/learner/practice?exam=${exam.id}`}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('பயிற்சி வினாக்கள்', 'Practice Questions')}</span>
                </Link>

                <Link
                  href={`/learner/tests?exam=${exam.id}`}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition text-center"
                >
                  <FileCheck2 className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span>{t('மாதிரி தேர்வுகள்', 'Mock Tests')}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 4 Core Learning Pillars (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Mistake Vault */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {t('தவறு திருத்த பெட்டகம்', 'Mistake Vault')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t(
                '1, 3, 7, 14, 30 நாட்கள் இடைவெளி நினைவுகூர்தல் மூலம் தவறுகளை நிரந்தரமாக சரிசெய்யவும்.',
                'Spaced repetition schedules to permanently eliminate test mistakes.'
              )}
            </p>
          </div>

          <Link
            href="/learner/mistake-vault"
            className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition text-center"
          >
            <span className="truncate">
              {t(`மீள்பார்வை (${dueRevisionsCount || 0})`, `Review (${dueRevisionsCount || 0})`)}
            </span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {/* Pillar 2: 3D Flashcards & Capsules */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {t('3D Flashcards & திருப்புதல்', 'Revision Flashcards')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t(
                'கவிஞர்கள் புனைப்பெயர்கள், முக்கிய சட்டப்பிரிவுகள், மற்றும் கணித சூத்திரங்களை விரைவாக நினைவுகூருங்கள்.',
                'Interactive flip cards for Tamil scholars, polity articles, and math formulas.'
              )}
            </p>
          </div>

          <Link
            href="/learner/capsules"
            className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 text-center"
          >
            <span>{t('Flashcards திறக்க', 'Open Deck')}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {/* Pillar 3: Syllabus Tracker */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {t('பாடத்திட்ட நிறைவு', 'Syllabus Tracker')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t(
                '6 முதல் 12-ஆம் வகுப்பு புதிய சமச்சீர் பாடநூல்களின் இயல்கள் மற்றும் பாடங்களை கண்காணிக்கும் செக்லிஸ்ட்.',
                'Topic checklist covering 6th to 12th Standard revised Samacheer Kalvi textbooks.'
              )}
            </p>
          </div>

          <Link
            href="/learner/tracker"
            className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition text-center"
          >
            <span>{t('பாடத்திட்டம் பார்', 'View Tracker')}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {/* Pillar 4: Offline Centre */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {t('ஆஃப்லைன் தேர்வு மையம்', 'Offline PWA Centre')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t(
                'இணையம் இல்லாமலும் மாதிரி தேர்வுகளை மொபைல் அல்லது லேப்டாப்பில் பதிவிறக்கி பயிற்சி செய்யவும்.',
                'Download full tests and study offline. Syncs automatically upon reconnection.'
              )}
            </p>
          </div>

          <Link
            href="/learner/offline"
            className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition text-center"
          >
            <span>{t('ஆஃப்லைன் மையம்', 'Open Offline')}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
