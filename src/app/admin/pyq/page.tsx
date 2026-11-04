'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Award,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Play,
  Layers,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Archive,
  Trash2,
  Edit2,
  Eye,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import CreatePaperModal from '@/components/admin/pyq/CreatePaperModal';
import EditPaperDetailsModal from '@/components/admin/pyq/EditPaperDetailsModal';

interface PYQPaper {
  id: string;
  exam_id: string;
  exam_group: string;
  year: number;
  date_held: string | null;
  title_ta: string;
  title_en: string;
  paper_code: string | null;
  duration_minutes: number;
  total_marks: number;
  expected_question_count: number;
  assigned_questions_count: number;
  is_complete: boolean;
  status: 'draft' | 'under_review' | 'ready_to_publish' | 'published' | 'archived';
  is_archived: boolean;
  archived_at: string | null;
  archive_reason: string | null;
  test_template_id: string | null;
  high_yield_topics: string[];
  updated_at: string;
  exams?: {
    id: string;
    title_en: string;
    title_ta: string;
  };
}

interface DashboardStats {
  totalPapers: number;
  totalQuestionsAcrossPapers: number;
  publishedPapers: number;
  draftPapers: number;
  incompletePapers: number;
}

export default function AdminPYQDashboardPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<PYQPaper[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPapers: 0,
    totalQuestionsAcrossPapers: 0,
    publishedPapers: 0,
    draftPapers: 0,
    incompletePapers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCompletion, setSelectedCompletion] = useState('all');

  // Dynamic Exam Options
  const [exams, setExams] = useState<any[]>([]);

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<PYQPaper | null>(null);

  // Fetch Exams
  useEffect(() => {
    async function loadExams() {
      try {
        const res = await fetch('/api/admin/exams');
        const data = await res.json();
        if (data.exams) setExams(data.exams);
      } catch (err) {
        console.error('Failed to load exams in dashboard:', err);
      }
    }
    loadExams();
  }, []);

  // Fetch Papers & Stats
  const fetchPapers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedExam !== 'all') params.set('exam', selectedExam);
      if (selectedYear !== 'all') params.set('year', selectedYear);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedCompletion !== 'all') params.set('completion', selectedCompletion);
      if (activeTab === 'archived') params.set('is_archived', 'true');

      const res = await fetch(`/api/admin/pyq?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setPapers(data.papers || []);
        if (data.stats) setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to load PYQ papers');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      showNotification('error', err.message || 'Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [activeTab, selectedExam, selectedYear, selectedStatus, selectedCompletion, searchQuery]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. Publish / Unpublish Action
  const handleTogglePublish = async (paper: PYQPaper) => {
    const isCurrentlyPublished = paper.status === 'published';
    const action = isCurrentlyPublished ? 'unpublish' : 'publish';

    if (
      !confirm(
        isCurrentlyPublished
          ? `Are you sure you want to unpublish "${paper.title_en}" from active student tests?`
          : `Publish "${paper.title_en}" as an active test for students?`
      )
    ) {
      return;
    }

    setActionLoadingId(paper.id);
    try {
      const res = await fetch(`/api/admin/pyq/${paper.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.errors?.[0] || 'Failed to update publishing status');
      }

      showNotification('success', data.message);
      fetchPapers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Archive / Restore Action
  const handleToggleArchive = async (paper: PYQPaper) => {
    const isArchived = paper.is_archived;
    const action = isArchived ? 'restore' : 'archive';

    let reason = '';
    if (!isArchived) {
      const promptReason = prompt('Enter reason for archiving this paper (optional):', 'Archived by Admin');
      if (promptReason === null) return;
      reason = promptReason;
    }

    setActionLoadingId(paper.id);
    try {
      const res = await fetch(`/api/admin/pyq/${paper.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update archive status');

      showNotification('success', data.message);
      fetchPapers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Delete Paper Action
  const handleDeletePaper = async (paper: PYQPaper) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete the paper record "${paper.title_en}"?\n\nNote: All original questions in the central Question Bank will remain safe and intact.`
      )
    ) {
      return;
    }

    setActionLoadingId(paper.id);
    try {
      const res = await fetch(`/api/admin/pyq/${paper.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete paper');
      }

      showNotification('success', data.message);
      fetchPapers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const availableYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <span>Module 17</span>
            <span>•</span>
            <span>Official Archives & Question Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-400" />
            <span>முந்தைய ஆண்டு வினாத்தாள்கள் (PYQ Archive Centre)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            அதிகாரப்பூர்வ TNPSC முந்தைய ஆண்டு வினாத்தாள்கள் மேலாண்மை, வினாக்கள் ஒதுக்கீடு மற்றும் தேர்வு தயாரிப்பு.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/tests"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>தேர்வு மேலாண்மை (Test Manager)</span>
          </Link>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>புதிய வினாத்தாள் சேர் (Add Paper)</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Database-Driven Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/70 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>மொத்த PYQ தாள்கள்</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white mt-1.5">{stats.totalPapers}</p>
          <span className="text-[10px] text-slate-500">செயலில் உள்ள தாள்கள்</span>
        </div>

        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/70 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>ஒதுக்கப்பட்ட வினாக்கள்</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-indigo-400 mt-1.5">
            {stats.totalQuestionsAcrossPapers}
          </p>
          <span className="text-[10px] text-slate-500">தாள்களில் உள்ள வினாக்கள்</span>
        </div>

        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/70 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>வெளியிடப்பட்டவை</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-1.5">{stats.publishedPapers}</p>
          <span className="text-[10px] text-emerald-500/80">மாணவர் தேர்வில் உள்ளது</span>
        </div>

        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/70 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>வரைவு / தயாரிப்பில்</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-amber-400 mt-1.5">{stats.draftPapers}</p>
          <span className="text-[10px] text-slate-500">தயாரிப்பு நிலையில்</span>
        </div>

        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/70 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>முழுமையடையாதவை</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-bold text-rose-400 mt-1.5">{stats.incompletePapers}</p>
          <span className="text-[10px] text-rose-500/80">கூடுதல் வினாக்கள் தேவை</span>
        </div>
      </div>

      {/* Navigation Tabs (Active vs Archived) & Filters */}
      <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 space-y-3.5 shadow-lg">
        {/* Tab Buttons */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <span>செயலில் உள்ள தாள்கள் (Active Papers)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950/60 text-indigo-200">
                {stats.totalPapers}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'archived'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>காப்பகம் (Archived)</span>
            </button>
          </div>

          <button
            onClick={() => fetchPapers()}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, exam, year, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Exam Filter */}
          <div>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">அனைத்து தேர்வுகள் (All Exams)</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title_en}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">அனைத்து ஆண்டுகள் (All Years)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Status & Completion Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">அனைத்து நிலை (All Status)</option>
              <option value="published">Published (வெளியிடப்பட்டது)</option>
              <option value="ready_to_publish">Ready to Publish</option>
              <option value="draft">Draft (வரைவு)</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Papers Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">முந்தைய வினாத்தாள்கள் பெறப்படுகின்றன...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-850 border border-slate-700 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">வினாத்தாள்கள் ஏதுமில்லை (No Papers Found)</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            தேடல் வரம்பிற்குட்பட்ட வினாத்தாள்கள் இல்லை. புதிய வினாத்தாளை உருவாக்க மேல் உள்ள பட்டனை அழுத்தவும்.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>புதிய வினாத்தாள் உருவாக்கு (Create Paper)</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {papers.map((paper) => {
            const assigned = paper.assigned_questions_count || 0;
            const expected = paper.expected_question_count || 200;
            const percentage = Math.min(100, Math.round((assigned / expected) * 100));
            const isComplete = assigned >= expected;

            return (
              <div
                key={paper.id}
                className="bg-slate-850 border border-slate-700/80 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-600 transition shadow-xl space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                        {paper.exams?.title_en || paper.exam_group || paper.exam_id}
                      </span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                        {paper.year}
                      </span>
                      {paper.paper_code && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                          {paper.paper_code}
                        </span>
                      )}
                    </div>

                    {/* Publishing Status Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        paper.is_archived
                          ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                          : paper.status === 'published'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : paper.status === 'ready_to_publish'
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {paper.is_archived ? (
                        <>
                          <Archive className="w-3 h-3" />
                          <span>Archived</span>
                        </>
                      ) : paper.status === 'published' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span className="capitalize">{paper.status.replace(/_/g, ' ')}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div>
                    <h3 className="font-bold text-white text-base font-tamil leading-snug">
                      {paper.title_ta}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{paper.title_en}</p>
                    {paper.date_held && (
                      <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                        தேர்வு நடைபெற்ற தேதி: {new Date(paper.date_held).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Completion Meter */}
                  <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        வினாக்கள் ஒதுக்கீடு:{' '}
                        <strong className={isComplete ? 'text-emerald-400' : 'text-amber-400'}>
                          {assigned} / {expected} Qs
                        </strong>
                      </span>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          isComplete
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {percentage}% {isComplete ? 'Complete' : `${expected - assigned} Missing`}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isComplete ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Paper Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Assigned Qs</span>
                      <strong className="text-amber-400 font-mono">{assigned} Qs</strong>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Duration</span>
                      <strong className="text-slate-200 font-mono">{paper.duration_minutes}m</strong>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Total Marks</span>
                      <strong className="text-emerald-400 font-mono">{paper.total_marks}m</strong>
                    </div>
                  </div>

                  {/* High Yield Topics */}
                  {Array.isArray(paper.high_yield_topics) && paper.high_yield_topics.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        High-Yield Focus Areas:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {paper.high_yield_topics.slice(0, 4).map((topic, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-tamil truncate max-w-[200px]"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5">
                    {/* Action 2: Edit Paper Details */}
                    <button
                      onClick={() => setEditingPaper(paper)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Edit Paper Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 3: Preview Paper */}
                    <Link
                      href={`/admin/pyq/${paper.id}?tab=preview`}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Preview Paper"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    {/* Action 4: Publish / Unpublish */}
                    <button
                      onClick={() => handleTogglePublish(paper)}
                      disabled={actionLoadingId === paper.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center space-x-1.5 ${
                        paper.status === 'published'
                          ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                          : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                      }`}
                      title={paper.status === 'published' ? 'Unpublish Paper' : 'Publish Paper'}
                    >
                      <Play className="w-3 h-3" />
                      <span>{paper.status === 'published' ? 'Published' : 'Publish'}</span>
                    </button>

                    {/* Action 5: Archive / Restore */}
                    <button
                      onClick={() => handleToggleArchive(paper)}
                      disabled={actionLoadingId === paper.id}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 transition cursor-pointer"
                      title={paper.is_archived ? 'Restore Paper' : 'Archive Paper'}
                    >
                      {paper.is_archived ? (
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Action 6: Delete Paper */}
                    <button
                      onClick={() => handleDeletePaper(paper)}
                      disabled={actionLoadingId === paper.id}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Action 1: Manage Paper (PRIMARY) */}
                  <Link
                    href={`/admin/pyq/${paper.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <span>வினாத்தாள் மேலாண்மை (Manage Paper)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreatePaperModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newPaper) => {
          showNotification('success', `Paper "${newPaper.title_en}" created successfully.`);
          fetchPapers();
          router.push(`/admin/pyq/${newPaper.id}`);
        }}
      />

      <EditPaperDetailsModal
        paper={editingPaper}
        isOpen={!!editingPaper}
        onClose={() => setEditingPaper(null)}
        onUpdated={(updated) => {
          showNotification('success', `Paper "${updated.title_en}" updated successfully.`);
          fetchPapers();
        }}
      />
    </div>
  );
}
