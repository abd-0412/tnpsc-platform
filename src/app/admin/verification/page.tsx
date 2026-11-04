'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Layers,
  Sparkles,
  Archive,
  RotateCcw,
  Clock,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import { Question } from '@/lib/types/question';
import QuestionDetailsModal from '@/components/admin/QuestionDetailsModal';
import RejectionModal from '@/components/admin/RejectionModal';

export default function VerificationCentrePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('draft');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Tab Badge Counts
  const [counts, setCounts] = useState({
    draft: 0,
    under_revision: 0,
    published: 0,
    rejected: 0,
  });

  // Action status / Notifications
  const [actionInProgress, setActionInProgress] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionTargetIds, setRejectionTargetIds] = useState<string[]>([]);

  // Revision comment modal state
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionTargetIds, setRevisionTargetIds] = useState<string[]>([]);
  const [revisionNote, setRevisionNote] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/questions/verification?status=${activeStatus}&page=${page}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalQuestions(data.pagination?.total || 0);
        if (data.counts) {
          setCounts(data.counts);
        }
        setSelectedIds(new Set());
      } else {
        setErrorMsg(data.error || 'Failed to load questions');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeStatus, page]);

  // Multi-select handlers
  const handleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Perform workflow action via verification API
  const performAction = async (
    ids: string[],
    action: string,
    comment?: string
  ) => {
    setActionInProgress(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/questions/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIds: ids,
          action,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update questions');
      }

      setSuccessMsg(data.message || 'Action executed successfully.');
      setTimeout(() => setSuccessMsg(''), 4500);
      await fetchQuestions();
    } catch (err: any) {
      setErrorMsg(err.message || 'Action failed');
    } finally {
      setActionInProgress(false);
    }
  };

  // Open Rejection Modal
  const openRejectionModal = (ids: string[]) => {
    setRejectionTargetIds(ids);
    setRejectionModalOpen(true);
  };

  const executeRejection = async (reason: string) => {
    setActionInProgress(true);
    try {
      await performAction(rejectionTargetIds, 'reject', reason);
      setRejectionModalOpen(false);
    } finally {
      setActionInProgress(false);
    }
  };

  // Open Revision Modal
  const openRevisionModal = (ids: string[]) => {
    setRevisionTargetIds(ids);
    setRevisionNote('');
    setRevisionModalOpen(true);
  };

  const executeRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionInProgress(true);
    try {
      await performAction(revisionTargetIds, 'request_correction', revisionNote);
      setRevisionModalOpen(false);
    } finally {
      setActionInProgress(false);
    }
  };

  // Details Modal
  const openDetails = (q: Question) => {
    setActiveQuestion(q);
    setDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <span>Module 05 & 06</span>
            <span>•</span>
            <span>Quality Assurance & Verification Workflow</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>சரிபார்ப்பு மையம் (Verification Centre)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            இருமொழி வினாக்களின் துல்லியம், விடைக்குறிப்பு, மற்றும் பாடநூல் ஆதாரங்களை சரிபார்த்து வெளியிடவும்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/import"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <span>பதிவேற்ற மையம் (Bulk Import)</span>
          </Link>
          <button
            onClick={fetchQuestions}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
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

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Workflow Status Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-800/60 p-2 rounded-2xl border border-slate-700/80">
        <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1">
          {[
            { id: 'draft', labelEn: 'Drafts (Pending Review)', labelTa: 'வரைவுகள் (நிலுவை)', count: counts.draft, color: 'text-amber-400', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
            { id: 'under_revision', labelEn: 'Under Revision', labelTa: 'திருத்தத்தில் உள்ளது', count: counts.under_revision, color: 'text-blue-400', badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
            { id: 'published', labelEn: 'Published (Active)', labelTa: 'வெளியிடப்பட்டது', count: counts.published, color: 'text-emerald-400', badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
            { id: 'rejected', labelEn: 'Rejected', labelTa: 'நிராகரிக்கப்பட்டது', count: counts.rejected, color: 'text-rose-400', badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveStatus(tab.id);
                setPage(1);
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                activeStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-md border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <span className={activeStatus === tab.id ? tab.color : ''}>{tab.labelEn}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${tab.badgeColor}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Floating Toolbar */}
      {selectedIds.size > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-850 border border-emerald-500/40 shadow-xl flex items-center justify-between flex-wrap gap-3 sticky top-4 z-20">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-lg border border-emerald-500/30 font-mono">
              {selectedIds.size} Selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {/* Drafts Tab Bulk Actions */}
            {activeStatus === 'draft' && (
              <>
                <button
                  onClick={() => performAction(Array.from(selectedIds), 'approve')}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Publish Selected</span>
                </button>
                <button
                  onClick={() => openRevisionModal(Array.from(selectedIds))}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Move to Revision</span>
                </button>
                <button
                  onClick={() => openRejectionModal(Array.from(selectedIds))}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reject Selected</span>
                </button>
                <button
                  onClick={() => performAction(Array.from(selectedIds), 'archive')}
                  disabled={actionInProgress}
                  className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Under Revision Tab Bulk Actions */}
            {(activeStatus === 'under_revision' || activeStatus === 'under_review') && (
              <>
                <button
                  onClick={() => performAction(Array.from(selectedIds), 'approve')}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Publish Selected</span>
                </button>
                <button
                  onClick={() => performAction(Array.from(selectedIds), 'resubmit')}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resubmit to Draft</span>
                </button>
                <button
                  onClick={() => openRejectionModal(Array.from(selectedIds))}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reject Selected</span>
                </button>
              </>
            )}

            {/* Published Tab Bulk Actions */}
            {activeStatus === 'published' && (
              <>
                <button
                  onClick={() => openRevisionModal(Array.from(selectedIds))}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Move to Revision</span>
                </button>
                <button
                  onClick={() => performAction(Array.from(selectedIds), 'archive')}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Archive className="w-3.5 h-3.5 text-purple-400" />
                  <span>Bulk Archive</span>
                </button>
              </>
            )}

            {/* Rejected Tab Bulk Actions */}
            {activeStatus === 'rejected' && (
              <>
                <button
                  onClick={() => performAction(Array.from(selectedIds), 'resubmit')}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resubmit to Draft</span>
                </button>
                <button
                  onClick={() => openRevisionModal(Array.from(selectedIds))}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Move to Revision</span>
                </button>
                <button
                  onClick={() => performAction(Array.from(selectedIds), 'archive')}
                  disabled={actionInProgress}
                  className="px-3.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Archive className="w-3.5 h-3.5 text-purple-400" />
                  <span>Bulk Archive</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Question Cards List */}
      {loading ? (
        <div className="text-center py-20 bg-slate-800/40 rounded-3xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">சரிபார்ப்பு வினாக்கள் ஏற்றப்படுகின்றன... (Loading records...)</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/40 rounded-3xl border border-slate-800 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-semibold text-slate-300">
            No questions in "{activeStatus.replace(/_/g, ' ')}" status
          </h3>
          <p className="text-xs text-slate-500">
            All records for this verification stage have been processed or none have been assigned yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedIds.size === questions.length && questions.length > 0}
                onChange={handleSelectAll}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="select-all" className="cursor-pointer">
                Select all on this page ({questions.length})
              </label>
            </div>
            <span>Showing {questions.length} of {totalQuestions} items</span>
          </div>

          {questions.map((q) => {
            const isSelected = selectedIds.has(q.id);
            return (
              <div
                key={q.id}
                className={`bg-slate-800/70 border rounded-2xl p-5 transition space-y-4 ${
                  isSelected
                    ? 'border-amber-400/80 bg-slate-800/95 ring-1 ring-amber-400/50'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-700/60 pb-3">
                  <div className="flex items-start space-x-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(q.id)}
                      className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 mt-1 shrink-0 cursor-pointer"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {q.id}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 uppercase">
                          {q.kind.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            q.difficulty === 'easy'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : q.difficulty === 'medium'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        {q.syllabus?.lesson_id && (
                          <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            Lesson: {q.syllabus.lesson_id}
                          </span>
                        )}
                      </div>

                      {/* Source Citation */}
                      {q.source && (q.source.book || q.source.standard) && (
                        <div className="flex items-center space-x-2 text-xs text-indigo-300 break-words">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span className="break-words">
                            {q.source.book || `Std ${q.source.standard}`}
                            {q.source.term ? ` (Term ${q.source.term})` : ''}
                            {q.source.chapter ? ` • ${q.source.chapter}` : ''}
                            {q.source.page_number ? ` • Page ${q.source.page_number}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this question */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0 flex-wrap gap-y-1">
                    {/* View Details / Trace Timeline */}
                    <button
                      onClick={() => openDetails(q)}
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="View Details & Trace History"
                    >
                      <Eye className="w-4 h-4 text-slate-300" />
                    </button>

                    <Link
                      href={`/admin/questions/${q.id}/edit`}
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Question"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Stage Specific Action Buttons */}
                    {q.workflow?.status !== 'published' && (
                      <button
                        onClick={() => performAction([q.id], 'approve')}
                        disabled={actionInProgress}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    )}

                    <button
                      onClick={() => openRevisionModal([q.id])}
                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium rounded-lg transition cursor-pointer"
                    >
                      Revision
                    </button>

                    {q.workflow?.status !== 'rejected' && (
                      <button
                        onClick={() => openRejectionModal([q.id])}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}

                    {q.workflow?.status === 'rejected' && (
                      <button
                        onClick={() => performAction([q.id], 'resubmit')}
                        className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-medium rounded-lg transition cursor-pointer"
                      >
                        Resubmit
                      </button>
                    )}

                    <button
                      onClick={() => performAction([q.id], 'archive')}
                      className="p-1 rounded-lg text-purple-400 hover:bg-purple-500/20 transition cursor-pointer"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rejection reason banner if rejected */}
                {q.workflow?.rejection_reason && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-400 block">Rejection Reason:</strong>
                      <span className="font-tamil">{q.workflow.rejection_reason}</span>
                    </div>
                  </div>
                )}

                {/* Question Texts (Bilingual Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tamil Column */}
                  <div className="space-y-3 bg-slate-900/60 p-3.5 sm:p-4 rounded-xl border border-slate-700/50 min-w-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span>தமிழ் வினா (Tamil)</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Primary</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed font-tamil break-words">
                      {q.texts?.ta?.question}
                    </p>

                    {q.texts?.ta?.options && q.texts.ta.options.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {q.texts.ta.options.map((opt) => {
                          const isCorrect = q.answer?.correct_option_id === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-lg text-xs flex items-start space-x-2 border min-w-0 ${
                                isCorrect
                                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold'
                                  : 'bg-slate-800/50 border-slate-700 text-slate-300'
                              }`}
                            >
                              <span className="font-mono text-slate-400 shrink-0">{opt.id.toUpperCase()}:</span>
                              <span className="font-tamil break-words flex-1 min-w-0">{opt.text}</span>
                              {isCorrect && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.texts?.ta?.explanation && (
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                        <strong className="text-amber-400 block mb-0.5">விளக்கம்:</strong>
                        <p className="font-tamil break-words">{q.texts.ta.explanation}</p>
                      </div>
                    )}
                  </div>

                  {/* English Column */}
                  <div className="space-y-3 bg-slate-900/60 p-3.5 sm:p-4 rounded-xl border border-slate-700/50 min-w-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                      <span>English Question</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Secondary</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed break-words">
                      {q.texts?.en?.question || <em className="text-slate-500">No English translation yet</em>}
                    </p>

                    {q.texts?.en?.options && q.texts.en.options.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {q.texts.en.options.map((opt) => {
                          const isCorrect = q.answer?.correct_option_id === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-lg text-xs flex items-start space-x-2 border min-w-0 ${
                                isCorrect
                                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold'
                                  : 'bg-slate-800/50 border-slate-700 text-slate-300'
                              }`}
                            >
                              <span className="font-mono text-slate-400 shrink-0">{opt.id.toUpperCase()}:</span>
                              <span className="break-words flex-1 min-w-0">{opt.text}</span>
                              {isCorrect && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.texts?.en?.explanation && (
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                        <strong className="text-cyan-400 block mb-0.5">Explanation:</strong>
                        <p className="break-words">{q.texts.en.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-700 cursor-pointer"
              >
                Prev
              </button>
              <span className="text-xs text-slate-400 px-3">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-700 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <QuestionDetailsModal
        question={activeQuestion}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Rejection Modal with Mandatory Reasons */}
      <RejectionModal
        isOpen={rejectionModalOpen}
        selectedCount={rejectionTargetIds.length}
        onClose={() => setRejectionModalOpen(false)}
        onConfirm={executeRejection}
        isLoading={actionInProgress}
      />

      {/* Revision Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Move to Under Revision ({revisionTargetIds.length} Qs)</span>
              </h3>
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={executeRevision} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Revision Instructions / Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="e.g. Check spelling of poet name in Option B..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-tamil"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  {actionInProgress ? 'Moving...' : 'Move to Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
