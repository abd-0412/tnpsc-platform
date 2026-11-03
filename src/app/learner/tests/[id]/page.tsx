'use client';

import { useState, useEffect, useRef, use, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { get, set } from 'idb-keyval';
import { useLanguage } from '@/context/LanguageContext';
import { normalizeOptionId, isMatchingOption } from '@/lib/option-utils';
import { getOfflineTest, saveOfflineSubmission } from '@/lib/offline-storage';
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Award,
  ArrowRight,
  HelpCircle,
  Send,
  Languages,
  BookOpen,
  Grid,
  Check,
  X,
  CircleDot,
  FileCheck2,
  Sparkles,
  HelpCircle as QuestionIcon,
  Printer,
  RefreshCw
} from 'lucide-react';

interface QuestionOption {
  id: string;
  text: string;
  is_option_e?: boolean;
}

interface AttemptItem {
  id: string;
  question_id: string;
  question_order: number;
  question_snapshot: {
    id: string;
    kind: string;
    difficulty: string;
    texts: {
      ta: {
        question?: string;
        options?: any;
        blocks?: Array<{ type: string; content: string }>;
      };
      en?: {
        question?: string;
        options?: any;
        blocks?: Array<{ type: string; content: string }>;
      };
    };
    question_data?: any;
    source?: {
      book?: string;
      standard?: string;
      term?: string;
      page?: number;
      citation?: string;
    };
  };
  selected_answer: { option_id: string } | null;
  is_answered: boolean;
  is_marked_for_review: boolean;
  time_spent_seconds: number;
}

interface TestAttempt {
  id: string;
  title_ta: string;
  title_en: string;
  duration_minutes: number;
  total_questions: number;
  total_marks?: number;
  total_time_seconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
}

// Helpers to format questions and append TNPSC Option E
function isTamilQuestion(snapshot: any): boolean {
  const book = (snapshot?.source?.book || '').toLowerCase();
  const tags = (snapshot?.tags || []).map((t: string) => String(t).toLowerCase());
  const subject = (snapshot?.syllabus?.subject_id || '').toLowerCase();
  return (
    book.includes('தமிழ்') ||
    book.includes('tamil') ||
    tags.some((t: string) => t.includes('tamil')) ||
    subject.includes('tamil')
  );
}

function getQuestionContent(snapshot: any, lang: 'ta' | 'en'): string {
  if (isTamilQuestion(snapshot)) {
    const textObj = snapshot?.texts?.ta || snapshot?.texts?.en || {};
    return textObj.question || textObj.blocks?.[0]?.content || 'வினா உரை இல்லை';
  }
  const textObj = snapshot?.texts?.[lang] || snapshot?.texts?.ta || snapshot?.texts?.en || {};
  if (textObj.question) return textObj.question;
  if (textObj.blocks?.[0]?.content) return textObj.blocks[0].content;
  return 'வினா உரை இல்லை (Question text unavailable)';
}

function getOptionsWithOptionE(snapshot: any, lang: 'ta' | 'en'): QuestionOption[] {
  const useLang = isTamilQuestion(snapshot) ? 'ta' : lang;
  const textObj = snapshot?.texts?.[useLang] || snapshot?.texts?.ta || snapshot?.texts?.en || {};
  const rawOpts = textObj.options;
  let parsed: QuestionOption[] = [];

  if (Array.isArray(rawOpts)) {
    parsed = rawOpts.map((o: any, idx: number) => ({
      id: normalizeOptionId(o.id, idx),
      text: String(o.text || o.content || ''),
    }));
  } else if (rawOpts && typeof rawOpts === 'object') {
    parsed = Object.entries(rawOpts).map(([k, v], idx: number) => ({
      id: normalizeOptionId(k, idx),
      text: typeof v === 'string' ? v : String((v as any)?.text || ''),
    }));
  }

  // Ensure standard sorting: A, B, C, D
  parsed.sort((a, b) => a.id.localeCompare(b.id));

  // Append official TNPSC Option E if not already present
  if (!parsed.some((o) => o.id === 'E')) {
    parsed.push({
      id: 'E',
      text: lang === 'ta' ? 'விடை தெரியவில்லை (Answer Not Known)' : 'Answer Not Known (Option E)',
      is_option_e: true,
    });
  }

  return parsed;
}

