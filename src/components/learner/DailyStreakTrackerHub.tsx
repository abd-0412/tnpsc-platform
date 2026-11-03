'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Flame,
  Award,
  Zap,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Crown,
  BookOpen,
  RefreshCw,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import { DailyGoalPayload, DayActivity, MilestoneBadge } from '@/lib/streak-engine';

export default function DailyStreakTrackerHub() {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<DailyGoalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [customTarget, setCustomTarget] = useState<number>(50);
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);
  const [heatmapRange, setHeatmapRange] = useState<'30' | '90' | '365'>('90');

  // Load custom target from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tnpsc_learner_daily_target');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if ([25, 50, 75, 100, 150].includes(parsed)) {
        setCustomTarget(parsed);
      }
    }
  }, []);

  const fetchDailyGoal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learner/daily-goal');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load daily goal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyGoal();
  }, []);

  const handleTargetChange = (target: number) => {
    setCustomTarget(target);
    localStorage.setItem('tnpsc_learner_daily_target', String(target));
  };

  // Recompute today target stats based on user custom preference
  const todayProgress = useMemo(() => {
    if (!data) return null;
    const completed = data.today.completedQuestions;
    const target = customTarget;
    const percentage = Math.min(100, Math.round((completed / target) * 100));
    const isCompleted = completed >= target;
    const remaining = Math.max(0, target - completed);

    return {
      completed,
      target,
      percentage,
      isCompleted,
      remaining,
      minutes: data.today.completedMinutes,
      subjectBreakdown: data.today.subjectBreakdown,
    };
  }, [data, customTarget]);

  // Organize heatmap into 7-day columns based on selected range
  const filteredHeatmap = useMemo(() => {
    if (!data || !data.heatmap) return [];
    if (heatmapRange === '30') return data.heatmap.slice(-35); // ~5 weeks
    if (heatmapRange === '90') return data.heatmap.slice(-91); // ~13 weeks
    return data.heatmap; // 365 days
  }, [data, heatmapRange]);

  const heatmapWeeks = useMemo(() => {
    const weeks: DayActivity[][] = [];
    let currentWeek: DayActivity[] = [];

    filteredHeatmap.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === filteredHeatmap.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  }, [filteredHeatmap]);

  if (loading || !data) {
    return (
      <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 bg-slate-900/60 rounded-3xl border border-slate-800">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm font-medium text-slate-300">
          {t('தினசரி இலக்கு & Streak விவரங்கள் ஏற்றப்படுகின்றன...', 'Loading daily targets and study streak metrics...')}
        </p>
        <span className="text-xs text-slate-500">
          {t('தொடர் செயல்பாடுகளை ஒருங்கிணைக்கிறது', 'Synchronizing daily activity and milestone badges')}
        </span>
      </div>
    );
  }

  const { currentStreak, longestStreak, streakStatus, milestones, totalQuestionsAllTime, totalStudyDaysAllTime } = data;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* 1. Hero Streak & Daily Target Card */}
      <div className="relative overflow-hidden p-5 sm:p-7 lg:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Streak Flame Badge */}
          <div className="lg:col-span-4 flex items-center gap-4 sm:gap-5 border-b lg:border-b-0 lg:border-r border-slate-700/60 pb-5 lg:pb-0 lg:pr-6">
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Flame className="w-9 h-9 sm:w-12 sm:h-12 text-amber-400 animate-pulse" />
              </div>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow">
                {streakStatus === 'active_today'
                  ? t('செயலில்', 'Active')
                  : streakStatus === 'pending_today'
                  ? t('நிலுவை', 'Pending')
                  : t('தொடங்கு', 'Start')}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                  {currentStreak}
                </span>
                <span className="text-sm font-bold text-amber-400">
                  {t('நாட்கள் தொடர்', 'Day Streak')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-snug">
                {streakStatus === 'active_today' &&
                  t('இன்றைய தொடர் உறுதி செய்யப்பட்டது! 🔥', 'Today streak protected & locked in! 🔥')}
                {streakStatus === 'pending_today' &&
                  t('இன்றைய இலக்கை முடித்து Streak-ஐ நீட்டிக்கவும்!', 'Practice today to keep your streak alive!')}
                {streakStatus === 'broken' &&
                  t('இன்றே உங்கள் புதிய படிப்பு Streak-ஐ தொடங்குங்கள்!', 'Start your unbroken streak today!')}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[11px] text-slate-400">
                <span>
                  {t('வாழ்நாள் சாதனை', 'Best')}:{' '}
                  <strong className="text-amber-300 font-mono">{longestStreak} {t('நாட்கள்', 'days')}</strong>
                </span>
                <span>•</span>
                <span>
                  {t('பயிற்சி நாட்கள்', 'Active')}:{' '}
                  <strong className="text-slate-200 font-mono">{totalStudyDaysAllTime} {t('நாட்கள்', 'days')}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Today's Target Progress */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {t('இன்றைய படிப்பு இலக்கு', "Today's Study Goal")}
                  </span>
                  {todayProgress?.isCompleted && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('இலக்கு முடிந்தது!', 'Goal Achieved!')}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5 flex items-baseline gap-2">
                  <span className="font-mono">
                    {todayProgress?.completed} / {todayProgress?.target} {t('வினாக்கள்', 'Questions')}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    ({todayProgress?.percentage}%)
                  </span>
                </h3>
              </div>

              {/* Target Selector Buttons */}
              <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto shrink-0">
                <span className="text-[10px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-amber-400" />
                  <span>{t('இலக்கு', 'Goal')}:</span>
                </span>
                {[25, 50, 75, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleTargetChange(num)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      customTarget === num
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    todayProgress?.isCompleted
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, todayProgress?.percentage || 0)}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400">
                <span>
                  {todayProgress?.remaining! > 0
                    ? lang === 'en'
                      ? `${todayProgress?.remaining} questions remaining to reach daily goal`
                      : `இலக்கை எட்ட இன்னும் ${todayProgress?.remaining} வினாக்கள் தேவை`
                    : t('இன்றைய இலக்கு முழுமையடைந்தது! அற்புதமான தொடர்ச்சி! 🎉', 'Goal achieved for today! Fantastic consistency! 🎉')}
                </span>
                <span className="flex items-center space-x-1 font-mono text-[11px] text-slate-300 shrink-0">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>{todayProgress?.minutes} {t('நிமிடங்கள்', 'mins')}</span>
                </span>
              </div>
            </div>

            {/* Subject Distribution & CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="grid grid-cols-3 gap-2 flex-1">
                <div className="px-2 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-center">
                  <span className="text-[10px] text-indigo-300 font-medium block truncate">{t('பொதுத்தமிழ்', 'Tamil')}</span>
                  <strong className="font-mono text-xs text-white">{todayProgress?.subjectBreakdown.tamil || 0}</strong>
                </div>
                <div className="px-2 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-center">
                  <span className="text-[10px] text-purple-300 font-medium block truncate">{t('கணிதம்', 'Aptitude')}</span>
                  <strong className="font-mono text-xs text-white">{todayProgress?.subjectBreakdown.aptitude || 0}</strong>
                </div>
                <div className="px-2 py-1.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-center">
                  <span className="text-[10px] text-teal-300 font-medium block truncate">{t('பொது அறிவு', 'GS')}</span>
                  <strong className="font-mono text-xs text-white">{todayProgress?.subjectBreakdown.generalStudies || 0}</strong>
                </div>
              </div>

              <Link
                href="/learner/practice"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('உடனடி பயிற்சி செய்', 'Practice Now')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Apple Fitness Style: This Week's 7-Day Consistency Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{t('இந்த வார தொடர் செயல்பாடு (7 Days Consistency)', "This Week's Activity")}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {t('இலக்கு', 'Goal')}: {customTarget} Qs/{t('நாள்', 'day')}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
          {data.weeklyTrend.map((day) => {
            const isMet = day.count >= customTarget;
            const hasActivity = day.count > 0;

            return (
              <div
                key={day.date}
                className={`p-2 sm:p-3 rounded-2xl border text-center transition flex flex-col items-center justify-between space-y-1.5 ${
                  isMet
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : hasActivity
                    ? 'bg-slate-950/80 border-slate-700/80'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
                  {lang === 'en' ? day.dayName.substring(0, 3) : day.dayNameTa.substring(0, 2)}
                </span>

                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    isMet
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30 font-bold'
                      : hasActivity
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isMet ? (
                    <Flame className="w-4 h-4" />
                  ) : hasActivity ? (
                    <span className="text-[10px] font-bold font-mono">{day.count}</span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </div>

                <span className="text-[10px] font-mono text-slate-400 hidden sm:block">
                  {day.count} Qs
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Study Activity Heatmap with Time Filter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{t('படிப்பு செயல்பாட்டு வரைபடம் (Activity Heatmap)', 'Study Activity Heatmap')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t(
                'தினசரி பயிற்சி செய்த வினாக்களின் எண்ணிக்கை மற்றும் தொடர்ச்சி.',
                'Visual breakdown of questions attempted each day.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Range Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setHeatmapRange('30')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  heatmapRange === '30' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('30 நாட்கள்', '30 Days')}
              </button>
              <button
                onClick={() => setHeatmapRange('90')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  heatmapRange === '90' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('90 நாட்கள்', '90 Days')}
              </button>
              <button
                onClick={() => setHeatmapRange('365')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  heatmapRange === '365' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('முழு ஆண்டு (365d)', 'Full Year')}
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
              <span>{t('குறைவு', 'Less')}</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700" />
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-900 border border-emerald-800" />
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700 border border-emerald-600" />
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400" />
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 border border-amber-300" />
              <span>{t('அதிகம்', 'More')}</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto scrollbar-none pb-2 touch-pan-x">
          <div className="inline-flex gap-1">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day) => {
                  let bgClass = 'bg-slate-800/80 border-slate-800 hover:border-slate-500';
                  if (day.level === 1) bgClass = 'bg-emerald-950 border-emerald-800 hover:border-emerald-600';
                  if (day.level === 2) bgClass = 'bg-emerald-700 border-emerald-600 hover:border-emerald-400';
                  if (day.level === 3) bgClass = 'bg-emerald-500 border-emerald-400 hover:border-emerald-300';
                  if (day.level === 4) bgClass = 'bg-amber-400 border-amber-300 hover:border-amber-200';

                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onClick={() => setHoveredDay(day)}
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] border transition-colors cursor-pointer ${bgClass}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Hover/Touch Tooltip */}
        <div className="min-h-[32px] text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
          {hoveredDay ? (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="font-semibold text-white">
                📅 {new Date(hoveredDay.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold font-mono">
                {hoveredDay.count} {t('வினாக்கள் பயிற்சி', 'questions attempted')}
              </span>
              {hoveredDay.testsCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-indigo-300">{hoveredDay.testsCount} {t('தேர்வுகள்', 'tests')}</span>
                </>
              )}
              {hoveredDay.minutes > 0 && (
                <>
                  <span>•</span>
                  <span className="text-slate-400">{hoveredDay.minutes} {t('நிமிடங்கள்', 'mins')}</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-slate-500 italic">
              {t('குறிப்பிட்ட நாளின் செயல்பாட்டைக் காண கட்டங்களைத் தொடவும்.', 'Touch or hover over any square to inspect activity on that date.')}
            </span>
          )}
        </div>
      </div>

      {/* 4. Milestone Badges */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>{t('தொடர் முயற்சி விருதுகள் & மைல்கற்கள்', 'Consistency Badges & Milestones')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('விடாமுயற்சியுடன் படிக்கும் மாணவர்களுக்கான அங்கீகாரம்.', 'Milestones unlocked through continuous daily practice.')}
            </p>
          </div>
          <span className="text-xs text-purple-300 font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">
            {milestones.filter((m) => m.unlocked).length} / {milestones.length} {t('பெறப்பட்டது', 'Unlocked')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition ${
                m.unlocked
                  ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-purple-500/15 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    m.unlocked
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {m.id === 'streak_3' && <Flame className="w-5 h-5" />}
                  {m.id === 'streak_7' && <Zap className="w-5 h-5" />}
                  {m.id === 'streak_15' && <ShieldCheck className="w-5 h-5" />}
                  {m.id === 'streak_30' && <Crown className="w-5 h-5" />}
                  {m.id === 'century_day' && <Target className="w-5 h-5" />}
                  {m.id === 'grand_500' && <Award className="w-5 h-5" />}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">
                      {lang === 'en' ? m.title_en : m.title_ta}
                    </h4>
                    {m.unlocked && (
                      <span className="text-[11px] text-emerald-400 font-bold">✓</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {lang === 'en' ? m.description_en : m.description_ta}
                  </p>

                  {!m.unlocked && (
                    <div className="pt-1.5 space-y-1">
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right font-mono">
                        {m.progress}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
