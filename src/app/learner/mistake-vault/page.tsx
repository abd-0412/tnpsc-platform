'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  Languages,
  Sparkles,
  Calendar,
  Award,
  Filter,
  Trash2,
  HelpCircle,
  SlidersHorizontal,
  BookmarkCheck,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Zap,
  Tag
} from 'lucide-react';

interface QuestionOption {
  id: string;
  text: string;
}

interface MistakeItem {
  id: string;
  question_id: string;
  reason: 'wrong_answer' | 'unanswered' | 'marked_difficult' | 'manual_add';
  repetition_level: number;
  next_review_at: string;
  review_count: number;
  incorrect_count: number;
  is_resolved: boolean;
  last_reviewed_at: string | null;
  notes: string | null;
  is_due: boolean;
  is_overdue?: boolean;
  is_upcoming?: boolean;
  questions: {
    id: string;
    kind: string;
    level: string;
    difficulty: string;
    texts: {
      ta: {
        question: string;
        options: any;
        explanation?: string;
      };
      en?: {
        question: string;
        options: any;
        explanation?: string;
      };
    };
    answer: {
      correct_option_id: string;
    };
    source?: {
      book?: string;
      standard?: string | number;
      term?: string | number;
      page?: number;
      citation?: string;
    };
    syllabus?: {
      subject_id?: string;
      node_id?: string;
      node_title?: string;
    };
    tags: string[];
  };
}

function parseOptions(rawOpts: any): QuestionOption[] {
  if (Array.isArray(rawOpts)) {
    return rawOpts.map((o: any, idx: number) => ({
      id: String(o.id || String.fromCharCode(65 + idx)),
      text: String(o.text || o.content || ''),
    }));
  }
  if (rawOpts && typeof rawOpts === 'object') {
    return Object.entries(rawOpts).map(([k, v]) => ({
      id: k,
      text: typeof v === 'string' ? v : String((v as any)?.text || ''),
    }));
  }
  return [];
}

function getSubjectMeta(q: any): { labelTa: string; labelEn: string; domain: string } {
  const book = (q?.source?.book || '').toLowerCase();
  const subj = (q?.syllabus?.subject_id || '').toLowerCase();
  const title = (q?.syllabus?.node_title || '').toLowerCase();
  const tags = (q?.tags || []).map((t: string) => String(t).toLowerCase());

  if (
    book.includes('தமிழ்') ||
    subj.includes('tamil') ||
    title.includes('தமிழ்') ||
    tags.some((t: string) => t.includes('tamil'))
  ) {
    return { labelTa: 'பொதுத்தமிழ்', labelEn: 'General Tamil', domain: 'tamil' };
  }

  if (
    subj.includes('aptitude') ||
    subj.includes('math') ||
    title.includes('கணிதம்') ||
    tags.some((t: string) => t.includes('aptitude') || t.includes('math'))
  ) {
    return { labelTa: 'கணிதம் & திறனறிவு', labelEn: 'Aptitude & Mental Ability', domain: 'aptitude' };
  }

  if (subj.includes('polity') || title.includes('அரசியலமைப்பு')) {
    return { labelTa: 'இந்திய ஆட்சியியல்', labelEn: 'Indian Polity', domain: 'gs' };
  }

  if (subj.includes('history') || subj.includes('inm') || title.includes('வரலாறு')) {
    return { labelTa: 'வரலாறு & தேசிய இயக்கம்', labelEn: 'History & INM', domain: 'gs' };
  }

  if (subj.includes('science') || title.includes('அறிவியல்')) {
    return { labelTa: 'பொது அறிவியல்', labelEn: 'General Science', domain: 'gs' };
  }

  return { labelTa: 'பொது அறிவு (GS)', labelEn: 'General Studies (GS)', domain: 'gs' };
}

