'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Zap,
  Activity,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Gauge,
  Sparkles,
  Trophy,
  ShieldCheck,
  Filter,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  Info,
  Check,
  PieChart,
  Brain,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react';

interface AvailableExam {
  id: string;
  title_en: string;
  title_ta: string;
}

interface OverviewData {
  totalTests: number;
  totalAttemptsCount: number;
  inProgressCount: number;
  abandonedCount: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  overallAccuracy: number;
  totalScore: number;
  avgScore: number;
  highestScore: number;
  totalTimeSeconds: number;
  avgSecondsPerQuestion: number;
  completionRate: number;
  trajectoryChange: number;
}

interface TrendItem {
  attemptId: string;
  index: number;
  title: string;
  titleEn: string;
  score: number;
  accuracy: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeSeconds: number;
  date: string;
  fullDate: string;
}

interface SubjectItem {
  id: string;
  nameEn: string;
  nameTa: string;
  domain: string;
  attempted: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number;
  avgSeconds: number;
}

interface DifficultyItem {
  level: 'easy' | 'medium' | 'hard';
  labelEn: string;
  labelTa: string;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  avgSeconds: number;
}

interface TopicItem {
  id: string;
  nameEn: string;
  nameTa: string;
  subjectId: string;
  subjectNameTa: string;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  avgSeconds: number;
}

interface FrequentMistakeItem {
  id: string;
  question_id: string;
  incorrect_count: number;
  review_count: number;
  repetition_level: number;
  reason: string;
  updated_at: string;
}

interface AnalyticsPayload {
  filters: {
    examId: string;
    dateRange: string;
    availableExams: AvailableExam[];
  };
  overview: OverviewData;
  trends: TrendItem[];
  subjects: SubjectItem[];
  topics: TopicItem[];
  difficultyAnalysis: DifficultyItem[];
  strengthsAndWeaknesses: {
    strongTopics: TopicItem[];
    weakTopics: TopicItem[];
    strongSubjects: SubjectItem[];
    weakSubjects: SubjectItem[];
    hasSufficientData: boolean;
  };
  mistakesInsight: {
    activeMistakes: number;
    masteredMistakes: number;
    totalVaultEntries: number;
    mistakeMasteryRate: number;
    frequentMistakes: FrequentMistakeItem[];
  };
}

