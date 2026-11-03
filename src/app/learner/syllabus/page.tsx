'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
  ChevronDown,
  Sparkles,
  FileCheck2,
  Folder,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  Play,
  Flame,
  Timer
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SyllabusNode {
  id: string;
  parent_id: string | null;
  level: string;
  title_en: string;
  title_ta: string;
  order_index: number;
  children?: SyllabusNode[];
}

export default function LearnerSyllabusExplorerPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [activeTrack, setActiveTrack] = useState<'school_books' | 'exam_syllabus'>('school_books');
  const [nodes, setNodes] = useState<SyllabusNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [launchingNodeId, setLaunchingNodeId] = useState<string | null>(null);

  // Standard-wise selected state (default: 6th std)
  const [selectedStandardId, setSelectedStandardId] = useState<string>('std-6th');
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({
    'std-6th-term-1': true,
    'std-6th-term-2': false,
    'std-6th-term-3': false,
  });
  const [expandedIyals, setExpandedIyals] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  const handleLaunchExam = async (nodeId: string, titleTa: string, titleEn: string) => {
    setLaunchingNodeId(nodeId);
    try {
      const res = await fetch('/api/learner/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dynamic_mode: true,
          syllabus_node_id: nodeId,
          title_ta: titleTa,
          title_en: titleEn,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate test');
      }

      router.push(`/learner/tests/${data.attempt_id}`);
    } catch (err: any) {
      alert(err.message || 'Error creating test');
      setLaunchingNodeId(null);
    }
  };

  const fetchSyllabus = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('syllabus_nodes')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) {
      const map: Record<string, SyllabusNode> = {};
      const roots: SyllabusNode[] = [];

      data.forEach((item: SyllabusNode) => {
        map[item.id] = { ...item, children: [] };
      });

      data.forEach((item: SyllabusNode) => {
        if (item.parent_id && map[item.parent_id]) {
          map[item.parent_id].children?.push(map[item.id]);
        } else {
          roots.push(map[item.id]);
        }
      });

      setNodes(roots);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  // Filter school book standards (level === 'class')
  const standards = nodes.filter((n) => n.level === 'class').sort((a, b) => a.order_index - b.order_index);
  const selectedStandard = standards.find((s) => s.id === selectedStandardId) || standards[0];

  // Filter official exam syllabus subjects (level === 'subject')
  const examSubjects = nodes.filter((n) => n.level === 'subject').sort((a, b) => a.order_index - b.order_index);

  const toggleTerm = (termId: string) => {
    setExpandedTerms((prev) => ({ ...prev, [termId]: !prev[termId] }));
  };

  const toggleIyal = (iyalId: string) => {
    setExpandedIyals((prev) => ({ ...prev, [iyalId]: !prev[iyalId] }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-28">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-md shadow-indigo-500/10">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              {t('பாடத்திட்ட ஆய்வு மையம்', 'Syllabus Explorer')}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t(
                '2025 புதிய சமச்சீர் பாடநூல்கள் (6-12) & அதிகாரப்பூர்வ தேர்வு பாடத்திட்டம்.',
                '2025 Samacheer Kalvi School Textbooks (6th-12th) & Official TNPSC Exam Syllabus.'
              )}
            </p>
          </div>
        </div>

        {/* Track Switcher (Dual Track) */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-full sm:w-auto shrink-0">
          <button
            onClick={() => setActiveTrack('school_books')}
            className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTrack === 'school_books'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('சமச்சீர் பாடநூல் (6-12)', 'Samacheer Textbooks')}</span>
          </button>
          <button
            onClick={() => setActiveTrack('exam_syllabus')}
            className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTrack === 'exam_syllabus'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('தேர்வு முறை (2024)', 'TNPSC Syllabus')}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-slate-900/60 rounded-3xl border border-slate-800">
          {t('பாடத்திட்டம் ஏற்றப்படுகிறது...', 'Loading syllabus curriculum...')}
        </div>
      ) : activeTrack === 'school_books' ? (
        /* TRACK 1: SAMACHEER KALVI 2025 SCHOOL BOOKS (6th to 12th) */
        <div className="space-y-6">
          {/* Standard Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 p-2 bg-slate-900/90 rounded-2xl border border-slate-800">
            {standards.map((std) => {
              const isSelected = selectedStandard?.id === std.id;
              const match = std.id.match(/\d+/) || std.title_en.match(/\d+/);
              const num = match ? match[0] : '';
              const titleMain = lang === 'en'
                ? (num ? `${num}th Standard` : std.title_en)
                : (num ? `${num}-ஆம் வகுப்பு` : std.title_ta.split(' ')[0]);
              const titleSub = lang === 'en'
                ? (num ? `${num}-ஆம் வகுப்பு` : std.title_ta.split(' ')[0])
                : (num ? `${num}th Std` : std.title_en);

              return (
                <button
                  key={std.id}
                  onClick={() => {
                    setSelectedStandardId(std.id);
                    if (std.children && std.children[0]) {
                      setExpandedTerms({ [std.children[0].id]: true });
                    }
                  }}
                  className={`w-full min-w-0 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/50'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate w-full block font-semibold text-xs">
                    {titleMain}
                  </span>
                  <span className="text-[10px] font-normal text-slate-400 truncate w-full block">
                    {titleSub}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Standard Overview Banner */}
          {selectedStandard && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/40 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{t('2025 புதிய சமச்சீர் பாடநூல்', '2025 Samacheer Kalvi Edition')}</span>
                </span>
                <h2 className="text-xl font-bold text-white">
                  {lang === 'en' ? selectedStandard.title_en : selectedStandard.title_ta}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedStandard.children?.length === 3
                    ? t('3 பருவங்கள் (3 Terms) • அனைத்து இயல்களும் பாடங்களும்', '3 Terms • All Units & Chapters included')
                    : t('முழு பாடநூல் • அனைத்து இயல்களும் பாடங்களும்', 'Full Textbook • All Units & Chapters included')}
                </p>
              </div>

              {/* Full Standard Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <Link
                  href={`/learner/practice?nodeId=${selectedStandard.id}&type=class&title=${encodeURIComponent(lang === 'en' ? selectedStandard.title_en : selectedStandard.title_ta)}`}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t('பயிற்சி வினாக்கள்', 'Practice Bank')}</span>
                </Link>

                <button
                  onClick={() =>
                    handleLaunchExam(
                      selectedStandard.id,
                      `${selectedStandard.title_ta} - முழுத் தேர்வு`,
                      `${selectedStandard.title_en} - Full Test`
                    )
                  }
                  disabled={launchingNodeId === selectedStandard.id}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  <Timer className="w-4 h-4 shrink-0" />
                  <span>
                    {launchingNodeId === selectedStandard.id
                      ? t('தயாராகிறது...', 'Preparing...')
                      : t('மாதிரித் தேர்வு எழுது (Timed Exam)', 'Take Timed Exam')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Terms, Iyals & Lessons Hierarchy */}
          <div className="space-y-4">
            {selectedStandard?.children?.map((term) => {
              const isTermExpanded = expandedTerms[term.id] !== false;
              const hasMultipleTerms = (selectedStandard.children?.length || 0) > 1;
              const iyals = term.children || [];

              return (
                <div
                  key={term.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg"
                >
                  {/* Term Header */}
                  <div
                    className="p-5 bg-slate-850/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer"
                    onClick={() => toggleTerm(term.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {isTermExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {lang === 'en' ? term.title_en : term.title_ta}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          {lang === 'en' ? term.title_ta : term.title_en} • ({iyals.length} {t('இயல்கள்', 'Units')})
                        </p>
                      </div>
                    </div>

                    {/* Term-wise Action Buttons */}
                    <div className="flex items-center space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/learner/practice?nodeId=${term.id}&type=term&title=${encodeURIComponent(lang === 'en' ? term.title_en : term.title_ta)}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{t('பயிற்சி', 'Practice')}</span>
                      </Link>
                      <button
                        onClick={() =>
                          handleLaunchExam(
                            term.id,
                            `${term.title_ta} - பருவ மாதிரித் தேர்வு`,
                            `${term.title_en} - Term Test`
                          )
                        }
                        disabled={launchingNodeId === term.id}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold transition cursor-pointer"
                      >
                        <Timer className="w-3 h-3" />
                        <span>
                          {launchingNodeId === term.id
                            ? t('தயாராகிறது...', 'Preparing...')
                            : hasMultipleTerms
                            ? t('பருவத் தேர்வு', 'Term Test')
                            : t('முழுத் தேர்வு', 'Full Test')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Inside Term: Iyals */}
                  {isTermExpanded && (
                    <div className="p-4 sm:p-6 space-y-4">
                      {iyals.map((iyal) => {
                        const isIyalExpanded = expandedIyals[iyal.id] !== false;
                        const lessons = iyal.children || [];

                        return (
                          <div
                            key={iyal.id}
                            className="rounded-2xl border border-slate-800/90 bg-slate-950/60 overflow-hidden space-y-3 p-4"
                          >
                            {/* Iyal Header Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-slate-800/80">
                              <div
                                className="flex items-center space-x-2.5 cursor-pointer"
                                onClick={() => toggleIyal(iyal.id)}
                              >
                                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                                  {isIyalExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                  <span className="font-bold text-sm text-indigo-200">
                                    {lang === 'en' ? iyal.title_en : iyal.title_ta}
                                  </span>
                                  <span className="block text-[10px] text-slate-500 font-mono">
                                    {lessons.length} {t('பாடப்பகுதிகள் (Lessons)', 'Lessons')}
                                  </span>
                                </div>
                              </div>

                              {/* Iyal-wise Action Buttons */}
                              <div className="flex items-center space-x-2 self-start sm:self-auto">
                                <Link
                                  href={`/learner/practice?nodeId=${iyal.id}&type=unit&title=${encodeURIComponent(lang === 'en' ? iyal.title_en : iyal.title_ta)}`}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                                >
                                  <span>{t('பயிற்சி', 'Practice')}</span>
                                </Link>
                                <button
                                  onClick={() =>
                                    handleLaunchExam(
                                      iyal.id,
                                      `${iyal.title_ta} - இயல் தேர்வு`,
                                      `${iyal.title_en} - Iyal Test`
                                    )
                                  }
                                  disabled={launchingNodeId === iyal.id}
                                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition cursor-pointer"
                                >
                                  <Timer className="w-3 h-3" />
                                  <span>
                                    {launchingNodeId === iyal.id ? t('தயாராகிறது...', 'Preparing...') : t('இயல் தேர்வு', 'Unit Test')}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Lessons List inside Iyal (No truncate, full lesson name clearly visible) */}
                            {isIyalExpanded && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                                {lessons.map((les) => (
                                  <div
                                    key={les.id}
                                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm"
                                  >
                                    {/* Full Lesson Title - NEVER TRUNCATED! */}
                                    <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <FileText className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug break-words">
                                          {lang === 'en' ? les.title_en : les.title_ta}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight break-words">
                                          {lang === 'en' ? les.title_ta : les.title_en}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Lesson-wise Action Buttons: Single-line, never wrapping */}
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-end">
                                      <Link
                                        href={`/learner/practice?nodeId=${les.id}&type=lesson&title=${encodeURIComponent(lang === 'en' ? les.title_en : les.title_ta)}`}
                                        className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition text-center whitespace-nowrap"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        <span>{t('பயிற்சி', 'Practice')}</span>
                                      </Link>
                                      <button
                                        onClick={() =>
                                          handleLaunchExam(
                                            les.id,
                                            `${les.title_ta} - பாடம் தேர்வு`,
                                            `${les.title_en} - Lesson Test`
                                          )
                                        }
                                        disabled={launchingNodeId === les.id}
                                        className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition cursor-pointer text-center disabled:opacity-50 whitespace-nowrap"
                                      >
                                        <Timer className="w-3.5 h-3.5 shrink-0" />
                                        <span>
                                          {launchingNodeId === les.id ? t('தயாராகிறது...', 'Preparing...') : t('தேர்வு', 'Test')}
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TRACK 2: OFFICIAL TNPSC EXAM NOTIFICATION SYLLABUS */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>{t('TNPSC அதிகாரப்பூர்வ தேர்வு முறை (12.12.2024 அறிவிக்கை)', 'Official TNPSC Syllabus Notification (2024)')}</span>
            </span>
            <h2 className="text-xl font-bold text-white">
              {t('குரூப் 4 & குரூப் 2/2A தேர்வு பாடத்திட்டம்', 'Group 4 & Group 2/2A Examination Syllabus')}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t(
                'பகுதி அ: பொது அறிவு (75 வினாக்கள்) • பகுதி ஆ: திறனறிவு (25 வினாக்கள்) • பகுதி இ: பொதுத் தமிழ் (100 வினாக்கள்).',
                'Part A: General Studies (75 Qs) • Part B: Aptitude (25 Qs) • Part C: General Tamil (100 Qs).'
              )}
            </p>
          </div>

          <div className="space-y-6">
            {examSubjects.map((sub) => (
              <div key={sub.id} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {lang === 'en' ? sub.title_en : sub.title_ta}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {lang === 'en' ? sub.title_ta : sub.title_en}
                    </p>
                  </div>

                  <Link
                    href={`/learner/practice?nodeId=${sub.id}&type=subject&title=${encodeURIComponent(lang === 'en' ? sub.title_en : sub.title_ta)}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 font-semibold text-xs transition-all self-start sm:self-auto"
                  >
                    <Play className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{t('பகுதி முழு மாதிரி தேர்வு (Part Mock)', 'Part Mock Exam')}</span>
                  </Link>
                </div>

                {/* Units List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sub.children?.map((unit) => (
                    <div
                      key={unit.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400/80 border border-slate-800 font-bold">
                          {unit.level.toUpperCase()}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100">
                          {lang === 'en' ? unit.title_en : unit.title_ta}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {lang === 'en' ? unit.title_ta : unit.title_en}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {unit.children?.length || 0} {t('தலைப்புகள் (Chapters)', 'Chapters')}
                        </span>

                        <Link
                          href={`/learner/practice?nodeId=${unit.id}&type=unit&title=${encodeURIComponent(lang === 'en' ? unit.title_en : unit.title_ta)}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition-all"
                        >
                          <Play className="w-3 h-3" />
                          <span>{t('அலகு தேர்வு (Unit Test)', 'Unit Test')}</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
