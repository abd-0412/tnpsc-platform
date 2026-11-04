'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Search,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  Edit2,
  Eye,
  RefreshCw,
  BookOpen,
  AlertCircle,
  Layers,
  Trash2,
  Check,
  RotateCcw,
  ShieldCheck,
  X,
  XCircle,
  History
} from 'lucide-react';
import { Question } from '@/lib/types/question';
import QuestionDetailsModal from '@/components/admin/QuestionDetailsModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import RestoreModal from '@/components/admin/RestoreModal';
import RejectionModal from '@/components/admin/RejectionModal';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab: 'active' | 'rejected' | 'archived' | 'deleted'
  const [activeTab, setActiveTab] = useState<'active' | 'rejected' | 'archived' | 'deleted'>('active');

  // Filters
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Tab Counts
  const [counts, setCounts] = useState({
    active: 0,
    archived: 0,
    deleted: 0,
    drafts: 0,
    under_revision: 0,
    published: 0,
    rejected: 0,
  });

  // Dynamic Subjects from Syllabus API
  const [subjects, setSubjects] = useState<Array<{ id: string; title_ta: string; title_en: string }>>([]);

  // Universal Selection State
  const [selectionMode, setSelectionMode] = useState<'page' | 'all_matching'>('page');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Effective selected count across all pages
  const effectiveSelectedCount =
    selectionMode === 'all_matching'
      ? Math.max(0, totalQuestions - deselectedIds.size)
      : selectedIds.size;

  // Modals state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleteIsPermanent, setDeleteIsPermanent] = useState(false);

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restoreTargetIds, setRestoreTargetIds] = useState<string[]>([]);

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionTargetIds, setRejectionTargetIds] = useState<string[]>([]);

  // 1. Fetch Subjects once
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch('/api/admin/syllabus?level=subject');
        const data = await res.json();
        if (data.nodes) {
          setSubjects(data.nodes);
        }
      } catch (err) {
        console.error('Failed to load subjects', err);
      }
    }
    loadSubjects();
  }, []);

  // 2. Fetch Questions
  const fetchQuestions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      params.set('tab', activeTab);
      if (search) params.set('q', search);
      if (subject) params.set('subject', subject);
      if (difficulty) params.set('difficulty', difficulty);
      if (kind) params.set('kind', kind);
      if (status && activeTab === 'active') params.set('status', status);
      params.set('page', page.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch questions');

      setQuestions(data.questions || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalQuestions(data.pagination?.total || 0);
      if (data.counts) {
        setCounts(data.counts);
      }
      if (selectionMode !== 'all_matching') {
        setSelectedIds(new Set());
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeTab, page, difficulty, kind, status, subject]);

  // Handle Search on Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    handleClearSelection();
    fetchQuestions();
  };

  const handleTabChange = (tab: 'active' | 'rejected' | 'archived' | 'deleted') => {
    setActiveTab(tab);
    setPage(1);
    handleClearSelection();
  };

  // Selection handlers
  const isQuestionSelected = (id: string) => {
    if (selectionMode === 'all_matching') {
      return !deselectedIds.has(id);
    }
    return selectedIds.has(id);
  };

  const handleToggleSelect = (id: string) => {
    if (selectionMode === 'all_matching') {
      const next = new Set(deselectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setDeselectedIds(next);
    } else {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectedIds(next);
    }
  };

  const handleSelectAllOnPage = () => {
    if (selectionMode === 'all_matching') {
      handleClearSelection();
    } else {
      const pageIds = questions.map((q) => q.id);
      const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
      if (allSelected) {
        const next = new Set(selectedIds);
        pageIds.forEach((id) => next.delete(id));
        setSelectedIds(next);
      } else {
        const next = new Set(selectedIds);
        pageIds.forEach((id) => next.add(id));
        setSelectedIds(next);
      }
    }
  };

  const handleSelectAllMatching = () => {
    setSelectionMode('all_matching');
    setDeselectedIds(new Set());
  };

  const handleClearSelection = () => {
    setSelectionMode('page');
    setSelectedIds(new Set());
    setDeselectedIds(new Set());
  };

  // Individual Actions
  const openDetails = (q: Question) => {
    setActiveQuestion(q);
    setDetailsModalOpen(true);
  };

  const handleIndividualArchive = async (id: string) => {
    if (!confirm('Are you sure you want to move this question to the Archive?')) return;
    try {
      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', questionIds: [id], reason: 'Archived by admin' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to archive question');
      setSuccessMsg('Question moved to Archive.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openDeleteModal = (ids: string[] = [], permanent = false) => {
    setDeleteTargetIds(ids);
    setDeleteIsPermanent(permanent);
    setDeleteModalOpen(true);
  };

  const openRestoreModal = (ids: string[] = []) => {
    setRestoreTargetIds(ids);
    setRestoreModalOpen(true);
  };

  const openRejectionModal = (ids: string[] = []) => {
    setRejectionTargetIds(ids);
    setRejectionModalOpen(true);
  };

  // Execute Deletion from Modal
  const executeDelete = async (reason: string, permanent: boolean) => {
    setIsBulkProcessing(true);
    try {
      const isExplicitSingle = deleteTargetIds.length > 0;
      const action = permanent ? 'permanent_delete' : 'soft_delete';
      const payload: any = {
        action,
        reason,
        selectAllMatching: !isExplicitSingle && selectionMode === 'all_matching',
        filters: !isExplicitSingle && selectionMode === 'all_matching' ? {
          tab: activeTab,
          q: search,
          subject,
          difficulty,
          kind,
          status: activeTab === 'active' ? status : undefined,
        } : undefined,
        excludedIds: !isExplicitSingle && selectionMode === 'all_matching' ? Array.from(deselectedIds) : undefined,
        questionIds: isExplicitSingle ? deleteTargetIds : (selectionMode === 'page' ? Array.from(selectedIds) : undefined),
      };

      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete question(s)');

      setDeleteModalOpen(false);
      setDeleteTargetIds([]);
      handleClearSelection();
      setSuccessMsg(data.message || 'Deletion completed.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Execute Restore from Modal
  const executeRestore = async (targetStatus: 'draft' | 'published', reason: string) => {
    setIsBulkProcessing(true);
    try {
      const isExplicitSingle = restoreTargetIds.length > 0;
      const isRestoringFromTrash = activeTab === 'deleted';
      const action = isRestoringFromTrash ? 'restore_deleted' : 'restore';
      const payload: any = {
        action,
        targetStatus,
        reason,
        selectAllMatching: !isExplicitSingle && selectionMode === 'all_matching',
        filters: !isExplicitSingle && selectionMode === 'all_matching' ? {
          tab: activeTab,
          q: search,
          subject,
          difficulty,
          kind,
          status: activeTab === 'active' ? status : undefined,
        } : undefined,
        excludedIds: !isExplicitSingle && selectionMode === 'all_matching' ? Array.from(deselectedIds) : undefined,
        questionIds: isExplicitSingle ? restoreTargetIds : (selectionMode === 'page' ? Array.from(selectedIds) : undefined),
      };

      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restore question(s)');

      setRestoreModalOpen(false);
      setRestoreTargetIds([]);
      handleClearSelection();
      setSuccessMsg(data.message || 'Restored successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Archive
  const handleBulkArchive = async () => {
    if (!confirm(`Are you sure you want to archive ${effectiveSelectedCount} selected question(s)?`)) return;
    setIsBulkProcessing(true);
    try {
      const payload: any = {
        action: 'archive',
        reason: 'Bulk archived by admin',
        selectAllMatching: selectionMode === 'all_matching',
        filters: selectionMode === 'all_matching' ? {
          tab: activeTab,
          q: search,
          subject,
          difficulty,
          kind,
          status: activeTab === 'active' ? status : undefined,
        } : undefined,
        excludedIds: selectionMode === 'all_matching' ? Array.from(deselectedIds) : undefined,
        questionIds: selectionMode === 'page' ? Array.from(selectedIds) : undefined,
      };

      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk archive failed');
      handleClearSelection();
      setSuccessMsg(data.message || 'Questions archived.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Execute Rejection from Modal
  const executeRejection = async (reason: string) => {
    setIsBulkProcessing(true);
    try {
      const isExplicitSingle = rejectionTargetIds.length > 0;
      const payload: any = {
        action: 'bulk_reject',
        reason,
        selectAllMatching: !isExplicitSingle && selectionMode === 'all_matching',
        filters: !isExplicitSingle && selectionMode === 'all_matching' ? {
          tab: activeTab,
          q: search,
          subject,
          difficulty,
          kind,
          status: activeTab === 'active' ? status : undefined,
        } : undefined,
        excludedIds: !isExplicitSingle && selectionMode === 'all_matching' ? Array.from(deselectedIds) : undefined,
        questionIds: isExplicitSingle ? rejectionTargetIds : (selectionMode === 'page' ? Array.from(selectedIds) : undefined),
      };

      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk rejection failed');
      setRejectionModalOpen(false);
      setRejectionTargetIds([]);
      handleClearSelection();
      setSuccessMsg(data.message || 'Questions marked as rejected.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Resubmit to Draft
  const executeResubmitToDraft = async (ids?: string[]) => {
    const isExplicit = ids && ids.length > 0;
    const count = isExplicit ? ids.length : effectiveSelectedCount;
    if (!confirm(`Are you sure you want to resubmit ${count} question(s) to Draft / Pending Review?`)) return;
    setIsBulkProcessing(true);
    try {
      const payload: any = {
        action: 'bulk_resubmit',
        selectAllMatching: !isExplicit && selectionMode === 'all_matching',
        filters: (!isExplicit && selectionMode === 'all_matching') ? {
          tab: activeTab,
          q: search,
          subject,
          difficulty,
          kind,
        } : undefined,
        excludedIds: (!isExplicit && selectionMode === 'all_matching') ? Array.from(deselectedIds) : undefined,
        questionIds: isExplicit ? ids : (selectionMode === 'page' ? Array.from(selectedIds) : undefined),
      };

      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Resubmit failed');
      handleClearSelection();
      setSuccessMsg(data.message || 'Questions resubmitted to Draft.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Move to Revision
  const executeMoveToRevision = async (ids?: string[]) => {
    const isExplicit = ids && ids.length > 0;
    const count = isExplicit ? ids.length : effectiveSelectedCount;
    const note = prompt('Enter revision instructions or comments for these questions:');
    if (note === null) return;
    setIsBulkProcessing(true);
    try {
      const payload: any = {
        action: 'bulk_revision',
        reason: note || 'Moved to revision by admin',
        selectAllMatching: !isExplicit && selectionMode === 'all_matching',
        filters: (!isExplicit && selectionMode === 'all_matching') ? {
          tab: activeTab,
          q: search,
          subject,
          difficulty,
          kind,
        } : undefined,
        excludedIds: (!isExplicit && selectionMode === 'all_matching') ? Array.from(deselectedIds) : undefined,
        questionIds: isExplicit ? ids : (selectionMode === 'page' ? Array.from(selectedIds) : undefined),
      };

      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Move to revision failed');
      handleClearSelection();
      setSuccessMsg(data.message || 'Questions moved to Revision.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Database className="w-6 h-6 text-amber-400" />
            <span>மத்திய வினா வங்கி (Central Question Bank)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            இருமொழி வினாக்கள், வகைகள், பாடப்பிரிவு மற்றும் முழுமையான சரிபார்ப்பு சுழற்சி (Module 01 - 03).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/import"
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
          >
            <span>JSON / JSONL பதிவேற்றம்</span>
          </Link>
          <Link
            href="/admin/questions/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>புதிய வினா சேர் (Add Question)</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Section Tabs: Active vs Rejected vs Archived vs Trash */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => handleTabChange('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>செயலில் உள்ளவை (Active)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-amber-400 font-mono">
              {counts.active}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>நிராகரிக்கப்பட்டவை (Rejected)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-rose-400 font-mono">
              {counts.rejected}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('archived')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Archive className="w-4 h-4 text-purple-400" />
            <span>காப்பகம் (Archived)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-purple-400 font-mono">
              {counts.archived}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('deleted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'deleted'
                ? 'bg-red-500/15 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>குப்பை (Trash & Deleted)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-red-400 font-mono">
              {counts.deleted}
            </span>
          </button>
        </div>

        <button
          onClick={fetchQuestions}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          title="Refresh Questions"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search question in தமிழ் or English, ID, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>தேடு (Search)</span>
          </button>
        </form>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          {/* Subject Filter */}
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">அனைத்து பாடங்கள் (All Subjects)</option>
            {subjects.length > 0 ? (
              subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.title_ta} ({sub.title_en})
                </option>
              ))
            ) : (
              <>
                <option value="general_tamil">பொதுத் தமிழ் (General Tamil)</option>
                <option value="sub-polity">இந்திய ஆட்சியியல் (Polity)</option>
                <option value="sub-history">வரலாறு (History & Culture)</option>
                <option value="sub-aptitude">திறனறிவு (Aptitude & Mental)</option>
              </>
            )}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">கடினத்தன்மை (All Difficulties)</option>
            <option value="easy">எளிது (Easy)</option>
            <option value="medium">நடுத்தரம் (Medium)</option>
            <option value="hard">கடினம் (Hard)</option>
          </select>

          {/* Question Kind Filter */}
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">வினா வகை (All Kinds)</option>
            <option value="direct_mcq">நேரடி வினா (Direct MCQ)</option>
            <option value="statement_analysis">கூற்று ஆய்வு (Statement Analysis)</option>
            <option value="assertion_reason">கூற்று & காரணம் (Assertion Reason)</option>
            <option value="match_the_following">பொருத்துக (Match the Following)</option>
            <option value="arrange_in_order">வரிசைப்படுத்துக (Arrange in Order)</option>
          </select>

          {/* Status Filter (Only active tab) */}
          {activeTab === 'active' ? (
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">சரிபார்ப்பு நிலை (All Active)</option>
              <option value="draft">வரைவு (Draft / Pending Review)</option>
              <option value="under_revision">திருத்தத்தில் (Under Revision)</option>
              <option value="published">வெளியிடப்பட்டது (Published / Active)</option>
            </select>
          ) : (
            <div className="flex items-center px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-400 text-xs">
              <span>View Mode: <strong className="text-amber-400 uppercase">{activeTab}</strong></span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {effectiveSelectedCount > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-850 border border-amber-500/40 shadow-xl flex items-center justify-between flex-wrap gap-3 sticky top-4 z-20">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-3 py-1 rounded-lg border border-amber-500/30 font-mono">
              {effectiveSelectedCount} {selectionMode === 'all_matching' ? 'Matching' : ''} Selected
            </span>
            <button
              onClick={handleClearSelection}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {activeTab === 'active' && (
              <>
                <button
                  onClick={handleBulkArchive}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-purple-400" />
                  <span>Bulk Archive</span>
                </button>
                <button
                  onClick={() => openRejectionModal([])}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Bulk Reject</span>
                </button>
                <button
                  onClick={() => openDeleteModal([], false)}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-red-950/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Delete</span>
                </button>
              </>
            )}

            {activeTab === 'rejected' && (
              <>
                <button
                  onClick={() => executeResubmitToDraft()}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resubmit to Draft</span>
                </button>
                <button
                  onClick={() => executeMoveToRevision()}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Move to Revision</span>
                </button>
                <button
                  onClick={() => openDeleteModal([], false)}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Delete</span>
                </button>
              </>
            )}

            {activeTab === 'archived' && (
              <>
                <button
                  onClick={() => openRestoreModal([])}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Bulk Restore</span>
                </button>
                <button
                  onClick={() => openDeleteModal([], false)}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Delete</span>
                </button>
              </>
            )}

            {activeTab === 'deleted' && (
              <>
                <button
                  onClick={() => openRestoreModal([])}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore from Trash</span>
                </button>
                <button
                  onClick={() => openDeleteModal([], true)}
                  disabled={isBulkProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanently Purge</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Universal Selection Banner */}
      {selectionMode === 'all_matching' ? (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              தற்போதைய வடிகட்டலில் உள்ள அனைத்து <strong>{effectiveSelectedCount}</strong> வினாக்களும் தேர்ந்தெடுக்கப்பட்டுள்ளன (All {effectiveSelectedCount} matching questions selected across all pages).
            </span>
          </div>
          <button
            onClick={handleClearSelection}
            className="font-bold underline text-amber-400 hover:text-amber-300 ml-3 shrink-0 cursor-pointer"
          >
            தேர்வை நீக்கு (Clear selection)
          </button>
        </div>
      ) : (
        questions.length > 0 &&
        questions.every((q) => selectedIds.has(q.id)) &&
        totalQuestions > questions.length && (
          <div className="p-3.5 rounded-2xl bg-slate-800 border border-indigo-500/40 flex items-center justify-between text-xs text-slate-200 shadow-sm">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                இப்பக்கத்தின் <strong>{questions.length}</strong> வினாக்கள் தேர்ந்தெடுக்கப்பட்டுள்ளன.
              </span>
            </div>
            <button
              onClick={handleSelectAllMatching}
              className="font-bold text-amber-400 hover:text-amber-300 underline ml-3 shrink-0 cursor-pointer"
            >
              அனைத்துப் பக்கங்களிலுள்ள {totalQuestions} வினாக்களையும் தேர்ந்தெடு (Select all {totalQuestions} matching questions across all pages)
            </button>
          </div>
        )
      )}

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="select-all-q"
              checked={
                selectionMode === 'all_matching'
                  ? totalQuestions > 0 && deselectedIds.size === 0
                  : questions.length > 0 && questions.every((q) => selectedIds.has(q.id))
              }
              onChange={handleSelectAllOnPage}
              className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="select-all-q" className="cursor-pointer">
              Select all on page ({questions.length})
            </label>
          </div>
          <span>
            Showing {questions.length} of {totalQuestions} questions
            {effectiveSelectedCount > 0 && ` (${effectiveSelectedCount} selected)`}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs bg-slate-800/40 rounded-3xl border border-slate-700/60">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
            <span>வினாக்கள் ஏற்றப்படுகின்றன... (Loading questions...)</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs bg-slate-800/40 rounded-3xl border border-slate-700/60 space-y-3">
            <p>வினாக்கள் எதுவும் கிடைக்கவில்லை. (No questions found with current filters).</p>
            {activeTab === 'active' && (
              <Link
                href="/admin/questions/new"
                className="inline-flex items-center space-x-2 text-amber-400 hover:underline font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>முதல் வினாவை உருவாக்கவும் (Create your first question)</span>
              </Link>
            )}
          </div>
        ) : (
          questions.map((q) => {
            const isSelected = isQuestionSelected(q.id);
            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl bg-slate-800/70 border transition-all space-y-3.5 ${
                  isSelected
                    ? 'border-amber-400/80 bg-slate-800/95 ring-1 ring-amber-400/50'
                    : 'border-slate-700/70 hover:border-slate-600'
                }`}
              >
                {/* Top Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(q.id)}
                      className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 cursor-pointer mr-1"
                    />
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
                      {q.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium uppercase">
                      {q.kind.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-medium ${
                        q.difficulty === 'easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : q.difficulty === 'hard'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {q.difficulty.toUpperCase()}
                    </span>
                    {q.syllabus?.lesson_id && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                        Lesson: {q.syllabus.lesson_id}
                      </span>
                    )}
                    {q.previous_year?.is_pyq && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                        PYQ: {q.previous_year.exam_name || q.previous_year.year}
                      </span>
                    )}
                  </div>

                  {/* Status & Tab Badges */}
                  <div className="flex items-center space-x-2">
                    {q.is_archived && (
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-purple-400 bg-purple-500/15 border border-purple-500/30 flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        <span>ARCHIVED</span>
                      </span>
                    )}
                    {q.deleted_at && (
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-red-400 bg-red-500/15 border border-red-500/30 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        <span>DELETED</span>
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold ${
                        q.workflow?.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : q.workflow?.status === 'under_revision' || q.workflow?.status === 'under_review'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : q.workflow?.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {q.workflow?.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Question Texts Snippet */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Tamil Question */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      தமிழ் வினா (Tamil)
                    </span>
                    <p className="text-slate-100 font-medium leading-relaxed break-words font-tamil">
                      {q.texts?.ta?.question}
                    </p>
                  </div>

                  {/* English Question */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      English Question
                    </span>
                    <p className="text-slate-100 font-medium leading-relaxed break-words">
                      {q.texts?.en?.question || <em className="text-slate-500">No English translation yet</em>}
                    </p>
                  </div>
                </div>

                {/* Rejection reason banner */}
                {(q.workflow?.status === 'rejected' || q.workflow?.rejection_reason) && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>
                        நிராகரிப்பு காரணம் (Rejection Reason):{' '}
                        <strong className="text-white">{q.workflow?.rejection_reason || 'Reason not recorded'}</strong>
                      </span>
                    </span>
                    {q.workflow?.history?.find((h: any) => h.to_status === 'rejected')?.timestamp && (
                      <span className="text-[10px] text-rose-400 font-mono">
                        {new Date(q.workflow.history.find((h: any) => h.to_status === 'rejected').timestamp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Archive / Deletion reason banners */}
                {q.archive_reason && (
                  <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Archive className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Archive reason: {q.archive_reason}</span>
                    </span>
                    {q.archived_at && (
                      <span className="text-[10px] text-purple-400 font-mono">
                        {new Date(q.archived_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {q.deletion_reason && (
                  <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Deletion reason: {q.deletion_reason}</span>
                    </span>
                    {q.deleted_at && (
                      <span className="text-[10px] text-red-400 font-mono">
                        {new Date(q.deleted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Marks: {q.question_settings?.marks} | Neg: {q.question_settings?.negative_marks}
                  </span>

                  <div className="flex items-center space-x-2">
                    {/* View Details / Trace History */}
                    <button
                      onClick={() => openDetails(q)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="View Details & History"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>விவரங்கள் (Details)</span>
                    </button>

                    {/* Active View Actions */}
                    {activeTab === 'active' && (
                      <>
                        <Link
                          href={`/admin/questions/${q.id}/edit`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>திருத்து (Edit)</span>
                        </Link>

                        <button
                          onClick={() => handleIndividualArchive(q.id)}
                          className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                          title="Archive Question"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openDeleteModal([q.id], false)}
                          className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Rejected View Actions */}
                    {activeTab === 'rejected' && (
                      <>
                        <button
                          onClick={() => executeResubmitToDraft([q.id])}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer"
                          title="Resubmit to Draft"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>வரைவாக்கு (Draft)</span>
                        </button>
                        <button
                          onClick={() => executeMoveToRevision([q.id])}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition cursor-pointer"
                          title="Move to Revision"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>திருத்தம் (Revision)</span>
                        </button>
                        <Link
                          href={`/admin/questions/${q.id}/edit`}
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal([q.id], false)}
                          className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Archived View Actions */}
                    {activeTab === 'archived' && (
                      <>
                        <button
                          onClick={() => openRestoreModal([q.id])}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>மீட்டெடு (Restore)</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal([q.id], false)}
                          className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Deleted View Actions */}
                    {activeTab === 'deleted' && (
                      <>
                        <button
                          onClick={() => openRestoreModal([q.id])}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal([q.id], true)}
                          className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition cursor-pointer"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-700 cursor-pointer"
            >
              முந்தைய பக்கம் (Prev)
            </button>
            <span className="text-xs text-slate-400 px-3 font-medium">
              பக்கம் {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-700 cursor-pointer"
            >
              அடுத்த பக்கம் (Next)
            </button>
          </div>
        )}
      </div>

      {/* Details & Traceable History Modal */}
      <QuestionDetailsModal
        question={activeQuestion}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Safe Deletion / Permanent Purge Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        selectedCount={deleteTargetIds.length > 0 ? deleteTargetIds.length : effectiveSelectedCount}
        questionIds={deleteTargetIds}
        isPermanent={deleteIsPermanent}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={executeDelete}
        isLoading={isBulkProcessing}
      />

      {/* Restore Modal */}
      <RestoreModal
        isOpen={restoreModalOpen}
        selectedCount={restoreTargetIds.length > 0 ? restoreTargetIds.length : effectiveSelectedCount}
        onClose={() => setRestoreModalOpen(false)}
        onConfirm={executeRestore}
        isLoading={isBulkProcessing}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModalOpen}
        questionCount={rejectionTargetIds.length > 0 ? rejectionTargetIds.length : effectiveSelectedCount}
        onClose={() => setRejectionModalOpen(false)}
        onConfirm={executeRejection}
        isLoading={isBulkProcessing}
      />
    </div>
  );
}
