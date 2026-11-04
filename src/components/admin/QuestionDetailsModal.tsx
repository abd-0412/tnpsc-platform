'use client';

import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  BookOpen,
  Layers,
  History,
  ShieldCheck,
  AlertCircle,
  Award,
  Archive,
  Trash2,
  Calendar,
  User
} from 'lucide-react';
import { Question } from '@/lib/types/question';

interface QuestionDetailsModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  auditLogs?: Array<any>;
}

export default function QuestionDetailsModal({
  question,
  isOpen,
  onClose,
  auditLogs = [],
}: QuestionDetailsModalProps) {
  if (!isOpen || !question) return null;

  const workflow = question.workflow || { status: 'draft', verification_comments: [] };
  const history = Array.isArray(workflow.history) ? workflow.history : [];
  const comments = Array.isArray(workflow.verification_comments) ? workflow.verification_comments : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Published / Active (வெளியிடப்பட்டது)</span>
          </span>
        );
      case 'under_revision':
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Revision (திருத்தத்தில் உள்ளது)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Rejected (நிராகரிக்கப்பட்டது)</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Draft / Pending Review (வரைவு / நிலுவை)</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-850">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              {question.id}
            </span>
            {getStatusBadge(workflow.status)}
            {question.is_archived && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                <Archive className="w-3 h-3" />
                <span>Archived</span>
              </span>
            )}
            {question.deleted_at && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
                <span>Deleted</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Kind</span>
              <span className="font-semibold text-slate-200 capitalize">
                {question.kind.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Difficulty</span>
              <span className="font-semibold text-slate-200 uppercase">{question.difficulty}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Marks / Negative</span>
              <span className="font-semibold text-slate-200">
                {question.question_settings?.marks} / {question.question_settings?.negative_marks}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Language Status</span>
              <span className="font-semibold text-slate-200 uppercase">
                {typeof question.language_status === 'string' ? question.language_status : 'Bilingual'}
              </span>
            </div>
          </div>

          {/* Syllabus Hierarchy Citation */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
              <Layers className="w-4 h-4" />
              <span>Syllabus Taxonomy & Textbook Mapping</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
              <div>
                <span className="text-slate-400 text-[10px] block">Subject ID:</span>
                <span className="font-medium">{question.syllabus?.subject_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Unit / Iyal ID:</span>
                <span className="font-medium">{question.syllabus?.unit_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Lesson ID:</span>
                <span className="font-medium">{question.syllabus?.lesson_id || 'N/A'}</span>
              </div>
              {question.source && (
                <div className="col-span-2 sm:col-span-3 text-indigo-200 pt-1 border-t border-indigo-500/20">
                  <span className="text-indigo-400 font-semibold">Samacheer Book: </span>
                  {question.source.book || `Standard ${question.source.standard || 6}`}
                  {question.source.term ? `, Term ${question.source.term}` : ''}
                  {question.source.chapter ? `, ${question.source.chapter}` : ''}
                  {question.source.page_number ? `, Page ${question.source.page_number}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Bilingual Texts & Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tamil Column */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block">
                தமிழ் வினா (Tamil Content)
              </span>
              <p className="text-sm font-medium text-slate-100 font-tamil leading-relaxed break-words">
                {question.texts?.ta?.question}
              </p>
              {question.texts?.ta?.options && question.texts.ta.options.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {question.texts.ta.options.map((opt) => {
                    const isCorrect = question.answer?.correct_option_id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl text-xs flex items-start space-x-2 border ${
                          isCorrect
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="font-mono font-bold">{opt.id}.</span>
                        <span className="font-tamil break-words flex-1">{opt.text}</span>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
              {question.texts?.ta?.explanation && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300">
                  <strong className="text-amber-400 block mb-1">விளக்கம்:</strong>
                  <p className="font-tamil break-words">{question.texts.ta.explanation}</p>
                </div>
              )}
            </div>

            {/* English Column */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider block">
                English Question
              </span>
              <p className="text-sm font-medium text-slate-100 leading-relaxed break-words">
                {question.texts?.en?.question || <em className="text-slate-500">No English translation provided</em>}
              </p>
              {question.texts?.en?.options && question.texts.en.options.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {question.texts.en.options.map((opt) => {
                    const isCorrect = question.answer?.correct_option_id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl text-xs flex items-start space-x-2 border ${
                          isCorrect
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="font-mono font-bold">{opt.id}.</span>
                        <span className="break-words flex-1">{opt.text}</span>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
              {question.texts?.en?.explanation && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300">
                  <strong className="text-cyan-400 block mb-1">Explanation:</strong>
                  <p className="break-words">{question.texts.en.explanation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Rejection / Archive / Deletion Note */}
          {workflow.rejection_reason && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 space-y-1">
              <div className="flex items-center space-x-2 font-bold text-rose-400 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Rejection Reason (நிராகரிப்பு காரணம்)</span>
              </div>
              <p className="font-tamil">{workflow.rejection_reason}</p>
            </div>
          )}

          {question.archive_reason && (
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-300 space-y-1">
              <div className="flex items-center space-x-2 font-bold text-purple-400 uppercase tracking-wider">
                <Archive className="w-4 h-4" />
                <span>Archive Reason (காப்பக காரணம்)</span>
              </div>
              <p>{question.archive_reason}</p>
              {question.archived_at && (
                <span className="text-[10px] text-purple-400 block">
                  Archived on: {new Date(question.archived_at).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {question.deletion_reason && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 space-y-1">
              <div className="flex items-center space-x-2 font-bold text-red-400 uppercase tracking-wider">
                <Trash2 className="w-4 h-4" />
                <span>Soft Deletion Reason (நீக்கப்பட்ட காரணம்)</span>
              </div>
              <p>{question.deletion_reason}</p>
              {question.deleted_at && (
                <span className="text-[10px] text-red-400 block">
                  Deleted at: {new Date(question.deleted_at).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Workflow Status Timeline & Traceable History */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Traceable Workflow History & Verification Log</span>
            </h4>

            {history.length === 0 && comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No transition history logged yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 border-l border-slate-800">
                {history.map((h: any, idx: number) => (
                  <div key={idx} className="relative group text-xs space-y-1">
                    <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-slate-900" />
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-200 capitalize">
                        {h.action ? h.action.replace(/_/g, ' ') : 'Status Transition'}:
                      </span>
                      <span className="font-mono text-amber-400">
                        {h.from_status || 'initial'} → {h.to_status}
                      </span>
                    </div>
                    {h.reason && <p className="text-slate-300 italic">{h.reason}</p>}
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                      <span>By: {h.by_name || 'Admin'}</span>
                      <span>•</span>
                      <span>{new Date(h.timestamp || Date.now()).toLocaleString()}</span>
                    </div>
                  </div>
                ))}

                {comments.map((c: any, cIdx: number) => (
                  <div key={`c-${cIdx}`} className="relative group text-xs space-y-1">
                    <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-slate-900" />
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-blue-300">Reviewer Comment:</span>
                      <span className="text-slate-300">{c.comment}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                      <span>By: {c.author_name || 'Reviewer'}</span>
                      <span>•</span>
                      <span>{new Date(c.created_at || Date.now()).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close (மூடுக)
          </button>
        </div>
      </div>
    </div>
  );
}
