'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  CheckSquare,
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Play,
  Flame,
  Calendar,
  Zap,
  Award
} from 'lucide-react';
import DailyStreakTrackerHub from '@/components/learner/DailyStreakTrackerHub';

interface TrackerNode {
  id: string;
  parent_id: string | null;
  level: string;
  title_en: string;
  title_ta: string;
  order_index: number;
  status: 'not_started' | 'in_progress' | 'completed';
  children?: TrackerNode[];
}

export default function LearnerTrackerPage() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'daily_streaks' | 'syllabus_tracker'>('daily_streaks');
  const [nodes, setNodes] = useState<TrackerNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStandardId, setSelectedStandardId] = useState<string>('std-6th');
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({
    'std-6th-term-1': true,
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTrackerData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learner/tracker');
      const data = await res.json();
      if (res.ok) {
        const map: Record<string, TrackerNode> = {};
        const roots: TrackerNode[] = [];

        data.nodes.forEach((item: TrackerNode) => {
          map[item.id] = { ...item, children: [] };
        });

        data.nodes.forEach((item: TrackerNode) => {
          if (item.parent_id && map[item.parent_id]) {
            map[item.parent_id].children?.push(map[item.id]);
          } else {
            roots.push(map[item.id]);
          }
        });

        setNodes(roots);
      }
    } catch (err) {
      console.error('Failed to load tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const handleUpdateStatus = async (nodeId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'not_started'
        ? 'in_progress'
        : currentStatus === 'in_progress'
        ? 'completed'
        : 'not_started';

    setUpdatingId(nodeId);

    try {
      const res = await fetch('/api/learner/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabus_node_id: nodeId,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        const updateNodeStatus = (list: TrackerNode[]): TrackerNode[] => {
          return list.map((node) => {
            if (node.id === nodeId) {
              return { ...node, status: nextStatus as any };
            }
            if (node.children) {
              return { ...node, children: updateNodeStatus(node.children) };
            }
            return node;
          });
        };
        setNodes(updateNodeStatus(nodes));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const standards = nodes.filter((n) => n.level === 'class').sort((a, b) => a.order_index - b.order_index);
  const selectedStandard = standards.find((s) => s.id === selectedStandardId) || standards[0];

  const computeStandardProgress = (standard: TrackerNode) => {
    let totalLessons = 0;
    let completedLessons = 0;

    const countRecursive = (node: TrackerNode) => {
      if (node.level === 'lesson') {
        totalLessons++;
        if (node.status === 'completed') completedLessons++;
      }
      node.children?.forEach(countRecursive);
    };

    countRecursive(standard);
    const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { totalLessons, completedLessons, pct };
  };

  let overallTotal = 0;
  let overallCompleted = 0;
  standards.forEach((s) => {
    const p = computeStandardProgress(s);
    overallTotal += p.totalLessons;
    overallCompleted += p.completedLessons;
  });
  const overallPercentage = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-400 tracking-wider uppercase">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                Phase 9
              </span>
              <span>•</span>
              <span>{t('தினசரி இலக்கு & பாட நிறைவு', 'Daily Consistency & Progress')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
              <span>{t('தினசரி இலக்கு & தொடர் கண்காணிப்பு', 'Daily Streaks & Progress Hub')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {t(
                'தினசரி வினா இலக்குகளை நிறைவு செய்து Streak-ஐ பாதுகாக்கவும்; சமச்சீர் கல்வி பாடங்களை வரிசையாக படித்து முடிக்கவும்.',
                'Achieve daily question goals, protect your study streak, and check off Samacheer Kalvi syllabus topics.'
              )}
            </p>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('daily_streaks')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'daily_streaks'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>{t('தினசரி Streak & இலக்கு', 'Daily Streaks & Targets')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('syllabus_tracker')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'syllabus_tracker'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>{t('பாடத்திட்ட நிறைவு', 'Syllabus Tracker')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Daily Streaks & Targets */}
      {activeTab === 'daily_streaks' && <DailyStreakTrackerHub />}

      {/* Tab 2: Syllabus Tracker */}
      {activeTab === 'syllabus_tracker' && (
        <div className="space-y-6">
          {/* Overall Progress Hero */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                {t('சமச்சீர் கல்வி பாடத்திட்ட நிறைவு விகிதம்', 'Overall Samacheer Kalvi Coverage')}
              </span>
              <p className="text-xl sm:text-2xl font-black text-white">
                {lang === 'en'
                  ? `${overallCompleted} of ${overallTotal} Lessons Completed`
                  : `${overallCompleted} / ${overallTotal} பாடங்கள் முடிக்கப்பட்டன`}
              </p>
              <p className="text-xs text-slate-400">
                {t('6 முதல் 12-ஆம் வகுப்பு 2025 புதிய பாடநூல்கள்', '6th to 12th Standard 2025 Revised Edition Textbooks')}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-3xl font-black text-indigo-400 font-mono">{overallPercentage}%</span>
                <span className="text-[10px] text-slate-500 block uppercase font-mono font-medium">
                  {t('நிறைவு சதவீதம்', 'Completion Rate')}
                </span>
              </div>
              <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Standard Select Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {standards.map((std) => {
              const p = computeStandardProgress(std);
              const isSelected = std.id === selectedStandardId;

              return (
                <button
                  key={std.id}
                  onClick={() => setSelectedStandardId(std.id)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center space-x-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>{lang === 'en' ? std.title_en : std.title_ta}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.pct}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Standard Lessons Tree */}
          {selectedStandard && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>{lang === 'en' ? selectedStandard.title_en : selectedStandard.title_ta}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t('பருவம் வாரியான இயல்கள் மற்றும் பாடப் பிரிவுகள்', 'Terms, Units (Iyals) and Lessons checklist')}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-sm font-bold text-indigo-400 font-mono">
                    {computeStandardProgress(selectedStandard).completedLessons} /{' '}
                    {computeStandardProgress(selectedStandard).totalLessons}
                  </span>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    {t('பாடங்கள் நிறைவு', 'Lessons Done')}
                  </span>
                </div>
              </div>

              {/* Terms and Units Accordion */}
              <div className="space-y-4">
                {selectedStandard.children?.map((term) => {
                  const isTermExpanded = expandedTerms[term.id] ?? true;
                  return (
                    <div key={term.id} className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40">
                      {/* Term Header */}
                      <button
                        onClick={() =>
                          setExpandedTerms((prev) => ({
                            ...prev,
                            [term.id]: !isTermExpanded,
                          }))
                        }
                        className="w-full px-4 sm:px-5 py-3.5 bg-slate-800/50 hover:bg-slate-800/80 flex items-center justify-between text-left transition cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-slate-200">
                            {lang === 'en' ? term.title_en : term.title_ta}
                          </span>
                        </div>
                        {isTermExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {/* Units and Lessons */}
                      {isTermExpanded && (
                        <div className="p-3.5 sm:p-5 space-y-4">
                          {term.children?.map((unit) => (
                            <div key={unit.id} className="space-y-2.5 pl-2 border-l-2 border-indigo-500/30">
                              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                <span>{lang === 'en' ? unit.title_en : unit.title_ta}</span>
                              </h4>

                              {/* Lessons list */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                {unit.children?.map((lesson) => {
                                  const isCompleted = lesson.status === 'completed';
                                  const isUpdating = updatingId === lesson.id;

                                  return (
                                    <div
                                      key={lesson.id}
                                      className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                                        isCompleted
                                          ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                                          : 'bg-slate-900 border-slate-800/80 text-slate-300'
                                      }`}
                                    >
                                      <div className="min-w-0 flex-1 pr-2">
                                        <p className="text-xs font-semibold leading-snug break-words">
                                          {lang === 'en' ? lesson.title_en : lesson.title_ta}
                                        </p>
                                        <span className="text-[10px] text-slate-500 block mt-0.5">
                                          {isCompleted
                                            ? t('முடிக்கப்பட்டது ✓', 'Completed ✓')
                                            : lesson.status === 'in_progress'
                                            ? t('பயிற்சியில்...', 'In Progress...')
                                            : t('தொடங்கவில்லை', 'Not Started')}
                                        </span>
                                      </div>

                                      <div className="flex items-center shrink-0">
                                        <button
                                          onClick={() => handleUpdateStatus(lesson.id, lesson.status)}
                                          disabled={isUpdating}
                                          className={`p-2 rounded-xl border text-xs font-medium transition flex items-center justify-center cursor-pointer ${
                                            isCompleted
                                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                                          }`}
                                          title={t('நிலையை மாற்றுக', 'Toggle Status')}
                                        >
                                          {isUpdating ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <CheckCircle2 className="w-4 h-4" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
