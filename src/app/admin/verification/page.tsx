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
  Sparkles
} from 'lucide-react';

interface Question {
  id: string;
  kind: string;
  level: string;
  difficulty: string;
  texts: {
    ta: {
      question: string;
      options: Array<{ id: string; text: string }>;
      explanation?: string;
    };
    en?: {
      question: string;
      options: Array<{ id: string; text: string }>;
      explanation?: string;
    };
  };
  answer: {
    correct_option_id?: string;
    acceptable_answers?: string[];
  };
  syllabus?: {
    class_id?: string;
    subject_id?: string;
    term_id?: string;
    unit_id?: string;
    lesson_id?: string;
  };
  source?: {
    book?: string;
    standard?: string;
    term?: string;
    page?: number;
  };
  tags: string[];
  workflow: {
    status: 'draft' | 'under_review' | 'published' | 'rejected';
    verified_by?: string;
    verified_at?: string;
    verification_comments?: Array<{
      author: string;
      comment: string;
      action: string;
      timestamp: string;
    }>;
  };
  created_at: string;
}

export default function VerificationCentrePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('draft');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Review Comment Modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [targetQuestionId, setTargetQuestionId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<'request_correction' | 'reject'>('request_correction');
  const [reviewComment, setReviewComment] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/verification?status=${activeStatus}&page=${page}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalQuestions(data.pagination?.total || 0);
        setSelectedIds(new Set());
      } else {
        alert(data.error || 'Failed to load questions');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeStatus, page]);

  const handleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const performAction = async (ids: string[], action: 'approve' | 'request_correction' | 'reject', comment?: string) => {
    setActionInProgress(true);
    try {
      const res = await fetch('/api/admin/questions/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIds: ids,
          action,
          comment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update questions');
      }

      setCommentModalOpen(false);
      setReviewComment('');
      setTargetQuestionId(null);
      await fetchQuestions();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionInProgress(false);
    }
  };

  const openCommentModal = (id: string, action: 'request_correction' | 'reject') => {
    setTargetQuestionId(id);
    setModalAction(action);
    setReviewComment('');
    setCommentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <span>Module 09</span>
            <span>•</span>
            <span>Quality Assurance & Publishing</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            Question Verification Centre
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review bilingual accuracy, answer keys, and Samacheer Kalvi textbook sources before publishing into live test papers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/import"
            className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <span>Bulk Import</span>
          </Link>
          <button
            onClick={fetchQuestions}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Workflow Status Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-800/60 p-2 rounded-xl border border-slate-700/80">
        <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1">
          {[
            { id: 'draft', label: 'Drafts (Pending Review)', color: 'text-amber-400' },
            { id: 'under_review', label: 'Under Revision', color: 'text-blue-400' },
            { id: 'published', label: 'Published (Active)', color: 'text-emerald-400' },
            { id: 'rejected', label: 'Rejected', color: 'text-rose-400' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveStatus(tab.id);
                setPage(1);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                activeStatus === tab.id
                  ? 'bg-slate-900 text-white shadow border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className={activeStatus === tab.id ? tab.color : ''}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Batch Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center space-x-3 bg-slate-900/90 px-3 sm:px-4 py-1.5 rounded-lg border border-emerald-500/30">
            <span className="text-xs text-emerald-400 font-semibold">
              {selectedIds.size} Selected
            </span>
            <button
              onClick={() => performAction(Array.from(selectedIds), 'approve')}
              disabled={actionInProgress}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow transition flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Publish Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Question Cards List */}
      {loading ? (
        <div className="text-center py-20 bg-slate-800/40 rounded-xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading verification records...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/40 rounded-xl border border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-300">
            No questions in "{activeStatus}" status
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            All questions for this filter have been processed or none have been submitted yet.
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
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
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
                className={`bg-slate-800/70 border rounded-xl p-5 transition ${
                  isSelected
                    ? 'border-amber-400/80 bg-slate-800/95 ring-1 ring-amber-400/50'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-700/60 pb-3 mb-4">
                  <div className="flex items-start space-x-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(q.id)}
                      className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 mt-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {q.id}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 uppercase">
                          {q.kind.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          q.difficulty === 'easy'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : q.difficulty === 'medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      {/* Source Citation */}
                      {q.source && (q.source.book || q.source.standard) && (
                        <div className="flex items-center space-x-2 text-xs text-indigo-300 mt-1 break-words">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span className="break-words">
                            {q.source.book || `Std ${q.source.standard}`}
                            {q.source.term ? ` (Term ${q.source.term})` : ''}
                            {q.source.page ? ` • Page ${q.source.page}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this question */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0 flex-wrap gap-y-1">
                    <Link
                      href={`/admin/questions/${q.id}/edit`}
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Question"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {q.workflow.status !== 'published' && (
                      <button
                        onClick={() => performAction([q.id], 'approve')}
                        disabled={actionInProgress}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    )}

                    <button
                      onClick={() => openCommentModal(q.id, 'request_correction')}
                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium rounded-lg transition cursor-pointer"
                    >
                      Revision
                    </button>

                    {q.workflow.status !== 'rejected' && (
                      <button
                        onClick={() => openCommentModal(q.id, 'reject')}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Texts (Bilingual Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tamil Column */}
                  <div className="space-y-3 bg-slate-900/60 p-3.5 sm:p-4 rounded-xl border border-slate-700/50 min-w-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span>தமிழ் வினா (Tamil)</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Primary</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed font-tamil break-words">
                      {q.texts.ta.question}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      {q.texts.ta.options.map((opt) => {
                        const isCorrect = q.answer.correct_option_id === opt.id;
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

                    {q.texts.ta.explanation && (
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

                    {q.texts.en ? (
                      <>
                        <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed break-words">
                          {q.texts.en.question}
                        </p>

                        <div className="space-y-1.5 pt-2">
                          {q.texts.en.options.map((opt) => {
                            const isCorrect = q.answer.correct_option_id === opt.id;
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

                        {q.texts.en.explanation && (
                          <div className="mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                            <strong className="text-cyan-400 block mb-0.5">Explanation:</strong>
                            <p>{q.texts.en.explanation}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center p-6 text-slate-500 text-xs italic">
                        No English translation provided for this question.
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit & Comments History */}
                {q.workflow.verification_comments && q.workflow.verification_comments.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Review Trail:</span>
                    {q.workflow.verification_comments.map((comm, cIdx) => (
                      <div key={cIdx} className="text-slate-300 flex items-start gap-2">
                        <MessageSquare className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-white">{comm.author}</strong> ({comm.action}): {comm.comment}
                          <span className="text-slate-500 text-[10px] ml-2">
                            {new Date(comm.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-50 flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comment Modal */}
      {commentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{modalAction === 'request_correction' ? 'Request Correction / Revision' : 'Reject Question'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {modalAction === 'request_correction'
                ? 'Provide detailed feedback for what needs fixing (e.g. spelling typo, wrong answer key, citation page).'
                : 'State the reason for rejecting this question (e.g. out of syllabus, duplicate).'}
            </p>

            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Enter reviewer feedback..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCommentModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (targetQuestionId) {
                    performAction([targetQuestionId], modalAction, reviewComment);
                  }
                }}
                disabled={actionInProgress || !reviewComment.trim()}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition cursor-pointer ${
                  modalAction === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                } disabled:opacity-50`}
              >
                {actionInProgress ? 'Saving...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