export default function LearnerMistakeVaultPage() {
  const { lang, toggleLang, t } = useLanguage();

  // State
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'due' | 'all' | 'mastered'>('due');
  const [statusSubFilter, setStatusSubFilter] = useState<'all' | 'overdue' | 'upcoming' | 'wrong' | 'unanswered' | 'difficult'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'next_review' | 'recently_added' | 'most_incorrect' | 'most_reviewed'>('next_review');

  // Interactive Note Editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Interactive Review Modal (Retry Mode)
  const [reviewingMistake, setReviewingMistake] = useState<MistakeItem | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [reviewLanguage, setReviewLanguage] = useState<'ta' | 'en'>(lang);

  // Expandable Explanations Map
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  const fetchMistakes = useCallback(async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/learner/mistakes');
      const data = await res.json();
      if (res.ok) {
        setMistakes(data.mistakes || []);
      }
    } catch (err) {
      console.error('Failed to load mistakes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMistakes();
  }, [fetchMistakes]);

  // Handle Level & Status Actions
  const handleAction = async (id: string, action: string, notes?: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/learner/mistakes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, notes }),
      });

      if (res.ok) {
        setEditingNotesId(null);
        await fetchMistakes(true);
        if (reviewingMistake?.id === id) {
          setReviewingMistake(null);
          setSelectedOptionId(null);
          setHasSubmittedAnswer(false);
        }
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Question from Vault
  const handleDeleteMistake = async (id: string) => {
    if (!window.confirm(t('இவ்வினாவை தவறு பெட்டகத்திலிருந்து நீக்க விரும்புகிறீர்களா?', 'Remove this question from your Mistake Vault?'))) {
      return;
    }
    setActionLoading(id);
    try {
      const res = await fetch(`/api/learner/mistakes?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchMistakes(true);
      }
    } catch (err) {
      console.error('Failed to remove mistake:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Explanation Accordion
  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Interactive Review Modal
  const openReviewModal = (m: MistakeItem) => {
    setReviewingMistake(m);
    setSelectedOptionId(null);
    setHasSubmittedAnswer(false);
    setReviewLanguage(lang);
  };

  // 1. Revision Performance Overview Metrics
  const metrics = useMemo(() => {
    const totalSaved = mistakes.length;
    const dueCount = mistakes.filter((m) => m.is_due && !m.is_resolved).length;
    const overdueCount = mistakes.filter((m) => m.is_overdue && !m.is_resolved).length;
    const upcomingCount = mistakes.filter((m) => m.is_upcoming && !m.is_resolved).length;
    const masteredCount = mistakes.filter((m) => m.is_resolved || m.repetition_level >= 5).length;

    // Spaced repetition level distribution
    const levelCounts = [0, 1, 2, 3, 4].map(
      (lvl) => mistakes.filter((m) => !m.is_resolved && m.repetition_level === lvl).length
    );

    // Earliest upcoming review date
    const upcomingDates = mistakes
      .filter((m) => !m.is_resolved && new Date(m.next_review_at) > new Date())
      .map((m) => new Date(m.next_review_at).getTime())
      .sort((a, b) => a - b);

    const nextUpcomingDate = upcomingDates.length > 0 ? new Date(upcomingDates[0]) : null;

    return {
      totalSaved,
      dueCount,
      overdueCount,
      upcomingCount,
      masteredCount,
      levelCounts,
      nextUpcomingDate,
    };
  }, [mistakes]);

  // 2. Filter & Sort Logic
  const filteredMistakes = useMemo(() => {
    return mistakes
      .filter((m) => {
        // Tab Filter
        if (activeTab === 'due' && (!m.is_due || m.is_resolved)) return false;
        if (activeTab === 'mastered' && !m.is_resolved && m.repetition_level < 5) return false;

        // Sub Status Filter
        if (statusSubFilter === 'overdue' && (!m.is_overdue || m.is_resolved)) return false;
        if (statusSubFilter === 'upcoming' && (!m.is_upcoming || m.is_resolved)) return false;
        if (statusSubFilter === 'wrong' && m.reason !== 'wrong_answer') return false;
        if (statusSubFilter === 'unanswered' && m.reason !== 'unanswered') return false;
        if (statusSubFilter === 'difficult' && m.reason !== 'marked_difficult') return false;

        // Subject Filter
        if (subjectFilter !== 'all') {
          const meta = getSubjectMeta(m.questions);
          if (meta.domain !== subjectFilter) return false;
        }

        // Difficulty Filter
        if (difficultyFilter !== 'all' && m.questions.difficulty !== difficultyFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const qTextTa = (m.questions.texts?.ta?.question || '').toLowerCase();
          const qTextEn = (m.questions.texts?.en?.question || '').toLowerCase();
          const qId = (m.question_id || '').toLowerCase();
          const book = (m.questions.source?.book || '').toLowerCase();
          const tags = (m.questions.tags || []).join(' ').toLowerCase();

          if (!qTextTa.includes(q) && !qTextEn.includes(q) && !qId.includes(q) && !book.includes(q) && !tags.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'next_review') {
          return new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime();
        }
        if (sortBy === 'recently_added') {
          return new Date(b.next_review_at).getTime() - new Date(a.next_review_at).getTime();
        }
        if (sortBy === 'most_incorrect') {
          return (b.incorrect_count || 1) - (a.incorrect_count || 1);
        }
        if (sortBy === 'most_reviewed') {
          return (b.review_count || 0) - (a.review_count || 0);
        }
        return 0;
      });
  }, [mistakes, activeTab, statusSubFilter, subjectFilter, difficultyFilter, searchQuery, sortBy]);

  const getIntervalTag = (level: number) => {
    switch (level) {
      case 0:
        return { labelTa: 'L0: 1 நாள்', labelEn: 'L0: 1 Day', color: 'slate' };
      case 1:
        return { labelTa: 'L1: 3 நாட்கள்', labelEn: 'L1: 3 Days', color: 'cyan' };
      case 2:
        return { labelTa: 'L2: 7 நாட்கள்', labelEn: 'L2: 7 Days', color: 'indigo' };
      case 3:
        return { labelTa: 'L3: 14 நாட்கள்', labelEn: 'L3: 14 Days', color: 'purple' };
      case 4:
        return { labelTa: 'L4: 30 நாட்கள்', labelEn: 'L4: 30 Days', color: 'amber' };
      default:
        return { labelTa: 'தேர்ச்சி ✨', labelEn: 'Mastered ✨', color: 'emerald' };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-28 sm:pb-20">
      {/* ========================================================================= */}
      {/* SECTION A: PAGE HEADER & BRANDED IDENTITY                                 */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Flame className="w-3.5 h-3.5" />
                <span>SPACED REPETITION • LEITNER BOX</span>
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('தவறு திருத்தப் பெட்டகம்', 'Adaptive Mistake Recovery')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-tamil flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-400/40 flex items-center justify-center text-amber-500 shrink-0 shadow-md shadow-amber-500/10">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <span>{t('தவறு திருத்த பெட்டகம் (Mistake Vault)', 'My Mistake Vault')}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-tamil leading-relaxed break-words">
              {t(
                'மாதிரித் தேர்வுகள் & பயிற்சிகளில் தவறவிட்ட வினாக்களை 1, 3, 7, 14, 30 நாட்கள் இடைவெளியில் மீள்பார்வை செய்து நிரந்தரமாக மனதில் பதிய வைக்கவும்.',
                'Scientifically master missed and difficult questions using adaptive 1, 3, 7, 14, 30 days Spaced Repetition intervals.'
              )}
            </p>
          </div>

          {/* Action Header Tools */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchMistakes(true)}
              disabled={refreshing}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              title={t('புதுப்பி', 'Refresh Data')}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('புதுப்பி', 'Refresh')}</span>
            </button>

            <button
              onClick={toggleLang}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>

            <Link
              href="/learner/tests"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{t('மாதிரித் தேர்வு எழுது', 'Take Test')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION B: REVISION PERFORMANCE OVERVIEW (5 KEYSTONE SUMMARY CARDS)      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Saved Questions */}
        <button
          onClick={() => { setActiveTab('all'); setStatusSubFilter('all'); }}
          className={`bg-white dark:bg-slate-900/90 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 text-left shadow-sm transition cursor-pointer ${
            activeTab === 'all' && statusSubFilter === 'all'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
              {t('மொத்த வினாக்கள்', 'TOTAL SAVED')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {metrics.totalSaved}
            </p>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              {t('பெட்டகத்தில் உள்ளவை', 'In your vault')}
            </span>
          </div>
        </button>

        {/* Card 2: Due for Review */}
        <button
          onClick={() => { setActiveTab('due'); setStatusSubFilter('all'); }}
          className={`bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 text-left shadow-sm transition cursor-pointer ${
            activeTab === 'due'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-amber-500/30 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold tracking-wider">
              {t('இன்று மீள்பார்வை', 'DUE TODAY')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-300 font-mono tracking-tight">
              {metrics.dueCount}
            </p>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400/90 block mt-0.5 truncate">
              {metrics.dueCount > 0 ? t('பயிற்சிக்குத் தயார் 🔥', 'Ready for review') : t('இன்றைய இலக்கு முடிந்தது ✓', 'All caught up')}
            </span>
          </div>
        </button>

        {/* Card 3: Overdue Questions */}
        <button
          onClick={() => { setActiveTab('due'); setStatusSubFilter('overdue'); }}
          className={`bg-white dark:bg-slate-900/90 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 text-left shadow-sm transition cursor-pointer ${
            statusSubFilter === 'overdue'
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-500 dark:text-rose-400 font-bold tracking-wider">
              {t('தாமதமானவை', 'OVERDUE')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              {metrics.overdueCount}
            </p>
            <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400/80 block mt-0.5 truncate">
              {t('>24 மணிநேரம் கடந்தது', '>24h past review')}
            </span>
          </div>
        </button>

        {/* Card 4: Upcoming Reviews */}
        <button
          onClick={() => { setActiveTab('all'); setStatusSubFilter('upcoming'); }}
          className={`bg-white dark:bg-slate-900/90 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 text-left shadow-sm transition cursor-pointer ${
            statusSubFilter === 'upcoming'
              ? 'border-cyan-500 ring-2 ring-cyan-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-cyan-600 dark:text-cyan-400 font-bold tracking-wider">
              {t('எதிர்வரும் தேதிகள்', 'UPCOMING')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {metrics.upcomingCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              {metrics.nextUpcomingDate
                ? `${t('அடுத்தது:', 'Next:')} ${metrics.nextUpcomingDate.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', { month: 'short', day: 'numeric' })}`
                : t('அட்டவணைப்படுத்தப்பட்டது', 'Scheduled in box')}
            </span>
          </div>
        </button>

        {/* Card 5: Mastered Questions */}
        <button
          onClick={() => { setActiveTab('mastered'); setStatusSubFilter('all'); }}
          className={`col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 text-left shadow-sm transition cursor-pointer ${
            activeTab === 'mastered'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-emerald-500/30 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">
              {t('முழு தேர்ச்சி', 'MASTERED')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-300 font-mono tracking-tight">
              {metrics.masteredCount}
            </p>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400/90 block mt-0.5 truncate">
              {t('5 நிலை கடந்தவை ✨', 'Graduated Leitner Box')}
            </span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: SPACED REPETITION PROGRESSION TIMELINE (ALWAYS VISIBLE)        */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              {t('மீள்பார்வை கால இடைவெளி அட்டவணை (Leitner Interval Progression)', 'Spaced Repetition Progression Cycle')}
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-tamil">
            {t('வினாவை சரியாக விடையளித்தால் அடுத்த நிலைக்கு நகரும்', 'Consecutive correct answers advance questions')}
          </span>
        </div>

        {/* 6-Step Visual Responsive Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {[
            { level: 0, days: '1 Day', taDays: '1 நாள்', count: metrics.levelCounts[0], color: 'slate' },
            { level: 1, days: '3 Days', taDays: '3 நாட்கள்', count: metrics.levelCounts[1], color: 'cyan' },
            { level: 2, days: '7 Days', taDays: '7 நாட்கள்', count: metrics.levelCounts[2], color: 'indigo' },
            { level: 3, days: '14 Days', taDays: '14 நாட்கள்', count: metrics.levelCounts[3], color: 'purple' },
            { level: 4, days: '30 Days', taDays: '30 நாட்கள்', count: metrics.levelCounts[4], color: 'amber' },
            { level: 5, days: 'Mastered', taDays: 'தேர்ச்சி ✨', count: metrics.masteredCount, color: 'emerald', isFinal: true },
          ].map((step) => (
            <div
              key={step.level}
              className={`p-3 rounded-2xl border text-center flex flex-col justify-between space-y-2 transition shadow-xs ${
                step.isFinal
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  {step.isFinal ? 'GRADUATION' : `STAGE ${step.level}`}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    step.isFinal
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {step.count}
                </span>
              </div>

              <div>
                <strong className={`text-xs sm:text-sm font-bold block ${step.isFinal ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {lang === 'ta' ? step.taDays : step.days}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-tamil">
                  {step.isFinal ? t('நிரந்தர சேமிப்பு', 'Permanent retention') : `${t('அடுத்தது:', 'Interval:')} ${step.days}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION D: REVIEW CATEGORY NAVIGATION & ADVANCED FILTERS                 */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        {/* Primary Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => { setActiveTab('due'); setStatusSubFilter('all'); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'due'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{t('இன்றைய மீள்பார்வை (Due for Review)', 'Due for Review')}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              {metrics.dueCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('all'); setStatusSubFilter('all'); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'all'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-indigo-500" />
            <span>{t('அனைத்து தவறுகளும் (All Mistakes)', 'All Mistakes')}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {mistakes.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('mastered'); setStatusSubFilter('all'); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'mastered'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{t('தேர்ச்சி பெற்றவை (Mastered)', 'Mastered')}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {metrics.masteredCount}
            </span>
          </button>
        </div>

        {/* Search, Subject, Difficulty & Sorting Control Bar */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('வினா, பாடம் அல்லது குறிப்பைத் தேடுக...', 'Search question text, ID, subject, tags...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Dropdowns: Subject, Difficulty, Sorting */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Subject Selector */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">{t('அனைத்து பாடங்கள் (All Subjects)', 'All Subjects')}</option>
              <option value="tamil">{t('பொதுத்தமிழ்', 'General Tamil')}</option>
              <option value="aptitude">{t('கணிதம் & திறனறிவு', 'Aptitude')}</option>
              <option value="gs">{t('பொது அறிவு (GS)', 'General Studies')}</option>
            </select>

            {/* Difficulty Selector */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">{t('அனைத்து நிலைகள் (All Difficulties)', 'All Difficulties')}</option>
              <option value="easy">{t('எளிது (Easy)', 'Easy')}</option>
              <option value="medium">{t('நடுத்தரம் (Medium)', 'Medium')}</option>
              <option value="hard">{t('கடினம் (Hard)', 'Hard')}</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="next_review">{t('அடுத்த மீள்பார்வை (Soonest First)', 'Next Review Date')}</option>
              <option value="most_incorrect">{t('அதிக தவறுகள் (Most Incorrect)', 'Most Incorrect')}</option>
              <option value="most_reviewed">{t('அதிக மீள்பார்வை (Most Reviewed)', 'Most Reviewed')}</option>
              <option value="recently_added">{t('சமீபத்தில் சேர்க்கப்பட்டவை (Recent)', 'Recently Added')}</option>
            </select>
          </div>
        </div>

        {/* Secondary Status Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'all', ta: 'அனைத்து நிலைகளும்', en: 'All Status' },
            { id: 'overdue', ta: `தாமதமானவை (${metrics.overdueCount})`, en: `Overdue (${metrics.overdueCount})` },
            { id: 'upcoming', ta: `எதிர்வருபவை (${metrics.upcomingCount})`, en: `Upcoming (${metrics.upcomingCount})` },
            { id: 'wrong', ta: 'தவறான விடைகள்', en: 'Wrong Answers' },
            { id: 'unanswered', ta: 'விடை தெரியாதவை', en: 'Unanswered' },
            { id: 'difficult', ta: 'கடினம் எனக் குறித்தவை', en: 'Marked Difficult' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setStatusSubFilter(chip.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                statusSubFilter === chip.id
                  ? 'bg-slate-800 dark:bg-slate-750 text-white shadow-xs border border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent'
              }`}
            >
              {lang === 'en' ? chip.en : chip.ta}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION E: QUESTION REVIEW CARDS & TARGETED EMPTY STATES                  */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10">
              <Flame className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <div className="absolute -inset-1.5 rounded-2xl border-2 border-amber-500/40 border-t-transparent animate-spin" />
          </div>
          <h2 className="text-base sm:text-lg font-bold font-tamil tracking-tight">
            {t('தவறு திருத்தப் பெட்டகம் ஏற்றப்படுகிறது...', 'Loading Spaced Repetition Vault...')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-tamil">
            {t('இடைவெளி மீள்பார்வை வினாக்கள் தொகுக்கப்படுகின்றன...', 'Calculating review schedule and memory intervals...')}
          </p>
        </div>
      ) : filteredMistakes.length === 0 ? (
        /* BALANCED, NON-EMPTY, COMPACT EMPTY STATES FOR EVERY CATEGORY */
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          {activeTab === 'due' ? (
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-tamil">
                {t('இன்று மீள்பார்வைக்கு வினாக்கள் எதுவும் இல்லை! 🎉', 'No questions are due for review right now! 🎉')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-tamil leading-relaxed">
                {metrics.nextUpcomingDate ? (
                  <>
                    {t('அருமை! நீங்கள் திட்டமிட்ட அனைத்து மீள்பார்வைகளையும் முடித்துவிட்டீர்கள். அடுத்த மீள்பார்வை தேதி:', 'Great job staying consistent! Your next scheduled review is on:')}{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                      {metrics.nextUpcomingDate.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </strong>.
                  </>
                ) : (
                  t(
                    'தேர்வுகளில் தவறவிட்ட வினாக்கள் தானாக 1, 3, 7, 14, 30 நாட்கள் இடைவெளியில் இங்கு வரிசைப்படுத்தப்படும்.',
                    'Keep testing yourself! Mistakes from mock tests and practice sessions automatically schedule here.'
                  )
                )}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => { setActiveTab('all'); setStatusSubFilter('all'); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {t('அனைத்து தவறுகளையும் காண்க', 'View All Saved Mistakes')}
                </button>
                <Link
                  href="/learner/tests"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  {t('புதிய மாதிரித் தேர்வு எழுது', 'Take Mock Test')}
                </Link>
              </div>
            </div>
          ) : activeTab === 'mastered' ? (
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 mx-auto">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-tamil">
                {t('இன்னும் வினாக்கள் தேர்ச்சி பெறவில்லை', 'No questions mastered yet')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-tamil leading-relaxed">
                {t(
                  'தவறவிட்ட வினாக்களை மீண்டும் மீண்டும் 5 முறை சரியான இடைவெளியில் சரியாக விடையளித்தால் அவை தானாக முழுத் தேர்ச்சி (Mastered) நிலைக்கு மாறும்.',
                  'When you successfully answer a mistake across 5 spaced review intervals (1d, 3d, 7d, 14d, 30d), it graduates to Mastered status.'
                )}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => { setActiveTab('due'); setStatusSubFilter('all'); }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow transition cursor-pointer"
                >
                  {t('இன்றைய மீள்பார்வையைத் தொடங்கு', "Start Today's Reviews")}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
                <Flame className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-tamil">
                {searchQuery || subjectFilter !== 'all' || difficultyFilter !== 'all' || statusSubFilter !== 'all'
                  ? t('வடிகட்டலுக்கு ஏற்ற வினாக்கள் எதுவும் இல்லை', 'No questions matched your search or filters')
                  : t('உங்கள் தவறு திருத்தப் பெட்டகம் காலியாக உள்ளது', 'Your Mistake Vault is currently empty')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-tamil leading-relaxed">
                {searchQuery || subjectFilter !== 'all' || difficultyFilter !== 'all' || statusSubFilter !== 'all'
                  ? t('வடிகட்டல்களை மாற்றி அல்லது தேடல் சொல்லை அழித்து மீண்டும் முயற்சிக்கவும்.', 'Try adjusting or clearing your filters to see more saved questions.')
                  : t('மாதிரித் தேர்வுகளை எழுதும்போது தவறான வினாக்களும், பயிற்சிப் பக்கத்தில் புக்மார்க் செய்யும் வினாக்களும் தானாக இங்கு சேர்க்கப்படும்.', 'Mistakes made during mock tests and questions bookmarked during practice sessions will automatically appear here.')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {searchQuery || subjectFilter !== 'all' || difficultyFilter !== 'all' || statusSubFilter !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSubjectFilter('all');
                      setDifficultyFilter('all');
                      setStatusSubFilter('all');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    {t('வடிகட்டல்களை மீட்டமை', 'Reset All Filters')}
                  </button>
                ) : (
                  <>
                    <Link
                      href="/learner/tests"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                    >
                      {t('மாதிரித் தேர்வுகள் மையம்', 'Go to Test Centre')}
                    </Link>
                    <Link
                      href="/learner/practice"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
                    >
                      {t('உடனடி பயிற்சி செய்', 'Practice Questions')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* INFORMATION-RICH, INTERACTIVE QUESTION REVIEW CARDS */
        <div className="space-y-4">
          {filteredMistakes.map((m) => {
            const q = m.questions;
            const meta = getSubjectMeta(q);
            const interval = getIntervalTag(m.repetition_level);
            const isEditing = editingNotesId === m.id;
            const isExplanationExpanded = !!expandedExplanations[m.id];
            const parsedOpts = parseOptions(q.texts?.ta?.options || q.texts?.en?.options);

            const isTamil = (q.source?.book || '').includes('தமிழ்') || (q.tags || []).includes('general_tamil');

            const questionText =
              isTamil || lang === 'ta'
                ? q.texts?.ta?.question
                : q.texts?.en?.question || q.texts?.ta?.question;

            const explanation =
              isTamil || lang === 'ta'
                ? q.texts?.ta?.explanation
                : q.texts?.en?.explanation || q.texts?.ta?.explanation;

            const reviewDateObj = new Date(m.next_review_at);
            const formattedNextReview = reviewDateObj.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={m.id}
                className={`bg-white dark:bg-slate-900/90 border rounded-3xl p-5 sm:p-6 space-y-4 transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-700 ${
                  m.is_resolved
                    ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                    : m.is_due
                    ? 'border-amber-500/40 bg-amber-500/[0.02]'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* 1. Card Top Bar: Badges, Difficulty, Interval & Source */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Question ID */}
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {q.id}
                    </span>

                    {/* Subject Pill */}
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-tamil">
                      {lang === 'ta' ? meta.labelTa : meta.labelEn}
                    </span>

                    {/* Difficulty Badge */}
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                      q.difficulty === 'easy'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : q.difficulty === 'hard'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {q.difficulty}
                    </span>

                    {/* Repetition Level Pill */}
                    <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      {lang === 'ta' ? interval.labelTa : interval.labelEn}
                    </span>

                    {/* Status Pill */}
                    {m.is_resolved ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        ✓ {t('தேர்ச்சி பெற்றது', 'Mastered')}
                      </span>
                    ) : m.is_due ? (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full animate-pulse border border-amber-500/40">
                        {t('இன்று மீள்பார்வை தேவை', 'Due Today 🔥')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                        {t('அடுத்தது:', 'Next:')} {formattedNextReview}
                      </span>
                    )}
                  </div>

                  {/* Textbook Source Citation */}
                  {q.source && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate max-w-xs">
                        {q.source.book || `Std ${q.source.standard || 6}`}
                        {q.source.term ? ` (Term ${q.source.term})` : ''}
                        {q.source.page ? ` • p.${q.source.page}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Question Text */}
                <h3 className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed break-words ${isTamil || lang === 'ta' ? 'font-tamil' : ''}`}>
                  {questionText}
                </h3>

                {/* 3. Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {parsedOpts.map((opt) => {
                    const isCorrect = q.answer?.correct_option_id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                          isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {opt.id.slice(-1).toUpperCase()}
                          </span>
                          <span className={`break-words ${isTamil || lang === 'ta' ? 'font-tamil' : ''}`}>
                            {opt.text}
                          </span>
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold shrink-0 ml-1">
                            {t('சரியான விடை', 'Key')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 4. Expandable Explanation & Samacheer Reference */}
                {explanation && (
                  <div className="pt-1">
                    {isExplanationExpanded ? (
                      <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 animate-in fade-in-50 duration-150">
                        <div className="flex items-center justify-between">
                          <strong className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{t('பாடப்புத்தக விளக்கம் (Explanation):', 'Textbook Citation & Explanation:')}</span>
                          </strong>
                          <button
                            onClick={() => toggleExplanation(m.id)}
                            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-white font-semibold cursor-pointer"
                          >
                            {t('மறை', 'Collapse')} ▲
                          </button>
                        </div>
                        <p className={`text-slate-700 dark:text-slate-300 leading-relaxed ${isTamil || lang === 'ta' ? 'font-tamil' : ''}`}>
                          {explanation}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleExplanation(m.id)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{t('விளக்கம் மற்றும் ஆதாரத்தைக் காண்க', 'View Explanation & Book Reference')} ▼</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 5. Personal Memory Hook (Notes) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('நினைவுக் குறிப்பு (Personal Memory Hook):', 'Personal Memory Hook:')}</span>
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingNotesId(m.id);
                          setTempNotes(m.notes || '');
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-bold cursor-pointer"
                      >
                        {m.notes ? t('திருத்து', 'Edit Hook') : t('+ குறிப்பு சேர்', '+ Add Memory Hook')}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={2}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder={t('இவ்விதியை நினைவில் வைத்திருக்க உங்கள் சொந்த வார்த்தைகளில் குறிப்பு எழுதவும்...', 'Write a mnemonic or memory rule in your own words...')}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-white text-xs font-semibold cursor-pointer"
                        >
                          {t('ரத்து', 'Cancel')}
                        </button>
                        <button
                          onClick={() => handleAction(m.id, 'update_notes', tempNotes)}
                          disabled={actionLoading === m.id}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                        >
                          {t('சேமி', 'Save Hook')}
                        </button>
                      </div>
                    </div>
                  ) : m.notes ? (
                    <p className="text-slate-800 dark:text-slate-200 italic font-tamil bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{m.notes}"
                    </p>
                  ) : null}
                </div>

                {/* 6. Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>
                      {t('மீள்பார்வை:', 'Reviewed:')} <strong className="text-slate-700 dark:text-slate-200">{m.review_count}x</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {t('தவறுகள்:', 'Incorrect:')} <strong className="text-rose-500">{m.incorrect_count || 1}x</strong>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Primary "Review Now" Interactive Retry Button */}
                    <button
                      onClick={() => openReviewModal(m)}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('பயிற்சி செய் (Review Now)', 'Review Now')}</span>
                    </button>

                    {/* Level Down Button */}
                    {!m.is_resolved && (
                      <button
                        onClick={() => handleAction(m.id, 'level_down')}
                        disabled={actionLoading === m.id}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                        title={t('மீண்டும் பயிற்சி தேவை என குறிக்க', 'Reset to 1 Day')}
                      >
                        {t('1 நாள் (L0)', 'Still Need Review (1d)')}
                      </button>
                    )}

                    {/* Level Up Button */}
                    {!m.is_resolved ? (
                      <button
                        onClick={() => handleAction(m.id, 'level_up')}
                        disabled={actionLoading === m.id}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {m.repetition_level >= 4
                            ? t('தேர்ச்சி என குறிக்க', 'Graduate Mastered ✨')
                            : t('புரிந்தது (Level Up)', 'I Understood ✓')}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(m.id, 'reopen')}
                        disabled={actionLoading === m.id}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                        title={t('மீண்டும் பயிற்சிக்கு மாற்று', 'Return to active revision cycle')}
                      >
                        {t('மீண்டும் பயிற்சிக்கு மாற்று', 'Return to Active Revision')}
                      </button>
                    )}

                    {/* Remove from Vault */}
                    <button
                      onClick={() => handleDeleteMistake(m.id)}
                      disabled={actionLoading === m.id}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                      title={t('பெட்டகத்திலிருந்து நீக்கு', 'Remove from Mistake Vault')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION F: FOCUSED INTERACTIVE RETRY / "REVIEW NOW" MODAL                 */}
      {/* ========================================================================= */}
      {reviewingMistake && (
        <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {reviewingMistake.question_id}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {t('மீள்பார்வை தேர்வு முறை', 'Interactive Practice Mode')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setReviewLanguage((prev) => (prev === 'ta' ? 'en' : 'ta'))}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                >
                  {reviewLanguage === 'ta' ? 'English' : 'தமிழ்'}
                </button>
                <button
                  onClick={() => setReviewingMistake(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 cursor-pointer text-sm font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
                {reviewingMistake.questions.kind?.replace(/_/g, ' ') || 'QUESTION'}
              </span>
              <p className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed font-tamil break-words`}>
                {reviewLanguage === 'ta'
                  ? reviewingMistake.questions.texts?.ta?.question
                  : reviewingMistake.questions.texts?.en?.question || reviewingMistake.questions.texts?.ta?.question}
              </p>
            </div>

            {/* Clickable Options */}
            <div className="space-y-2.5">
              {parseOptions(
                reviewLanguage === 'ta'
                  ? reviewingMistake.questions.texts?.ta?.options
                  : reviewingMistake.questions.texts?.en?.options || reviewingMistake.questions.texts?.ta?.options
              ).map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrect = reviewingMistake.questions.answer?.correct_option_id === opt.id;

                let optClass = 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
                if (hasSubmittedAnswer) {
                  if (isCorrect) {
                    optClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                  } else if (isSelected) {
                    optClass = 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200 font-bold';
                  } else {
                    optClass = 'opacity-50 border-slate-200 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={hasSubmittedAnswer}
                    onClick={() => {
                      setSelectedOptionId(opt.id);
                      setHasSubmittedAnswer(true);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm flex items-center justify-between transition cursor-pointer gap-3 ${optClass}`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 font-mono font-bold flex items-center justify-center shrink-0">
                        {opt.id}
                      </span>
                      <span className="font-tamil break-words">{opt.text}</span>
                    </div>

                    {hasSubmittedAnswer && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    {hasSubmittedAnswer && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Result & Explanation Box */}
            {hasSubmittedAnswer && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectedOptionId === reviewingMistake.questions.answer?.correct_option_id ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('சரியான விடை! அருமை! 🎉', 'Correct Answer! Great Job! 🎉')}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        {t('தவறான தேர்வு. சரியான விடை:', 'Incorrect. Correct Answer:')}{' '}
                        <strong className="font-mono text-emerald-500 ml-1">
                          {reviewingMistake.questions.answer?.correct_option_id}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                {reviewingMistake.questions.texts?.ta?.explanation && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-tamil leading-relaxed pt-1">
                    {reviewLanguage === 'ta'
                      ? reviewingMistake.questions.texts?.ta?.explanation
                      : reviewingMistake.questions.texts?.en?.explanation || reviewingMistake.questions.texts?.ta?.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 border-t border-slate-200 dark:border-slate-800">
              {hasSubmittedAnswer ? (
                <>
                  <button
                    onClick={() => handleAction(reviewingMistake.id, 'level_up')}
                    disabled={actionLoading === reviewingMistake.id}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {reviewingMistake.repetition_level >= 4
                        ? t('தேர்ச்சி பெற்றதாகக் குறிக்க ✨', 'Graduate to Mastered ✨')
                        : t('புரிந்துகொண்டேன் - அடுத்த நிலைக்கு நகர்த்து (Level Up)', 'Understood - Advance to Next Level')}
                    </span>
                  </button>

                  <button
                    onClick={() => handleAction(reviewingMistake.id, 'level_down')}
                    disabled={actionLoading === reviewingMistake.id}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    {t('மீண்டும் 1 நாளில் பயிற்சி (Reset to L0)', 'Need Practice (Reset to 1d)')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setReviewingMistake(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {t('மூடு', 'Close')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