export default function PerformanceAnalyticsDashboard() {
  const { lang, t } = useLanguage();

  // Filter States
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [chartMetric, setChartMetric] = useState<'accuracy' | 'score' | 'speed'>('accuracy');
  const [activeTab, setActiveTab] = useState<'all' | 'subjects' | 'syllabus' | 'mistakes'>('all');

  // Interactive States
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hoveredTrend, setHoveredTrend] = useState<TrendItem | null>(null);
  const [topicSearchQuery, setTopicSearchQuery] = useState<string>('');

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (selectedExam !== 'all') params.append('exam_id', selectedExam);
      if (selectedDateRange !== 'all') params.append('date_range', selectedDateRange);

      const res = await fetch(`/api/learner/analytics?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        console.error('Failed to load analytics:', json.error);
      }
    } catch (err) {
      console.error('Network error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedExam, selectedDateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Speed Status Helper
  const speedBenchmark = useMemo(() => {
    const sec = data?.overview?.avgSecondsPerQuestion || 0;
    if (sec === 0) {
      return {
        labelEn: 'No test data',
        labelTa: 'தரவுகள் இல்லை',
        color: 'slate',
        status: 'neutral',
      };
    }
    if (sec <= 45) {
      return {
        labelEn: 'Fast (<45s)',
        labelTa: 'மின்னல் வேகம் (<45வி)',
        color: 'emerald',
        status: 'optimal',
      };
    }
    if (sec <= 54) {
      return {
        labelEn: 'TNPSC Ideal (45-54s)',
        labelTa: 'சிறந்த தேர்வு வேகம் (45-54வி)',
        color: 'cyan',
        status: 'optimal',
      };
    }
    return {
      labelEn: 'Pacing Alert (>54s)',
      labelTa: 'வேகப் பயிற்சி தேவை (>54வி)',
      color: 'amber',
      status: 'warning',
    };
  }, [data?.overview?.avgSecondsPerQuestion]);

  // SVG Chart Dimensions & Computations
  const chartPoints = useMemo(() => {
    if (!data || !data.trends || data.trends.length === 0) return [];
    const width = 600;
    const height = 180;
    const padX = 45;
    const padY = 30;
    const trends = data.trends;

    const stepX = trends.length > 1 ? (width - padX * 2) / (trends.length - 1) : 0;

    let maxY = 100;
    if (chartMetric === 'score') {
      const maxScore = Math.max(...trends.map((t) => t.score), 100);
      maxY = Math.ceil(maxScore / 50) * 50;
    } else if (chartMetric === 'speed') {
      const maxSpeed = Math.max(...trends.map((t) => (t.totalQuestions > 0 ? Math.round(t.timeSeconds / t.totalQuestions) : 0)), 90);
      maxY = Math.max(90, Math.ceil(maxSpeed / 30) * 30);
    }

    return trends.map((item, idx) => {
      const x = trends.length === 1 ? width / 2 : padX + idx * stepX;
      let val = item.accuracy;
      if (chartMetric === 'score') val = item.score;
      else if (chartMetric === 'speed') {
        val = item.totalQuestions > 0 ? Math.round(item.timeSeconds / item.totalQuestions) : 0;
      }

      const clampedVal = Math.max(0, Math.min(maxY, val));
      const y = height - padY - (clampedVal / maxY) * (height - padY * 2);

      return {
        x,
        y,
        val,
        maxY,
        item,
        index: idx,
      };
    });
  }, [data, chartMetric]);

  const svgPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    if (chartPoints.length === 1) return `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    return chartPoints.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      return `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }, [chartPoints]);

  const svgAreaPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const height = 180;
    const padY = 30;
    const baselineY = height - padY;
    if (chartPoints.length === 1) return '';
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    return `${svgPath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [chartPoints, svgPath]);

  // Filtered Topics by Search Query
  const filteredTopics = useMemo(() => {
    if (!data?.topics) return [];
    if (!topicSearchQuery.trim()) return data.topics;
    const q = topicSearchQuery.toLowerCase();
    return data.topics.filter(
      (t) =>
        t.nameTa.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.subjectNameTa.toLowerCase().includes(q)
    );
  }, [data?.topics, topicSearchQuery]);

  // Loading State
  if (loading || !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-2xl shadow-indigo-500/10">
            <BarChart3 className="w-10 h-10 text-indigo-400 animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-indigo-500/40 border-t-transparent animate-spin" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white font-tamil tracking-tight">
          {t('செயல்திறன் ஆய்வு & புள்ளிவிவரங்கள் கணக்கிடப்படுகின்றன...', 'Calculating Performance Analytics & Benchmarks...')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-tamil leading-relaxed">
          {t(
            'TNPSC தேர்வு தரநிலைகளின் அடிப்படையில் உங்கள் வேகம், துல்லியம் மற்றும் பாடப்பிரிவு முன்னேற்றம் தொகுக்கப்படுகின்றன...',
            'Analyzing test trajectory, accuracy progression, and syllabus mastery against TNPSC cutoffs...'
          )}
        </p>
        <div className="w-56 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse rounded-full w-full" />
        </div>
      </div>
    );
  }

  const { overview, trends, subjects, difficultyAnalysis, strengthsAndWeaknesses, mistakesInsight, filters } = data;
  const hours = Math.floor(overview.totalTimeSeconds / 3600);
  const minutes = Math.floor((overview.totalTimeSeconds % 3600) / 60);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-28 sm:pb-20">
      {/* ========================================================================= */}
      {/* SECTION A: PAGE HEADER & FILTER CONTROL BAR                              */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Title & Subtitle */}
          <div className="space-y-2 min-w-0 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>TNPSC • {t('செயல்திறன் மையம்', 'Performance Dashboard')}</span>
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('அதிகாரப்பூர்வ மாதிரித் தேர்வு பகுப்பாய்வு', 'Official Blueprint & Cutoff Analytics')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-tamil">
              {t('செயல்திறன் பகுப்பாய்வு (Performance Analytics)', 'Performance Analytics & Growth Trajectory')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-tamil leading-relaxed break-words">
              {t(
                'துல்லிய விகிதம், மாதிரித் தேர்வு போக்குகள், பாடவாரியான பலம் மற்றும் பலவீனங்கள், மற்றும் TNPSC கட்-ஆஃப் தரநிலை ஒப்பீட்டு வரைபடம்.',
                'Track test accuracy trends, subject mastery, time pacing, and Spaced Repetition mistake recovery against TNPSC standards.'
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              title={t('புள்ளிவிவரங்களை புதுப்பி', 'Refresh Data')}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('புதுப்பி', 'Refresh')}</span>
            </button>

            <Link
              href="/learner/tests"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{t('மாதிரித் தேர்வு எழுது', 'Take Mock Test')}</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Filter Strip: Examination Selector & Date Range */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Examination Filter Dropdown */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t('தேர்வு:', 'Exam:')}</span>
            </span>
            <div className="relative flex-1 max-w-xs">
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer pr-8"
              >
                {filters.availableExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {lang === 'ta' ? ex.title_ta : ex.title_en}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Range Selector Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 shrink-0">
            {[
              { id: 'all', ta: 'முழுவதும் (All Time)', en: 'All Time' },
              { id: '7d', ta: '7 நாட்கள் (7D)', en: 'Last 7 Days' },
              { id: '30d', ta: '30 நாட்கள் (30D)', en: 'Last 30 Days' },
              { id: '90d', ta: '90 நாட்கள் (90D)', en: 'Last 90 Days' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedDateRange(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedDateRange === pill.id
                    ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent'
                }`}
              >
                {lang === 'en' ? pill.en : pill.ta}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION B: OVERALL PERFORMANCE OVERVIEW (6 KEYSTONE KPI METRIC CARDS)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Total Tests Completed */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
              {t('தேர்வுகள்', 'TESTS')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {overview.totalTests}
            </p>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              {overview.completionRate}% {t('முழுமை', 'completion rate')}
            </span>
          </div>
        </div>

        {/* Card 2: Total Questions Answered */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
              {t('வினாக்கள்', 'QUESTIONS')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {overview.totalQuestionsAttempted}
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5 truncate">
              {overview.totalCorrect} {t('சரியானவை', 'correct')}
            </span>
          </div>
        </div>

        {/* Card 3: Overall Accuracy */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-sm transition hover:border-emerald-500/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">
              {t('துல்லியம்', 'ACCURACY')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-300 font-mono tracking-tight">
              {overview.overallAccuracy}%
            </p>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400/90 block mt-0.5 truncate">
              {overview.overallAccuracy >= 75 ? '🎯 Cutoff Standard' : '📈 Scope to Improve'}
            </span>
          </div>
        </div>

        {/* Card 4: Average Score */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
              {t('சராசரி மதிப்பெண்', 'AVG SCORE')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {overview.avgScore}
              <span className="text-xs font-normal text-slate-500 ml-1">pts</span>
            </p>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              {t('ஒரு தேர்வுக்கு', 'per examination')}
            </span>
          </div>
        </div>

        {/* Card 5: Highest Score */}
        <div className="bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-sm transition hover:border-amber-500/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold tracking-wider">
              {t('உயர் சாதனை', 'TOP SCORE')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-300 font-mono tracking-tight">
              {overview.highestScore}
              <span className="text-xs font-normal text-amber-500 ml-1">pts</span>
            </p>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400/90 block mt-0.5 truncate">
              {t('தனிநபர் சாதனை', 'Personal best')}
            </span>
          </div>
        </div>

        {/* Card 6: Average Answering Speed */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
              {t('விடை வேகம்', 'PACE / SPEED')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {overview.avgSecondsPerQuestion}s
              <span className="text-xs font-normal text-slate-500 ml-1">/Q</span>
            </p>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              {speedBenchmark.labelTa}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: PERFORMANCE TRENDS & INTERACTIVE TRAJECTORY CHART            */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors space-y-5">
        {/* Trend Section Header with Metric Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight font-tamil">
                {t('தேர்வு செயல்திறன் முன்னேற்றப் போக்கு (Performance Trajectory)', 'Performance Trends & Accuracy Progression')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-tamil">
              {t(
                'நீங்கள் எழுதிய தேர்வுகளின் துல்லியம், மதிப்பெண் மற்றும் வேகப் போக்குகளை ஊடாடும் வரைபடத்தில் காண்க.',
                'Interactive timeline tracking progression, TNPSC cutoff benchmark, and test comparisons.'
              )}
            </p>
          </div>

          {/* Metric Switcher & Trajectory Badge */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {overview.trajectoryChange !== 0 && (
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                  overview.trajectoryChange > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                }`}
              >
                <span>{overview.trajectoryChange > 0 ? `▲ +${overview.trajectoryChange}%` : `▼ ${overview.trajectoryChange}%`}</span>
                <span className="text-[10px] font-sans font-normal opacity-80">{t('முன்னேற்றம்', 'shift')}</span>
              </span>
            )}

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setChartMetric('accuracy')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  chartMetric === 'accuracy'
                    ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('துல்லியம் (%)', 'Accuracy')}
              </button>
              <button
                onClick={() => setChartMetric('score')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  chartMetric === 'score'
                    ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('மதிப்பெண்', 'Score')}
              </button>
              <button
                onClick={() => setChartMetric('speed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  chartMetric === 'speed'
                    ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('வேகம் (வி/வி)', 'Speed')}
              </button>
            </div>
          </div>
        </div>

        {/* SVG Visual Interactive Chart */}
        {trends.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Activity className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300 font-tamil">
              {t('தேர்ந்தெடுக்கப்பட்ட வடிகட்டியில் தேர்வுகள் எதுவும் எழுதப்படவில்லை.', 'No completed tests found for selected filter.')}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-tamil">
              {t('மாதிரித் தேர்வுகளை முடித்தால் உங்கள் முன்னேற்ற வரைபடம் தானாக இங்கு வரையப்படும்.', 'Complete full or unit mock tests to generate your visual accuracy and score trajectory.')}
            </p>
            <Link
              href="/learner/tests"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              <span>{t('முதல் மாதிரித் தேர்வை எழுதுங்கள்', 'Take your first mock test')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-3 sm:p-4 overflow-hidden">
              <svg
                viewBox="0 0 600 180"
                className="w-full h-44 sm:h-52 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guideline lines */}
                {chartMetric === 'accuracy' ? (
                  <>
                    <line x1="45" y1="30" x2="575" y2="30" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="0.8" strokeOpacity="0.4" />
                    <text x="15" y="34" fill="#64748b" fontSize="9" fontFamily="monospace">100%</text>

                    {/* Target 80% TNPSC Cutoff standard */}
                    <line x1="45" y1="54" x2="575" y2="54" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth="1" strokeOpacity="0.8" />
                    <text x="15" y="57" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">80% 🎯</text>

                    <line x1="45" y1="90" x2="575" y2="90" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="0.8" strokeOpacity="0.4" />
                    <text x="15" y="94" fill="#64748b" fontSize="9" fontFamily="monospace">50%</text>

                    <line x1="45" y1="150" x2="575" y2="150" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.6" />
                    <text x="15" y="154" fill="#64748b" fontSize="9" fontFamily="monospace">0%</text>
                  </>
                ) : (
                  <>
                    <line x1="45" y1="30" x2="575" y2="30" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="0.8" strokeOpacity="0.4" />
                    <text x="15" y="34" fill="#64748b" fontSize="9" fontFamily="monospace">MAX</text>

                    <line x1="45" y1="90" x2="575" y2="90" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="0.8" strokeOpacity="0.4" />
                    <text x="15" y="94" fill="#64748b" fontSize="9" fontFamily="monospace">MID</text>

                    <line x1="45" y1="150" x2="575" y2="150" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.6" />
                    <text x="15" y="154" fill="#64748b" fontSize="9" fontFamily="monospace">0</text>
                  </>
                )}

                {/* Area under curve */}
                {svgAreaPath && (
                  <path d={svgAreaPath} fill="url(#chartGradient)" />
                )}

                {/* Curve line */}
                {svgPath && (
                  <path
                    d={svgPath}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {chartPoints.map((pt) => {
                  const isHovered = hoveredTrend?.attemptId === pt.item.attemptId;
                  const pointColor =
                    chartMetric === 'accuracy'
                      ? pt.val >= 75
                        ? '#10b981'
                        : pt.val >= 50
                        ? '#f59e0b'
                        : '#f43f5e'
                      : '#6366f1';

                  return (
                    <g key={pt.index}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4}
                        className="cursor-pointer transition-all duration-150"
                        fill={pointColor}
                        stroke="#ffffff"
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredTrend(pt.item)}
                        onClick={() => setHoveredTrend(pt.item)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Interactive Data Point Inspection Pill */}
            <div className="min-h-[46px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              {hoveredTrend ? (
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs font-tamil">
                    {lang === 'ta' ? hoveredTrend.title : hoveredTrend.titleEn}
                  </span>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className="text-slate-500 font-mono text-[11px]">{hoveredTrend.fullDate || hoveredTrend.date}</span>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {t('துல்லியம்:', 'Acc:')} {hoveredTrend.accuracy}%
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {t('மதிப்பெண்:', 'Score:')} {hoveredTrend.score} pts
                  </span>
                  <Link
                    href={`/learner/tests/results/${hoveredTrend.attemptId}`}
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold ml-auto"
                  >
                    <span>{t('மதிப்பெண் அட்டை பார்', 'View Scorecard')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    {t(
                      'வரைபடத்தில் உள்ள புள்ளிகளைத் தொட்டு அல்லது நகர்த்தி விரிவான தேர்வு விவரங்களைப் பார்வையிடவும்.',
                      'Hover or tap on any point along the curve to inspect the exact test score, accuracy, and answers.'
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION D: SUBJECT-WISE PERFORMANCE COMPARISON                            */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-tamil">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span>{t('பாடவாரியான தேர்வு பகுப்பாய்வு (Subject-Wise Performance)', 'Subject-Wise Performance Breakdown')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-tamil">
              {t(
                'பொதுத்தமிழ், கணிதம், மற்றும் பொது அறிவு பாடப் பிரிவுகளில் உங்கள் துல்லிய விகிதம் & சராசரி விடையளிக்கும் வேகம்.',
                'Compare attempted questions, accuracy percentage, and answering speed across core subjects.'
              )}
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-tamil">{t('பாடப் புள்ளிவிவரங்கள் இன்னும் உருவாக்கப்படவில்லை.', 'No subject-level attempts recorded yet.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subj) => {
              const isHigh = subj.accuracy >= 75;
              const isMid = subj.accuracy >= 50 && subj.accuracy < 75;

              return (
                <div
                  key={subj.id}
                  className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 transition-all shadow-sm space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {subj.domain.toUpperCase()}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isHigh
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : isMid
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {subj.accuracy}%
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug font-tamil">
                      {lang === 'ta' ? subj.nameTa : subj.nameEn}
                    </h3>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh
                            ? 'bg-emerald-500'
                            : isMid
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, subj.accuracy)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{subj.correct}</strong> / {subj.attempted} {t('சரியானவை', 'correct')}
                      </span>
                      <span>
                        ~{subj.avgSeconds}s {t('/ வினா', '/ Q')}
                      </span>
                    </div>
                  </div>

                  {/* Practice Action Link */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-rose-500 dark:text-rose-400 font-mono font-semibold">
                      {subj.wrong} {t('தவறுகள்', 'mistakes')}
                    </span>
                    <Link
                      href={`/learner/practice?subject=${encodeURIComponent(subj.id)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                      <span>{t('பயிற்சி செய்', 'Practice')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION F: DIFFICULTY-WISE ANALYSIS                                       */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-tamil">
              <SlidersHorizontal className="w-5 h-5 text-amber-500" />
              <span>{t('வினா கடினத்தன்மை நிலை ஆய்வு (Difficulty-Wise Breakdown)', 'Difficulty-Wise Performance Analysis')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-tamil">
              {t(
                'எளிது (Easy), நடுத்தரம் (Medium), கடினம் (Hard) வினாக்களில் உங்கள் துல்லிய விகிதம் மற்றும் சராசரி நேரம்.',
                'Analyze accuracy rates and average time spent on Easy, Medium, and Hard examination items.'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficultyAnalysis.map((diff) => {
            const isEasy = diff.level === 'easy';
            const isMedium = diff.level === 'medium';
            const badgeColor = isEasy
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              : isMedium
              ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
              : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';

            return (
              <div
                key={diff.level}
                className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                    {lang === 'ta' ? diff.labelTa : diff.labelEn}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {diff.accuracy}%
                  </span>
                </div>

                {/* Accuracy progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      diff.accuracy >= 75
                        ? 'bg-emerald-500'
                        : diff.accuracy >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, diff.accuracy)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{t('வினாக்கள்', 'Total')}</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono text-xs">{diff.attempted}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60">
                    <span className="text-[10px] text-emerald-500 block">{t('சரியானவை', 'Correct')}</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">{diff.correct}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60">
                    <span className="text-[10px] text-cyan-500 block">{t('வேகம்', 'Speed')}</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-mono text-xs">{diff.avgSeconds}s</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION G: STRENGTHS AND WEAKNESSES                                       */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-tamil">
              <Brain className="w-5 h-5 text-indigo-500" />
              <span>{t('வலுவான & கவனம் தேவைப்படும் பகுதிகள் (Strengths & Weaknesses)', 'Strengths & Critical Focus Areas')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-tamil">
              {t(
                'குறைந்தபட்சம் 2 வினாக்களுக்கு மேல் பயிற்சியளிக்கப்பட்ட தலைப்புகளின் அடிப்படையில் உங்கள் பலம் மற்றும் பலவீனங்கள் கண்டறியப்பட்டுள்ளன.',
                'Statistically confident mastery analysis based on repeated test attempts.'
              )}
            </p>
          </div>
        </div>

        {!strengthsAndWeaknesses.hasSufficientData ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
            <Info className="w-6 h-6 text-indigo-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-tamil">
              {t('போதுமான புள்ளிவிவரத் தகவல்கள் இல்லை', 'More test attempts needed')}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-tamil">
              {t(
                'நம்பகமான பலம் மற்றும் பலவீனங்களை அடையாளம் காண ஒவ்வொரு தலைப்பிலும் குறைந்தது 2-3 வினாக்கள் எழுதப்பட வேண்டும்.',
                'Attempt at least 2 questions in each unit or topic to unlock high-confidence strengths and weakness recommendations.'
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Strong Areas */}
            <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('வலுவான பகுதிகள் (Top Strengths)', 'Strong Topics (>=75%)')}</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  {strengthsAndWeaknesses.strongTopics.length} {t('பகுதிகள்', 'topics')}
                </span>
              </div>

              {strengthsAndWeaknesses.strongTopics.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center font-tamil">
                  {t('75%-க்கு மேல் துல்லியம் பெற்ற தலைப்புகள் இன்னும் பதிவு செய்யப்படவில்லை.', 'No topics above 75% accuracy yet.')}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {strengthsAndWeaknesses.strongTopics.map((top) => (
                    <div
                      key={top.id}
                      className="bg-white dark:bg-slate-900/90 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate font-tamil">
                          {lang === 'ta' ? top.nameTa : top.nameEn}
                        </h4>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {top.subjectNameTa} • {top.correct}/{top.attempted} {t('சரியானவை', 'correct')}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono shrink-0">
                        {top.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Critical Weak Areas */}
            <div className="bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t('கவனம் தேவைப்படும் பகுதிகள் (Areas Needing Practice)', 'Critical Focus Areas (<65%)')}</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                  {strengthsAndWeaknesses.weakTopics.length} {t('பகுதிகள்', 'topics')}
                </span>
              </div>

              {strengthsAndWeaknesses.weakTopics.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center font-tamil">
                  {t('அனைத்து பகுதிகளிலும் சிறந்த துல்லியம் உள்ளது! 🎉', 'All evaluated topics have good accuracy! 🎉')}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {strengthsAndWeaknesses.weakTopics.map((top) => (
                    <div
                      key={top.id}
                      className="bg-white dark:bg-slate-900/90 border border-rose-500/20 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate font-tamil">
                          {lang === 'ta' ? top.nameTa : top.nameEn}
                        </h4>
                        <span className="text-[10px] text-rose-500 dark:text-rose-400 block truncate">
                          {top.wrong} {t('தவறான விடைகள்', 'incorrect')} • {top.accuracy}% {t('துல்லியம்', 'accuracy')}
                        </span>
                      </div>
                      <Link
                        href={`/learner/practice?nodeId=${encodeURIComponent(top.id)}`}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition shrink-0"
                      >
                        {t('பயிற்சி செய்', 'Revise')} ➔
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION H: REPEATED MISTAKES & MISTAKE VAULT INTEGRATION                  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-tamil">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>{t('தவறு திருத்த பெட்டகம் & மீண்டும் நிகழும் தவறுகள் ஆய்வு', 'Spaced Repetition & Mistake Recovery Insights')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-tamil">
              {t(
                'தவறான விடைகளை மீண்டும் சரியாக விடையளிக்கும் தேர்ச்சி விகிதம் மற்றும் அடிக்கடி தவறாகும் வினாக்கள்.',
                'Track recovery from incorrect questions through Leitner Box Spaced Repetition reviews.'
              )}
            </p>
          </div>

          <Link
            href="/learner/mistake-vault"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition shrink-0"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t('தவறு பெட்டகம் செல்', 'Open Mistake Vault')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Keystone Mistake Metric Wells */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 text-center space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block">
              {t('நிலுவையில் உள்ள தவறுகள்', 'ACTIVE MISTAKES')}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-rose-500 font-mono">
              {mistakesInsight.activeMistakes}
            </p>
            <span className="text-[11px] text-slate-400 block font-tamil">
              {t('மறுபயிற்சிக்கு காத்திருக்கின்றன', 'Awaiting spaced review')}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 text-center space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block">
              {t('முழு தேர்ச்சி பெற்றவை', 'MASTERED')}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-500 font-mono">
              {mistakesInsight.masteredMistakes}
            </p>
            <span className="text-[11px] text-slate-400 block font-tamil">
              {t('மறுமுறை சரியாக விடையளித்தவை', 'Resolved after revision')}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 text-center space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block">
              {t('தேர்ச்சி விகிதம்', 'MASTERY RATE')}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
              {mistakesInsight.mistakeMasteryRate}%
            </p>
            <span className="text-[11px] text-slate-400 block font-tamil">
              {t('மொத்த தவறுகளில் சரிசெய்தவை', 'Mistake conversion efficiency')}
            </span>
          </div>
        </div>

        {/* Frequently Incorrect Questions List if available */}
        {mistakesInsight.frequentMistakes.length > 0 && (
          <div className="pt-2 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('மீண்டும் மீண்டும் தவறாகும் வினாக்கள் (Frequently Missed Items):', 'Frequently Missed Items:')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {mistakesInsight.frequentMistakes.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-50 dark:bg-slate-950/80 border border-rose-500/20 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block truncate">
                      {m.question_id}
                    </span>
                    <span className="text-[11px] text-slate-500 font-tamil">
                      {t('நிலை:', 'Level:')} {m.repetition_level}/5 • {m.review_count} {t('முயற்சிகள்', 'reviews')}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[11px] shrink-0">
                    {m.incorrect_count}x {t('தவறு', 'wrong')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION E: SYLLABUS-LEVEL EXPLORATION ACCORDION                           */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-tamil">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span>{t('பாடத்திட்ட நிலை செயல்திறன் ஆய்வு (Syllabus-Level Deep Dive)', 'Syllabus-Level Mastery Exploration')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-tamil">
              {t(
                'வகுப்புகள், இயல்கள் மற்றும் பாடத் தலைப்புகளில் உங்கள் செயல்திறனைத் தேடி ஆராயுங்கள்.',
                'Filter and inspect question-by-question mastery across classes, terms, units, and chapters.'
              )}
            </p>
          </div>

          {/* Search Box for Topics */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('தலைப்பைத் தேடுக...', 'Search unit or topic...')}
              value={topicSearchQuery}
              onChange={(e) => setTopicSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="font-tamil">{t('பொருத்தமான பாடப்பகுதிகள் எதுவும் கிடைக்கவில்லை.', 'No matching syllabus topics found.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredTopics.map((top) => {
              const isMastered = top.accuracy >= 75;
              const isAverage = top.accuracy >= 50 && top.accuracy < 75;

              return (
                <div
                  key={top.id}
                  className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate font-tamil">
                      {lang === 'ta' ? top.nameTa : top.nameEn}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{top.subjectNameTa}</span>
                      <span>•</span>
                      <span>
                        {top.correct}/{top.attempted} {t('சரி', 'correct')}
                      </span>
                      <span>•</span>
                      <span>~{top.avgSeconds}s</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isMastered
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : isAverage
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {top.accuracy}%
                    </span>

                    <Link
                      href={`/learner/practice?nodeId=${encodeURIComponent(top.id)}`}
                      className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                      title={t('பயிற்சி செய்', 'Practice')}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