export default function TestPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: attemptId } = use(params);
  const router = useRouter();
  const { lang, setLang, toggleLang, t } = useLanguage();

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [items, setItems] = useState<AttemptItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pre-test briefing state
  const [briefingConfirmed, setBriefingConfirmed] = useState(false);

  // Player state: default to OMR Shading Mode
  const [viewMode, setViewMode] = useState<'omr' | 'standard'>('omr');
  const [sidebarTab, setSidebarTab] = useState<'omr_matrix' | 'status_grid'>('omr_matrix');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [totalElapsed, setTotalElapsed] = useState<number>(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Submit modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // OMR Auto-Scroll Refs
  const omrListRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);
  const questionContentRef = useRef<HTMLDivElement>(null);

  // Jump directly to specific question and close drawer on mobile
  const handleJumpToQuestion = (targetIdx: number) => {
    setCurrentIndex(targetIdx);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setPaletteOpen(false);
    }
    setTimeout(() => {
      if (questionContentRef.current) {
        questionContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Question-by-Question Micro-Time Tracking (Phase 11: Speed Analytics)
  const prevIndexRef = useRef(currentIndex);
  const questionActiveStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const prevIdx = prevIndexRef.current;
    if (prevIdx !== currentIndex) {
      const elapsed = Math.max(1, Math.round((Date.now() - questionActiveStartRef.current) / 1000));
      questionActiveStartRef.current = Date.now();
      prevIndexRef.current = currentIndex;

      setItems((prev) =>
        prev.map((it, idx) => {
          if (idx === prevIdx) {
            return {
              ...it,
              time_spent_seconds: (it.time_spent_seconds || 0) + elapsed,
            };
          }
          return it;
        })
      );
    }
  }, [currentIndex]);

  // Auto-scroll active question row in OMR matrix smoothly into view & reset question viewport
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
    if (questionContentRef.current) {
      questionContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIndex]);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch or restore attempt
  useEffect(() => {
    async function loadTest() {
      // 1. Check if this is an offline cached test bundle
      if (attemptId.startsWith('offline-')) {
        try {
          const offlineTest = await getOfflineTest(attemptId);
          if (offlineTest) {
            setAttempt({
              id: offlineTest.id,
              title_ta: offlineTest.title,
              title_en: offlineTest.examTitle,
              duration_minutes: offlineTest.durationMinutes,
              total_questions: offlineTest.totalQuestions || offlineTest.questions.length,
              total_time_seconds: 0,
              status: 'in_progress',
            });

            const offlineItems: AttemptItem[] = offlineTest.questions.map((q: any, idx: number) => ({
              id: `off-item-${q.id || idx}`,
              question_id: q.id || `q-${idx}`,
              question_order: idx + 1,
              selected_answer: null,
              is_answered: false,
              is_marked_for_review: false,
              time_spent_seconds: 0,
              question_snapshot: q,
            }));

            setItems(offlineItems);
            setTimeRemaining(offlineTest.durationMinutes * 60);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Error loading offline bundle:', err);
        }
      }

      // 2. Online test loading
      try {
        const res = await fetch(`/api/learner/tests/${attemptId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load test');
        }

        if (data.attempt.status === 'completed') {
          router.replace(`/learner/tests/results/${attemptId}`);
          return;
        }

        setAttempt(data.attempt);
        let loadedItems: AttemptItem[] = data.items || [];

        // Check IndexedDB local cache for unsynced responses
        const cached = await get(`tnpsc_attempt_${attemptId}`);
        if (cached && cached.items) {
          const cachedMap = new Map(cached.items.map((i: any) => [i.question_id, i]));
          loadedItems = loadedItems.map((item) => {
            const c = cachedMap.get(item.question_id) as AttemptItem | undefined;
            if (c) {
              return {
                ...item,
                selected_answer: c.selected_answer,
                is_answered: c.is_answered,
                is_marked_for_review: c.is_marked_for_review,
              };
            }
            return item;
          });
        }

        const normalizedLoadedItems = loadedItems.map((item) => {
          let sel = item.selected_answer;
          if (sel) {
            const rawId = typeof sel === 'string' ? sel : sel.option_id;
            sel = { option_id: normalizeOptionId(rawId) };
          }
          return {
            ...item,
            selected_answer: sel,
          };
        });

        setItems(normalizedLoadedItems);

        // Calculate timer
        const totalDurationSec = (data.attempt.duration_minutes || 60) * 60;
        const elapsed = data.attempt.total_time_seconds || 0;
        const remaining = Math.max(0, totalDurationSec - elapsed);
        setTimeRemaining(remaining);
        setTotalElapsed(elapsed);

        // If user already took time, skip briefing
        if (elapsed > 0) {
          setBriefingConfirmed(true);
        }
      } catch (err: any) {
        // Fallback to offline test if network failed
        const offlineFallback = await getOfflineTest(attemptId);
        if (offlineFallback) {
          setAttempt({
            id: offlineFallback.id,
            title_ta: offlineFallback.title,
            title_en: offlineFallback.examTitle,
            duration_minutes: offlineFallback.durationMinutes,
            total_questions: offlineFallback.totalQuestions || offlineFallback.questions.length,
            total_time_seconds: 0,
            status: 'in_progress',
          });
          const offlineItems: AttemptItem[] = offlineFallback.questions.map((q: any, idx: number) => ({
            id: `off-item-${q.id || idx}`,
            question_id: q.id || `q-${idx}`,
            question_order: idx + 1,
            selected_answer: null,
            is_answered: false,
            is_marked_for_review: false,
            time_spent_seconds: 0,
            question_snapshot: q,
          }));
          setItems(offlineItems);
          setTimeRemaining(offlineFallback.durationMinutes * 60);
          return;
        }

        alert(err.message || 'Error loading test');
        router.push('/learner/tests');
      } finally {
        setLoading(false);
      }
    }

    loadTest();
  }, [attemptId, router]);

  // Anti-tamper Countdown Timer
  useEffect(() => {
    if (!briefingConfirmed || loading || !attempt || attempt.status === 'completed') return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinalSubmit(); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });

      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [briefingConfirmed, loading, attempt]);

  // Periodic Auto-save to Supabase & IndexedDB
  const syncItemToBackend = useCallback(async (item: AttemptItem) => {
    try {
      await set(`tnpsc_attempt_${attemptId}`, {
        items,
        totalElapsed,
      });

      fetch(`/api/learner/tests/${attemptId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: item.question_id,
          selected_answer: item.selected_answer,
          is_answered: item.is_answered,
          is_marked_for_review: item.is_marked_for_review,
          elapsed_seconds: totalElapsed,
        }),
      }).catch((e) => console.error('Background sync failed:', e));
    } catch (e) {
      console.error(e);
    }
  }, [attemptId, items, totalElapsed]);

  // Shading handler for Option A, B, C, D, or E
  const handleShadeOption = (optionId: string, targetIndex: number = currentIndex) => {
    const updated = [...items];
    const targetItem = updated[targetIndex];
    if (!targetItem) return;

    const normId = normalizeOptionId(optionId);
    targetItem.selected_answer = { option_id: normId };
    targetItem.is_answered = true;
    setItems(updated);
    syncItemToBackend(targetItem);
  };

  const handleClearResponse = () => {
    const updated = [...items];
    const current = updated[currentIndex];
    current.selected_answer = null;
    current.is_answered = false;
    setItems(updated);
    syncItemToBackend(current);
  };

  const handleToggleMarkForReview = () => {
    const updated = [...items];
    const current = updated[currentIndex];
    current.is_marked_for_review = !current.is_marked_for_review;
    setItems(updated);
    syncItemToBackend(current);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Flush any remaining active time on the current question
    const elapsedOnCurrent = Math.max(1, Math.round((Date.now() - questionActiveStartRef.current) / 1000));
    const itemsPayload = items.map((it, idx) => {
      const addedTime = idx === currentIndex ? elapsedOnCurrent : 0;
      return {
        question_id: it.question_id,
        time_spent_seconds: (it.time_spent_seconds || 0) + addedTime,
      };
    });

    // Handle offline-only test or when offline
    if (attemptId.startsWith('offline-') || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      const ansMap: Record<string, string> = {};
      const timeMap: Record<string, number> = {};
      items.forEach((it, idx) => {
        if (it.selected_answer?.option_id) {
          ansMap[it.question_id] = it.selected_answer.option_id;
        }
        timeMap[it.question_id] = (it.time_spent_seconds || 0) + (idx === currentIndex ? elapsedOnCurrent : 0);
      });

      await saveOfflineSubmission({
        id: `sub-${Date.now()}`,
        testId: attemptId,
        testTitle: attempt?.title_ta || 'TNPSC Offline Test',
        submittedAt: new Date().toISOString(),
        answers: ansMap,
        timeSpentSeconds: timeMap,
        timeRemainingSeconds: timeRemaining,
        synced: false,
      });

      alert(
        lang === 'ta'
          ? '✅ உங்கள் தேர்வு ஆஃப்லைனில் வெற்றிகரமாக சேமிக்கப்பட்டது! இணையம் வந்ததும் தானாக ஒத்திசைக்கப்படும்.'
          : '✅ Test saved offline! It will sync automatically when your device reconnects.'
      );
      router.replace('/learner/offline');
      return;
    }

    try {
      const res = await fetch(`/api/learner/tests/${attemptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_time_seconds: totalElapsed,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      router.replace(`/learner/tests/results/${attemptId}`);
    } catch (err: any) {
      // Save offline fallback if network suddenly dropped during submission
      const ansMap: Record<string, string> = {};
      const timeMap: Record<string, number> = {};
      items.forEach((it, idx) => {
        if (it.selected_answer?.option_id) {
          ansMap[it.question_id] = it.selected_answer.option_id;
        }
        timeMap[it.question_id] = (it.time_spent_seconds || 0) + (idx === currentIndex ? elapsedOnCurrent : 0);
      });

      await saveOfflineSubmission({
        id: `sub-${Date.now()}`,
        testId: attemptId,
        testTitle: attempt?.title_ta || 'TNPSC Test',
        submittedAt: new Date().toISOString(),
        answers: ansMap,
        timeSpentSeconds: timeMap,
        timeRemainingSeconds: timeRemaining,
        synced: false,
      });

      alert(
        lang === 'ta'
          ? '⚠️ இணைய தொடர்பு துண்டிக்கப்பட்டது. தேர்வு உங்கள் சாதனத்தில் பத்திரமாக சேமிக்கப்பட்டுள்ளது! இணையம் வந்ததும் Sync செய்யப்படும்.'
          : '⚠️ Network disconnected. Test attempt saved offline! Will sync once reconnected.'
      );
      router.replace('/learner/offline');
    }
  };

  // Keyboard Shading Shortcuts: 1-5 or A-E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toUpperCase();
      if (['1', 'A'].includes(key)) {
        handleShadeOption('A');
      } else if (['2', 'B'].includes(key)) {
        handleShadeOption('B');
      } else if (['3', 'C'].includes(key)) {
        handleShadeOption('C');
      } else if (['4', 'D'].includes(key)) {
        handleShadeOption('D');
      } else if (['5', 'E'].includes(key)) {
        handleShadeOption('E');
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentIndex((idx) => Math.min(items.length - 1, idx + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((idx) => Math.max(0, idx - 1));
      } else if (key === 'R') {
        handleToggleMarkForReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length]);

  if (loading || !attempt) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none z-50">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-xl shadow-indigo-500/10">
            <FileCheck2 className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white font-tamil tracking-tight">
          {t('தேர்வுத் தளம் தயாராகிறது...', 'Preparing Examination Interface...')}
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs font-tamil leading-relaxed">
          {t(
            'நேரக் கட்டுப்பாடு, OMR விடைத்தாள் மற்றும் வினாக்கள் தொகுக்கப்படுகின்றன...',
            'Configuring anti-tamper timer, OMR sheet and questions snapshot...'
          )}
        </p>
        <div className="w-48 h-1.5 bg-slate-850 rounded-full mt-5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse rounded-full w-full" />
        </div>
      </div>
    );
  }

  // Pre-Test Briefing Screen
  if (!briefingConfirmed) {
    const primaryTitle = lang === 'en' ? (attempt.title_en || attempt.title_ta) : attempt.title_ta;
    const secondaryTitle = lang === 'en' ? attempt.title_ta : attempt.title_en;
    const totalMarks = (items.length * 1.5).toFixed(1);

    return (
      <div className="fixed inset-0 w-full h-[100dvh] overflow-y-auto bg-slate-950 px-3 sm:px-6 py-4 sm:py-8 flex flex-col items-center justify-start z-50 overscroll-contain">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-4 sm:p-7 space-y-4 sm:space-y-5 shadow-2xl mb-12 shrink-0">
          
          {/* Top Bar with Back Link & Language Toggle */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <Link
              href="/learner/tests"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition py-1 px-2.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800"
            >
              <ChevronLeft className="w-4 h-4 text-indigo-400" />
              <span>{t('தேர்வுகள் மையம்', 'Back to Tests')}</span>
            </Link>

            <button
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-indigo-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>
          </div>

          {/* Official Badge & Test Titles */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="uppercase tracking-wider text-[11px]">
                {t('அதிகாரப்பூர்வ TNPSC தேர்வு முறை', 'Official TNPSC Examination Format')}
              </span>
            </div>

            <h1 className={`text-lg sm:text-2xl font-black text-white tracking-tight leading-snug ${lang === 'ta' ? 'font-tamil' : ''}`}>
              {primaryTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 line-clamp-1">{secondaryTitle}</p>
          </div>

          {/* Pre-Test 3-Column Key Meta Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            {/* Card 1: Questions */}
            <div className="p-3 sm:p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                {t('வினாக்கள்', 'QUESTIONS')}
              </span>
              <span className="text-xl sm:text-3xl font-black text-amber-400 font-mono my-1">
                {items.length}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-tamil">
                {t('வினாக்கள்', 'Questions')}
              </span>
            </div>

            {/* Card 2: Duration */}
            <div className="p-3 sm:p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                {t('நேரம்', 'DURATION')}
              </span>
              <span className="text-xl sm:text-3xl font-black text-cyan-400 font-mono my-1">
                {attempt.duration_minutes}m
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-tamil">
                {t('நிமிடங்கள்', 'Minutes')}
              </span>
            </div>

            {/* Card 3: Marks */}
            <div className="p-3 sm:p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                {t('மதிப்பெண்', 'MAX MARKS')}
              </span>
              <span className="text-xl sm:text-3xl font-black text-emerald-400 font-mono my-1">
                {attempt.total_marks || totalMarks}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-400/90 font-tamil font-semibold">
                +1.5 {t('மதிப்பெண்', 'marks/Q')}
              </span>
            </div>
          </div>

          {/* OMR Visual Bubble Demonstration Strip */}
          <div className="p-2.5 sm:p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold font-tamil">
              {t('OMR விடைத்தாள் அமைப்பு:', 'OMR Answer Pattern:')}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {['A', 'B', 'C', 'D'].map((b) => (
                <span
                  key={b}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono font-bold text-xs flex items-center justify-center shadow-inner"
                >
                  {b}
                </span>
              ))}
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono font-black text-xs flex items-center justify-center shadow-inner">
                E
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-semibold ml-1">
                ({t('5 வட்டங்கள்', '5 Bubbles')})
              </span>
            </div>
          </div>

          {/* TNPSC Mandatory OMR Rule Callout */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/15 to-amber-950/30 border border-amber-500/40 rounded-2xl space-y-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-amber-300 uppercase tracking-wider text-[11px] font-mono">
                {t('TNPSC அதிகாரப்பூர்வ OMR கட்டாய விதிமுறை', 'TNPSC Official OMR Mandatory Rule')}
              </h3>
            </div>
            <p className="leading-relaxed font-tamil text-slate-200 text-xs pl-1">
              {lang === 'en' ? (
                <>
                  Each question has 5 options: <strong>A, B, C, D, and E</strong>. If you do not know the correct answer, you <strong>MUST shade Option E</strong> (Answer Not Known). Leaving bubbles blank will result in penalty mark deductions under TNPSC examination rules.
                </>
              ) : (
                <>
                  தேர்வில் ஒவ்வொரு வினாவிற்கும் <strong>A, B, C, D, E</strong> ஆகிய 5 வட்டங்கள் உள்ளன. வினாவிற்கு விடை தெரியாவிட்டால், கட்டாயமாக <strong>'E' (விடை தெரியவில்லை)</strong> வட்டத்தை நிழலிட வேண்டும். எந்த வட்டமும் நிழலிடாமல் விடப்பட்டால் நெகட்டிவ் மதிப்பெண் குறைக்கப்படும்.
                </>
              )}
            </p>
          </div>

          {/* Quick Exam Tips & Guidance */}
          <div className="space-y-2 text-xs text-slate-300 bg-slate-950/70 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 font-tamil leading-relaxed">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('தேர்வு வழிகாட்டுதல் (Exam Guidelines):', 'Exam Guidelines:')}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 text-xs mt-2">
              <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('சரியான விடைக்கு +1.5 மதிப்பெண்கள். Option E-க்கு நெகட்டிவ் இல்லை.', 'Correct answer gives +1.5 marks. Option E has no penalty.')}</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{t('கணினியில் 1-5 அல்லது A-E அழுத்தி வேகமாக நிழலிடலாம்.', 'Keyboard 1-5 or A-E keys shade bubbles instantly.')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: 100% Full-Width Responsive */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => setBriefingConfirmed(true)}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span className="font-tamil">{t('OMR மாதிரித் தேர்வைத் தொடங்கு', 'Start OMR Mock Examination')}</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
            <Link
              href={`/learner/tests/${attemptId}/print`}
              target="_blank"
              className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 text-center"
            >
              <Printer className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('வினாத்தாள் PDF', 'Paper PDF')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Test Engine Screen
  const currentItem = items[currentIndex];
  const currentSnapshot = currentItem?.question_snapshot;
  const currentSelectedOpt = normalizeOptionId(currentItem?.selected_answer?.option_id);

  // Question numbers summary
  const answeredCount = items.filter((i) => i.is_answered).length;
  const reviewCount = items.filter((i) => i.is_marked_for_review).length;
  const unansweredCount = items.length - answeredCount;

  // Timer format (HH:MM:SS)
  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = timeRemaining < 300; // Under 5 minutes
  const activeQuestionText = getQuestionContent(currentSnapshot, lang);
  const activeOptions = getOptionsWithOptionE(currentSnapshot, lang);

  const regularOptions = activeOptions.filter((o) => !o.is_option_e);
  const optionE = activeOptions.find((o) => o.is_option_e);
  const areOptionsConcise = regularOptions.length > 0 && regularOptions.every((o) => (o.text || '').length < 35);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 text-slate-100 flex flex-col overflow-hidden z-50">
      {/* Top Test Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-2.5 sm:px-4 py-2 shrink-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Left: Desktop Q Counter & Title, Mobile Compact Timer */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Desktop Question Pill */}
            <span className="hidden sm:inline-flex items-center text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 whitespace-nowrap shrink-0">
              Q {currentIndex + 1} / {items.length}
            </span>

            {/* Anti-tamper Countdown Timer (always visible, compact on mobile) */}
            <div
              className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-lg border font-mono text-xs sm:text-sm font-bold tracking-wider shrink-0 ${
                isTimeCritical
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-400 animate-pulse'
                  : 'bg-slate-800/90 border-slate-700 text-cyan-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>

            {/* Desktop Test Title */}
            <h2 className="hidden md:block text-xs font-bold text-white truncate max-w-xs font-tamil">
              {lang === 'en' ? (attempt.title_en || attempt.title_ta) : attempt.title_ta}
            </h2>
          </div>

          {/* Right: Quick Actions (Language, Palette Toggle, Submit) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switch */}
            <button
              onClick={toggleLang}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] sm:text-xs font-bold text-indigo-300 flex items-center gap-1 transition cursor-pointer shrink-0"
              title="Toggle Language"
            >
              <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{lang === 'ta' ? 'EN' : 'தமிழ்'}</span>
            </button>

            {/* Mobile Palette Toggle with Shaded Count */}
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 lg:hidden flex items-center gap-1 transition cursor-pointer shrink-0"
              title="Question Palette & OMR Matrix"
            >
              <Grid className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-mono font-bold text-amber-300">
                {answeredCount}/{items.length}
              </span>
            </button>

            {/* Always Visible Top Submit Button */}
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-[11px] sm:text-xs font-bold rounded-lg shadow-md shadow-emerald-600/30 transition flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>{t('சமர்ப்பி', 'Submit')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Body - Screen-Fit Cockpit Layout */}
      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-2 sm:p-2.5 pb-2.5 grid grid-cols-12 gap-2.5 overflow-hidden">
        {/* Left Question Panel (8 cols) - Screen-Fit Zero Scroll */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-0 bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Question Header & Meta */}
          <div className="shrink-0 px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                வினா {currentIndex + 1} / {items.length}
              </span>
              {currentSnapshot?.source && (
                <span className="text-[11px] text-indigo-300 font-mono hidden sm:inline-flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {currentSnapshot.source.book || 'Samacheer Kalvi'}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                {currentSnapshot?.kind?.replace(/_/g, ' ') || 'DIRECT MCQ'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                +1.5 Marks
              </span>
            </div>
          </div>

          {/* Question Content & Options (Flex-1 scrollable with smooth touch scrolling) */}
          <div ref={questionContentRef} className="flex-1 min-h-0 overflow-y-auto touch-pan-y px-3.5 sm:px-6 py-3.5 space-y-3.5 pb-6">
            {/* Question Text */}
            <h3 className={`text-base sm:text-lg font-medium text-white leading-relaxed whitespace-pre-line break-words ${lang === 'ta' ? 'font-tamil' : ''}`}>
              {activeQuestionText}
            </h3>

            {/* Adaptive Options Grid: 2 columns if concise, 1 column if long */}
            <div className={areOptionsConcise ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-2'}>
              {regularOptions.map((opt) => {
                const isSelected = isMatchingOption(currentSelectedOpt, opt.id);
                return (
                  <label
                    key={opt.id}
                    onClick={() => handleShadeOption(opt.id)}
                    className={`flex items-center space-x-3 p-2.5 sm:p-3 rounded-xl border cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-400 ring-1 ring-indigo-400 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border text-xs font-mono font-bold flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'border-indigo-400 bg-indigo-600 text-white shadow'
                          : 'border-slate-700 bg-slate-900 text-slate-400'
                      }`}
                    >
                      {opt.id}
                    </div>

                    <span className={`text-xs sm:text-sm leading-snug flex-1 break-words ${lang === 'ta' ? 'font-tamil' : ''}`}>
                      {opt.text}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Option E (Answer Not Known) - Compact Horizontal Strip */}
            {optionE && (
              <label
                onClick={() => handleShadeOption('E')}
                className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl border cursor-pointer transition select-none ${
                  currentSelectedOpt === 'E'
                    ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-500 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-amber-500/40 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border text-xs font-mono font-bold flex items-center justify-center shrink-0 transition ${
                    currentSelectedOpt === 'E'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  E
                </div>
                <div className="flex items-center justify-between flex-1">
                  <span className="text-xs font-medium">
                    {lang === 'ta' ? 'விடை தெரியவில்லை (Answer Not Known)' : 'Answer Not Known (Option E)'}
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-mono hidden sm:inline">
                    (TNPSC Mandatory)
                  </span>
                </div>
              </label>
            )}
          </div>

          {/* Pinned Bottom Controls: Ultra-Responsive (Mobile 2-Tier vs Desktop Single-Row) */}
          <div className="shrink-0 px-2 sm:px-4 py-2 bg-slate-950 border-t border-slate-800">
            {/* Desktop & Tablet Single-Row Bar (>= 640px) */}
            <div className="hidden sm:flex items-center justify-between gap-2">
              {/* Left Actions: Review & Clear */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleToggleMarkForReview}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    currentItem?.is_marked_for_review
                      ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Mark this question to review later"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{currentItem?.is_marked_for_review ? 'Marked' : 'Mark Review'}</span>
                </button>

                {currentItem?.is_answered && (
                  <button
                    type="button"
                    onClick={handleClearResponse}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Clear selected bubble"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Center: Authentic OMR Bubble Strip */}
              <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800 shadow-inner">
                <span className="text-[10px] font-mono font-bold text-slate-400 mr-0.5">
                  OMR:
                </span>
                {['A', 'B', 'C', 'D', 'E'].map((optId) => {
                  const isShaded = currentSelectedOpt === optId;
                  const isE = optId === 'E';
                  return (
                    <button
                      key={optId}
                      type="button"
                      onClick={() => handleShadeOption(optId)}
                      className={`w-7.5 h-7.5 rounded-full border text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer select-none ${
                        isShaded
                          ? isE
                            ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-105'
                            : 'bg-white border-white text-slate-950 font-black shadow-md shadow-indigo-500/20 scale-105 ring-2 ring-indigo-400'
                          : 'border-slate-700 hover:border-slate-500 bg-slate-950/60 text-slate-400 hover:text-indigo-300'
                      }`}
                      title={`Shade Option ${optId}`}
                    >
                      {optId}
                    </button>
                  );
                })}
              </div>

              {/* Right: Prev & Next */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                  disabled={currentIndex === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold disabled:opacity-30 border border-slate-800 flex items-center gap-1 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIndex((idx) => Math.min(items.length - 1, idx + 1))}
                  disabled={currentIndex === items.length - 1}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-30 flex items-center gap-1 shadow-md shadow-indigo-600/25 transition cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile 2-Tier Stack (< 640px) */}
            <div className="sm:hidden space-y-2">
              {/* Mobile Row 1: Centered OMR Bubbles with Large Touch Targets */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 bg-slate-900/90 py-1.5 px-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono font-bold text-slate-400">OMR:</span>
                {['A', 'B', 'C', 'D', 'E'].map((optId) => {
                  const isShaded = currentSelectedOpt === optId;
                  const isE = optId === 'E';
                  return (
                    <button
                      key={optId}
                      type="button"
                      onClick={() => handleShadeOption(optId)}
                      className={`w-8 h-8 rounded-full border text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer select-none active:scale-95 ${
                        isShaded
                          ? isE
                            ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-md ring-2 ring-amber-400'
                            : 'bg-white border-white text-slate-950 font-black shadow-md ring-2 ring-indigo-400'
                          : 'border-slate-700 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {optId}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Row 2: Navigation & Review Actions */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleToggleMarkForReview}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition ${
                      currentItem?.is_marked_for_review
                        ? 'bg-purple-950 border-purple-500 text-purple-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{currentItem?.is_marked_for_review ? 'Marked' : 'Review'}</span>
                  </button>

                  {currentItem?.is_answered && (
                    <button
                      type="button"
                      onClick={handleClearResponse}
                      className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-[11px] font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                    disabled={currentIndex === 0}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 text-xs font-bold disabled:opacity-30 border border-slate-800 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentIndex((idx) => Math.min(items.length - 1, idx + 1))}
                    disabled={currentIndex === items.length - 1}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:opacity-30 flex items-center gap-1 shadow"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Palette Backdrop Overlay */}
        {paletteOpen && (
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden transition-opacity"
            onClick={() => setPaletteOpen(false)}
          />
        )}

        {/* Right Sidebar: Interactive Auto-Scrolling OMR Matrix (4 cols) */}
        <aside
          className={`fixed lg:static top-0 right-0 h-full lg:h-full w-80 max-w-[85vw] lg:w-auto z-40 col-span-12 lg:col-span-4 flex flex-col min-h-0 bg-slate-900/95 border-l lg:border-l-0 lg:border border-slate-800 p-2.5 sm:p-3 lg:rounded-2xl transition-transform duration-200 overflow-hidden shadow-xl ${
            paletteOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Top: Tabs & Close */}
          <div className="shrink-0 flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSidebarTab('omr_matrix')}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  sidebarTab === 'omr_matrix'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OMR Matrix
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('status_grid')}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  sidebarTab === 'status_grid'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Status Grid
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPaletteOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Status Legend */}
          <div className="shrink-0 grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400 text-[11px]">Shaded</span>
              </div>
              <strong className="text-emerald-400 font-mono text-xs">{answeredCount}</strong>
            </div>
            <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-400 text-[11px]">Blank</span>
              </div>
              <strong className="text-rose-400 font-mono text-xs">{unansweredCount}</strong>
            </div>
          </div>

          {/* Main Scrollable Area: OMR Matrix with Auto-Scroll OR Status Grid */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {sidebarTab === 'omr_matrix' ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Column Headers */}
                <div className="shrink-0 flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 px-3 py-1 bg-slate-950/60 rounded-t-lg border-b border-slate-800">
                  <span>Q#</span>
                  <div className="flex items-center gap-3 pr-2">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                    <span>D</span>
                    <span className="text-amber-400 font-bold">E</span>
                  </div>
                </div>

                {/* Auto-scrolling OMR Rows */}
                <div
                  ref={omrListRef}
                  className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 px-1 py-1"
                >
                  {items.map((item, idx) => {
                    const isCurrent = idx === currentIndex;
                    const selected = normalizeOptionId(item.selected_answer?.option_id);

                    return (
                      <div
                        key={item.question_id}
                        ref={isCurrent ? activeRowRef : null}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (!target.closest('[data-bubble="true"]')) {
                            handleJumpToQuestion(idx);
                          }
                        }}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-950/80 border border-indigo-500/60 text-white font-bold ring-1 ring-indigo-500/30 shadow-sm'
                            : 'hover:bg-slate-800/60 border border-transparent hover:border-slate-800 text-slate-400'
                        }`}
                      >
                        {/* Question Number Button - Dedicated touch target that jumps to question */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJumpToQuestion(idx);
                          }}
                          className={`h-7 px-2.5 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none active:scale-95 shrink-0 ${
                            isCurrent
                              ? 'bg-amber-400 text-slate-950 font-black shadow-sm ring-1 ring-amber-300'
                              : 'bg-slate-800/90 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700/80'
                          }`}
                          title={t(`வினா ${idx + 1}-க்குச் செல்`, `Jump to Question ${idx + 1}`)}
                        >
                          {isCurrent ? (
                            <span className="text-[10px] text-slate-950 animate-pulse">▶</span>
                          ) : (
                            <ArrowRight className="w-2.5 h-2.5 text-slate-400 opacity-60" />
                          )}
                          <span>Q{String(idx + 1).padStart(2, '0')}</span>
                        </button>

                        {/* Interactive Clickable Bubbles: A, B, C, D, E */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {['A', 'B', 'C', 'D', 'E'].map((bId) => {
                            const isShaded = selected === bId;
                            const isE = bId === 'E';

                            return (
                              <button
                                key={bId}
                                type="button"
                                data-bubble="true"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShadeOption(bId, idx);
                                  setCurrentIndex(idx);
                                }}
                                className={`w-6 h-6 rounded-full border text-[10px] font-mono font-bold flex items-center justify-center transition cursor-pointer select-none active:scale-95 ${
                                  isShaded
                                    ? isE
                                      ? 'bg-amber-400 border-amber-300 text-slate-950 font-black ring-2 ring-amber-300 shadow-sm'
                                      : 'bg-white border-white text-slate-950 font-black ring-2 ring-indigo-400 shadow-sm'
                                    : 'border-slate-700 hover:border-indigo-400 text-slate-500 hover:text-indigo-300 bg-slate-950/60'
                                }`}
                                title={`Question ${idx + 1} - Shade Option ${bId}`}
                              >
                                {isShaded ? bId : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TAB 2: Classic Numeric Status Palette (Scrollable) */
              <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-5 gap-1.5 p-1 content-start">
                {items.map((item, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = item.is_answered;
                  const isReview = item.is_marked_for_review;

                  let badgeClass = 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700';
                  if (isReview && isAnswered) {
                    badgeClass = 'bg-purple-900 border-purple-500 text-purple-200 ring-1 ring-purple-400';
                  } else if (isReview) {
                    badgeClass = 'bg-purple-950 border-purple-600 text-purple-300';
                  } else if (isAnswered) {
                    badgeClass = 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold';
                  } else if (idx < currentIndex) {
                    badgeClass = 'bg-rose-950/70 border-rose-700 text-rose-300';
                  }

                  return (
                    <button
                      key={item.question_id}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-8 rounded-lg text-xs font-mono font-semibold border flex items-center justify-center transition relative cursor-pointer active:scale-95 ${badgeClass} ${
                        isCurrent ? 'ring-2 ring-indigo-400 font-bold text-white' : ''
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isReview && isAnswered && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sticky Bottom Submit Button */}
          <div className="shrink-0 pt-2 mt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit OMR Sheet</span>
            </button>
          </div>
        </aside>
      </main>

      {/* Final Submit Confirmation Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in-50 duration-200">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-tamil">
                  {lang === 'en' ? 'Confirm OMR Sheet Submission' : 'OMR விடைத்தாள் சமர்ப்பிப்பு'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-tamil break-words">
                  {lang === 'en'
                    ? 'Are you ready to submit your OMR answer sheet? Your responses will be evaluated instantly with statewide percentile and speed metrics.'
                    : 'உங்கள் OMR விடைத்தாளைச் சமர்ப்பிக்க உறுதி செய்கிறீர்களா? சமர்ப்பித்தவுடன் உங்களின் விடைகள் சரிபார்க்கப்பட்டு உடனடியாக மதிப்பெண் மற்றும் தேர்வு பகுப்பாய்வு வழங்கப்படும்.'}
                </p>
              </div>
            </div>

            {/* 3 Metric Badges */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 sm:p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">TOTAL</span>
                <strong className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">{items.length}</strong>
                <span className="text-[10px] text-slate-500 font-tamil mt-0.5">{lang === 'en' ? 'Questions' : 'வினாக்கள்'}</span>
              </div>
              <div className="p-3 sm:p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">SHADED</span>
                <strong className="text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-0.5">{answeredCount}</strong>
                <span className="text-[10px] text-emerald-400/90 font-tamil mt-0.5 font-semibold">{lang === 'en' ? 'Answered' : 'விடையளித்தவை'}</span>
              </div>
              <div className="p-3 sm:p-3.5 bg-rose-950/40 rounded-2xl border border-rose-500/40 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">BLANK</span>
                <strong className="text-xl sm:text-2xl font-black text-rose-300 font-mono mt-0.5">{unansweredCount}</strong>
                <span className="text-[10px] text-rose-400/90 font-tamil mt-0.5 font-semibold">{lang === 'en' ? 'Remaining' : 'நிலுவை'}</span>
              </div>
            </div>

            {/* TNPSC Option E Advisory */}
            {unansweredCount > 0 && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start space-x-2.5 font-tamil leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="break-words">
                  {lang === 'en' ? (
                    <>You have <strong>{unansweredCount}</strong> unanswered questions. Per TNPSC rules, shade <strong>Option E</strong> if the answer is unknown.</>
                  ) : (
                    <>கவனம்: நீங்கள் <strong>{unansweredCount}</strong> வினாக்களுக்கு இன்னும் விடையளிக்கவில்லை. TNPSC விதிகளின்படி விடை தெரியவில்லை எனில் <strong>'Option E'</strong> வட்டத்தை நிழலிடவும்.</>
                  )}
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                disabled={submitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer text-center"
              >
                {lang === 'en' ? 'Resume Exam' : 'தேர்வைத் தொடர் (Resume)'}
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:from-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'en' ? 'Grading OMR Sheet...' : 'மதிப்பெண் கணக்கிடப்படுகிறது...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Confirm & Submit OMR' : 'உறுதி செய்து சமர்ப்பி (Submit)'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
