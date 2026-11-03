'use client';

import { useState, useEffect, use, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Printer,
  Sparkles,
  Award,
  Clock,
  Send,
  HelpCircle
} from 'lucide-react';

interface QuestionItem {
  order: number;
  id: string;
  question_ta: string;
  question_en: string;
}

export default function OMRSyncKeyInPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [testInfo, setTestInfo] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(200);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeQuestion, setActiveQuestion] = useState<number>(1);
  const [timeMinutes, setTimeMinutes] = useState<number>(180);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch test basic info to know total questions
  useEffect(() => {
    async function loadTest() {
      setLoading(true);
      try {
        const res = await fetch(`/api/learner/tests/${id}/print`);
        const json = await res.json();
        if (res.ok && json) {
          setTestInfo(json);
          setTotalQuestions(json.total_questions || 200);
          setTimeMinutes(json.duration_minutes || 180);
        }
      } catch (err) {
        console.error('Failed to load test info:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTest();
  }, [id]);

  // Handle setting an answer and auto-advancing
  const handleMarkBubble = useCallback(
    (qNum: number, option: string) => {
      setAnswers((prev) => {
        // If clicking the already selected option, keep or toggle
        return {
          ...prev,
          [qNum]: option,
        };
      });

      // Auto-advance to next question if within bounds
      if (qNum < totalQuestions) {
        setActiveQuestion(qNum + 1);
      }
    },
    [totalQuestions]
  );

  const handleClearAnswer = (qNum: number) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qNum];
      return next;
    });
  };

  // Keyboard navigation listener (A, B, C, D, E, arrows, backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toUpperCase();

      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        e.preventDefault();
        handleMarkBubble(activeQuestion, key);
      } else if (['1', '2', '3', '4', '5'].includes(key)) {
        e.preventDefault();
        const mapNum: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' };
        handleMarkBubble(activeQuestion, mapNum[key]);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeQuestion < totalQuestions) setActiveQuestion((q) => q + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeQuestion > 1) setActiveQuestion((q) => q - 1);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleClearAnswer(activeQuestion);
        if (activeQuestion > 1) setActiveQuestion((q) => q - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestion, totalQuestions, handleMarkBubble]);

  // Compute live bubble count tally
  const counts = useMemo(() => {
    const tally: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    Object.values(answers).forEach((ans) => {
      if (tally[ans] !== undefined) tally[ans]++;
    });
    const totalShaded = Object.keys(answers).length;
    return { tally, totalShaded };
  }, [answers]);

  const handleSubmitOMR = async () => {
    if (counts.totalShaded === 0) {
      alert('தயவுசெய்து உங்கள் OMR விடைத்தாளின் விடைகளை உள்ளிடவும்.');
      return;
    }

    if (
      counts.totalShaded < totalQuestions &&
      !confirm(
        `நீங்கள் ${totalQuestions} வினாக்களில் ${counts.totalShaded} வினாக்களுக்கு மட்டுமே விடையளித்துள்ளீர்கள். மீதமுள்ள ${
          totalQuestions - counts.totalShaded
        } வினாக்கள் விடையில்லாதவையாகக் கருதப்படும். மதிப்பெண்ணைக் கணக்கிடலாமா?`
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/learner/tests/${id}/omr-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          total_time_minutes: timeMinutes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit OMR answers');
      }

      // Redirect directly to results page
      router.push(`/learner/tests/results/${data.attempt_id}`);
    } catch (err: any) {
      alert(err.message || 'Error evaluating OMR sheet');
      setSubmitting(false);
    }
  };

  // Group questions into columns of 50
  const cols = useMemo(() => {
    const list = [];
    const step = 50;
    for (let i = 1; i <= totalQuestions; i += step) {
      const end = Math.min(i + step - 1, totalQuestions);
      list.push({ start: i, end });
    }
    return list;
  }, [totalQuestions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">OMR விடை உள்ளீட்டு தளம் தயாராகிறது...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/learner/tests"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2 text-xs text-pink-400 font-semibold uppercase">
                <span>Phase 10</span>
                <span>•</span>
                <span>OMR Sheet Evaluator</span>
              </div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-pink-400" />
                <span>OMR விடை உள்ளீடு & உடனடி மதிப்பெண் (Quick Key-In)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {testInfo?.title_ta || 'TNPSC Mock Examination'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/learner/tests/${id}/print`}
              target="_blank"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 flex items-center space-x-1.5 transition"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>வினாத்தாள் PDF</span>
            </Link>

            <button
              onClick={handleSubmitOMR}
              disabled={submitting || counts.totalShaded === 0}
              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-pink-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>மதிப்பிடப்படுகிறது...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>மதிப்பெண் கணக்கிடு (Evaluate OMR)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live OMR Audit Bar (Matches physical OMR bottom counts) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-indigo-950/40 border border-pink-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-400 block font-medium">வட்டமிட்ட வினாக்கள்</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {counts.totalShaded}{' '}
                <span className="text-xs text-slate-400 font-normal">/ {totalQuestions}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="hidden sm:block text-xs text-pink-300">
              <span className="font-semibold block">விசைப்பலகை வசதி (Keyboard Shortcut):</span>
              <span className="text-slate-400">
                தட்டச்சு விசையில் <strong className="text-pink-300">A, B, C, D, E</strong> அழுத்துங்கள். தானாக அடுத்த வினாவிற்கு நகரும்!
              </span>
            </div>
          </div>

          {/* Counts Matrix */}
          <div className="flex items-center space-x-2 text-center font-mono text-xs">
            {['A', 'B', 'C', 'D', 'E'].map((letter) => (
              <div
                key={letter}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-pink-800/60"
              >
                <span className="text-[10px] text-pink-400 block font-bold">{letter}</span>
                <strong className="text-sm text-white">{counts.tally[letter] || 0}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Bubble Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cols.map((col, cIdx) => (
            <div
              key={cIdx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-1"
            >
              <div className="text-center py-1 bg-slate-950 rounded-lg text-xs font-bold text-pink-400 font-mono border border-slate-800/80 mb-2">
                வினாக்கள்: {col.start} - {col.end}
              </div>

              <div className="space-y-1">
                {Array.from({ length: col.end - col.start + 1 }, (_, i) => {
                  const qNum = col.start + i;
                  const selected = answers[qNum];
                  const isActive = activeQuestion === qNum;

                  return (
                    <div
                      key={qNum}
                      onClick={() => setActiveQuestion(qNum)}
                      className={`flex items-center justify-between p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-pink-950/40 border-pink-500 shadow-md ring-1 ring-pink-500/50'
                          : selected
                          ? 'bg-slate-950/70 border-slate-700/80'
                          : 'bg-slate-950/30 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <span
                        className={`font-mono text-xs font-bold w-7 text-right pr-1 ${
                          isActive ? 'text-pink-400' : 'text-slate-400'
                        }`}
                      >
                        {qNum}.
                      </span>

                      <div className="flex items-center space-x-1">
                        {['A', 'B', 'C', 'D', 'E'].map((opt) => {
                          const isShaded = selected === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkBubble(qNum, opt);
                              }}
                              className={`w-6 h-6 rounded-full border text-xs font-mono font-bold flex items-center justify-center transition ${
                                isShaded
                                  ? 'bg-black text-white border-white ring-2 ring-pink-500 font-black scale-110 shadow-sm'
                                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-pink-400 hover:text-white'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Floating Submit Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>தேர்வு எழுத எடுத்துக்கொண்ட நேரம்:</span>
            <input
              type="number"
              min={10}
              max={300}
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(Number(e.target.value))}
              className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono font-bold text-center text-xs"
            />
            <span>நிமிடங்கள்</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (confirm('அனைத்து விடைகளையும் அழிக்க விரும்புகிறீர்களா?')) {
                  setAnswers({});
                  setActiveQuestion(1);
                }
              }}
              className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 transition"
            >
              அனைத்தையும் அழி (Clear All)
            </button>

            <button
              onClick={handleSubmitOMR}
              disabled={submitting || counts.totalShaded === 0}
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-pink-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>மதிப்பிடப்படுகிறது...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>மதிப்பெண் கணக்கிடு & பகுப்பாய்வு (Submit & Evaluate)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

