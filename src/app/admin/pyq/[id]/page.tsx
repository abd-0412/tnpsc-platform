'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  ArrowLeft,
  Check,
  X,
  UploadCloud,
  ListOrdered,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Copy,
  Globe,
  ShieldCheck,
  FileCheck,
  Info,
  Plus
} from 'lucide-react';
import QuestionDetailsModal from '@/components/admin/QuestionDetailsModal';
import EditPaperDetailsModal from '@/components/admin/pyq/EditPaperDetailsModal';
import RemoveQuestionModal from '@/components/admin/pyq/RemoveQuestionModal';
import SharedQuestionWarningModal from '@/components/admin/pyq/SharedQuestionWarningModal';

type WorkspaceTab =
  | 'overview'
  | 'questions'
  | 'add_questions'
  | 'import_questions'
  | 'question_order'
  | 'preview'
  | 'publishing';

export default function PaperWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const paperId = params.id as string;

  const initialTab = (searchParams.get('tab') as WorkspaceTab) || 'overview';
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);

  // Paper & Questions State
  const [paper, setPaper] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [assignedQuestions, setAssignedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [detailsModalQuestion, setDetailsModalQuestion] = useState<any | null>(null);

  // Remove Modal State
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeTargetIds, setRemoveTargetIds] = useState<string[]>([]);
  const [removeSnippet, setRemoveSnippet] = useState<string>('');
  const [removeLoading, setRemoveLoading] = useState(false);

  // Shared Question Warning Modal State
  const [sharedModalOpen, setSharedModalOpen] = useState(false);
  const [sharedQuestionData, setSharedQuestionData] = useState<any | null>(null);
  const [sharedQuestionId, setSharedQuestionId] = useState<string>('');
  const [sharedCheckResult, setSharedCheckResult] = useState<any | null>(null);

  // Multi-select in Questions Tab
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // --------------------------------------------------------------------------
  // Tab 3: Add Existing from Question Bank State
  // --------------------------------------------------------------------------
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankSubject, setBankSubject] = useState('');
  const [bankDifficulty, setBankDifficulty] = useState('');
  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set());
  const [addingToPaperLoading, setAddingToPaperLoading] = useState(false);

  // --------------------------------------------------------------------------
  // Tab 3 Subtab B: Create New Question Form State
  // --------------------------------------------------------------------------
  const [newQTa, setNewQTa] = useState('');
  const [newQEn, setNewQEn] = useState('');
  const [newOptA_ta, setNewOptA_ta] = useState('');
  const [newOptB_ta, setNewOptB_ta] = useState('');
  const [newOptC_ta, setNewOptC_ta] = useState('');
  const [newOptD_ta, setNewOptD_ta] = useState('');
  const [newOptA_en, setNewOptA_en] = useState('');
  const [newOptB_en, setNewOptB_en] = useState('');
  const [newOptC_en, setNewOptC_en] = useState('');
  const [newOptD_en, setNewOptD_en] = useState('');
  const [newCorrectOption, setNewCorrectOption] = useState('A');
  const [newExplanationTa, setNewExplanationTa] = useState('');
  const [newExplanationEn, setNewExplanationEn] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('medium');
  const [newSubject, setNewSubject] = useState('general_tamil');
  const [createQLoading, setCreateQLoading] = useState(false);

  // --------------------------------------------------------------------------
  // Tab 4: Direct Import State
  // --------------------------------------------------------------------------
  const [importContent, setImportContent] = useState('');
  const [importFormat, setImportFormat] = useState<'json' | 'jsonl'>('json');
  const [importLoading, setImportLoading] = useState(false);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [importInvalidRecords, setImportInvalidRecords] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------------------------------
  // Tab 5: Question Order State
  // --------------------------------------------------------------------------
  const [orderedList, setOrderedList] = useState<any[]>([]);
  const [isOrderDirty, setIsOrderDirty] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);

  // --------------------------------------------------------------------------
  // Tab 6: Paper Preview State
  // --------------------------------------------------------------------------
  const [previewLanguage, setPreviewLanguage] = useState<'bilingual' | 'ta' | 'en'>('bilingual');
  const [previewLayout, setPreviewLayout] = useState<'desktop' | 'mobile'>('desktop');

  // Load paper and assigned questions
  const loadPaperAndQuestions = async () => {
    setLoading(true);
    try {
      const [paperRes, qRes] = await Promise.all([
        fetch(`/api/admin/pyq/${paperId}`),
        fetch(`/api/admin/pyq/${paperId}/questions`),
      ]);

      const paperData = await paperRes.json();
      const qData = await qRes.json();

      if (!paperRes.ok) throw new Error(paperData.error || 'Failed to load paper');

      setPaper(paperData.paper);
      setMetrics(paperData.metrics);

      const qs = qData.questions || [];
      setAssignedQuestions(qs);
      setOrderedList(qs);
      setIsOrderDirty(false);
      setSelectedQuestionIds(new Set());
    } catch (err: any) {
      console.error(err);
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaperAndQuestions();
  }, [paperId]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  // Sync tab with URL
  const handleTabChange = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    router.replace(`/admin/pyq/${paperId}?tab=${tab}`);
  };

  // --------------------------------------------------------------------------
  // TAB 2 ACTIONS: Remove from Paper
  // --------------------------------------------------------------------------
  const openSingleRemove = (q: any) => {
    setRemoveTargetIds([q.id]);
    setRemoveSnippet(q.texts?.ta?.question || q.texts?.en?.question || '');
    setRemoveModalOpen(true);
  };

  const openBulkRemove = () => {
    if (selectedQuestionIds.size === 0) return;
    setRemoveTargetIds(Array.from(selectedQuestionIds));
    setRemoveSnippet('');
    setRemoveModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    setRemoveLoading(true);
    try {
      const res = await fetch(`/api/admin/pyq/${paperId}/questions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds: removeTargetIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove question');

      showNotification('success', data.message);
      setRemoveModalOpen(false);
      loadPaperAndQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 2 ACTIONS: Edit Question with Shared Protection Check
  // --------------------------------------------------------------------------
  const handleQuestionEditClick = async (q: any) => {
    try {
      const res = await fetch(`/api/admin/pyq/${paperId}/questions/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', questionId: q.id }),
      });
      const data = await res.json();

      if (data.isShared) {
        setSharedQuestionId(q.id);
        setSharedQuestionData(q);
        setSharedCheckResult(data);
        setSharedModalOpen(true);
      } else {
        // Not shared: safe to edit directly in Question Bank editor
        router.push(`/admin/questions/${q.id}/edit`);
      }
    } catch (err) {
      router.push(`/admin/questions/${q.id}/edit`);
    }
  };

  const handleSharedChoice = async (choice: 'fork' | 'update_central') => {
    if (choice === 'update_central') {
      setSharedModalOpen(false);
      router.push(`/admin/questions/${sharedQuestionId}/edit`);
    } else {
      // Fork copy specifically for this paper
      try {
        const res = await fetch(`/api/admin/pyq/${paperId}/questions/fork`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'fork',
            questionId: sharedQuestionId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fork question');

        showNotification('success', data.message);
        setSharedModalOpen(false);
        // Navigate to edit the newly forked question!
        router.push(`/admin/questions/${data.newQuestionId}/edit`);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // --------------------------------------------------------------------------
  // TAB 3: Load Central Question Bank for "Add Existing"
  // --------------------------------------------------------------------------
  const fetchBankQuestions = async () => {
    setBankLoading(true);
    try {
      const params = new URLSearchParams();
      if (bankSearch.trim()) params.set('q', bankSearch.trim());
      if (bankSubject) params.set('subject', bankSubject);
      if (bankDifficulty) params.set('difficulty', bankDifficulty);
      params.set('limit', '30');

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        // Filter out questions already in this paper
        const assignedSet = new Set(assignedQuestions.map((q) => q.id));
        const filtered = (data.questions || []).filter((q: any) => !assignedSet.has(q.id));
        setBankQuestions(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'add_questions') {
      fetchBankQuestions();
    }
  }, [activeTab, bankSearch, bankSubject, bankDifficulty]);

  const handleAddSelectedBankQuestions = async () => {
    if (selectedBankIds.size === 0) return;
    setAddingToPaperLoading(true);

    try {
      const res = await fetch(`/api/admin/pyq/${paperId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_existing',
          question_ids: Array.from(selectedBankIds),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add questions');

      showNotification('success', data.message);
      setSelectedBankIds(new Set());
      loadPaperAndQuestions();
      setActiveTab('questions');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingToPaperLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 3 Subtab B: Create New Question Directly
  // --------------------------------------------------------------------------
  const handleCreateNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTa.trim()) {
      alert('Tamil question text is required');
      return;
    }

    setCreateQLoading(true);
    try {
      const questionPayload = {
        kind: 'direct_mcq',
        level: 'prelims',
        difficulty: newDifficulty,
        syllabus: {
          subject_id: newSubject,
        },
        texts: {
          ta: {
            question: newQTa.trim(),
            options: [
              { id: 'A', text: newOptA_ta.trim() },
              { id: 'B', text: newOptB_ta.trim() },
              { id: 'C', text: newOptC_ta.trim() },
              { id: 'D', text: newOptD_ta.trim() },
            ],
            explanation: newExplanationTa.trim(),
          },
          en: newQEn.trim()
            ? {
                question: newQEn.trim(),
                options: [
                  { id: 'A', text: newOptA_en.trim() },
                  { id: 'B', text: newOptB_en.trim() },
                  { id: 'C', text: newOptC_en.trim() },
                  { id: 'D', text: newOptD_en.trim() },
                ],
                explanation: newExplanationEn.trim(),
              }
            : undefined,
        },
        answer: {
          correct_option_id: newCorrectOption,
        },
      };

      const res = await fetch(`/api/admin/pyq/${paperId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_new',
          question: questionPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create question');

      showNotification('success', data.message);
      // Reset form
      setNewQTa('');
      setNewQEn('');
      setNewOptA_ta('');
      setNewOptB_ta('');
      setNewOptC_ta('');
      setNewOptD_ta('');
      setNewOptA_en('');
      setNewOptB_en('');
      setNewOptC_en('');
      setNewOptD_en('');
      setNewExplanationTa('');
      setNewExplanationEn('');

      loadPaperAndQuestions();
      setActiveTab('questions');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreateQLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 4: JSON/JSONL Direct Import
  // --------------------------------------------------------------------------
  const handleFileDrop = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImportContent((e.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  const handleCommitPaperImport = async () => {
    if (!importContent.trim()) {
      alert('Please upload or paste question data');
      return;
    }

    setImportLoading(true);
    try {
      let parsedRecords: any[] = [];
      if (importFormat === 'jsonl') {
        const lines = importContent.split(/\r?\n/);
        lines.forEach((l) => {
          const t = l.trim();
          if (t && !t.startsWith('//')) parsedRecords.push(JSON.parse(t));
        });
      } else {
        const parsed = JSON.parse(importContent);
        parsedRecords = Array.isArray(parsed) ? parsed : [parsed];
      }

      const res = await fetch(`/api/admin/pyq/${paperId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_json',
          records: parsedRecords,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setImportSummary({
        importedCount: data.importedCount,
        invalidCount: data.invalidCount,
      });
      setImportInvalidRecords(data.invalidRecords || []);
      showNotification('success', data.message);
      loadPaperAndQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 5: Question Reordering
  // --------------------------------------------------------------------------
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedList.length) return;

    const updated = [...orderedList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate sequence numbers
    const renumbered = updated.map((item, idx) => ({
      ...item,
      sequence_order: idx + 1,
    }));

    setOrderedList(renumbered);
    setIsOrderDirty(true);
  };

  const handleSaveOrder = async () => {
    setOrderSaving(true);
    try {
      const orderPayload = orderedList.map((item, idx) => ({
        question_id: item.id,
        sequence_order: idx + 1,
      }));

      const res = await fetch(`/api/admin/pyq/${paperId}/questions/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save order');

      showNotification('success', 'Question order saved persistently.');
      setIsOrderDirty(false);
      loadPaperAndQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setOrderSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 7: Publish to Test Manager
  // --------------------------------------------------------------------------
  const [publishingActionLoading, setPublishingActionLoading] = useState(false);
  const handlePublishFromWorkspace = async (action: 'publish' | 'unpublish') => {
    setPublishingActionLoading(true);
    try {
      const res = await fetch(`/api/admin/pyq/${paperId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.errors?.[0] || 'Failed to update publishing status');
      }

      showNotification('success', data.message);
      loadPaperAndQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishingActionLoading(false);
    }
  };

  if (loading && !paper) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading PYQ Paper Workspace...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="p-12 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Paper Not Found</h2>
        <Link href="/admin/pyq" className="text-xs text-amber-400 hover:underline">
          Return to PYQ Archive Dashboard
        </Link>
      </div>
    );
  }

  const assignedCount = assignedQuestions.length;
  const expectedCount = paper.expected_question_count || 200;
  const percentComplete = Math.min(100, Math.round((assignedCount / expectedCount) * 100));

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="p-5 rounded-3xl bg-slate-850 border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/pyq"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Back to PYQ Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
                <span>PYQ Paper Workspace</span>
                <span>•</span>
                <span className="font-mono">{paper.id}</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight font-tamil">
                {paper.title_ta}
              </h1>
              <p className="text-xs text-slate-400">{paper.title_en}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditDetailsOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Paper Details</span>
            </button>

            <button
              onClick={() => handlePublishFromWorkspace(paper.status === 'published' ? 'unpublish' : 'publish')}
              disabled={publishingActionLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-lg ${
                paper.status === 'published'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{paper.status === 'published' ? 'Published in Tests' : 'Publish Paper'}</span>
            </button>
          </div>
        </div>

        {/* Workspace Quick Specs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Exam Group</span>
            <span className="font-semibold text-indigo-400">{paper.exams?.title_en || paper.exam_group}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Exam Year</span>
            <span className="font-semibold text-amber-400">{paper.year}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Paper Code</span>
            <span className="font-semibold text-slate-200 font-mono">{paper.paper_code || 'N/A'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Duration</span>
            <span className="font-semibold text-slate-200">{paper.duration_minutes} Minutes</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Marks</span>
            <span className="font-semibold text-emerald-400">{paper.total_marks} Marks</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Completion</span>
            <span className={`font-semibold ${assignedCount >= expectedCount ? 'text-emerald-400' : 'text-amber-400'}`}>
              {assignedCount} / {expectedCount} Qs ({percentComplete}%)
            </span>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-700/60 no-scrollbar">
          {[
            { id: 'overview', label: '1. Overview (கண்ணோட்டம்)' },
            { id: 'questions', label: `2. Questions (${assignedCount})` },
            { id: 'add_questions', label: '3. Add Questions' },
            { id: 'import_questions', label: '4. Bulk Import' },
            { id: 'question_order', label: '5. Question Order' },
            { id: 'preview', label: '6. Paper Preview' },
            { id: 'publishing', label: '7. Publishing & Test Manager' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as WorkspaceTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
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

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW & COMPLETION AUDIT */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Health Check Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-850 border border-slate-700/80 shadow space-y-2">
              <span className="text-slate-400 text-xs font-bold uppercase block">Question Quota</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">{assignedCount}</span>
                <span className="text-xs text-slate-400">/ {expectedCount} Qs</span>
              </div>
              <p className="text-xs text-slate-400">
                {assignedCount >= expectedCount
                  ? '✓ Expected question target fully achieved.'
                  : `⚠ Needs ${expectedCount - assignedCount} more questions to meet paper specifications.`}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-850 border border-slate-700/80 shadow space-y-2">
              <span className="text-slate-400 text-xs font-bold uppercase block">Verification Readiness</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-emerald-400">{metrics?.verifiedCount || 0}</span>
                <span className="text-xs text-slate-400">Verified</span>
              </div>
              <p className="text-xs text-slate-400">
                {metrics?.pendingVerificationCount || 0} questions are in Draft / Pending Review status.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-850 border border-slate-700/80 shadow space-y-2">
              <span className="text-slate-400 text-xs font-bold uppercase block">Bilingual Content</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-cyan-400">
                  {assignedCount - (metrics?.missingTranslationCount || 0)}
                </span>
                <span className="text-xs text-slate-400">Bilingual Qs</span>
              </div>
              <p className="text-xs text-slate-400">
                {metrics?.missingTranslationCount || 0} questions have Tamil content only.
              </p>
            </div>
          </div>

          {/* Paper Details Card */}
          <div className="p-6 rounded-3xl bg-slate-850 border border-slate-700/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Paper Metadata & Instructions</span>
              </h3>
              <button
                onClick={() => setIsEditDetailsOpen(true)}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Edit Metadata
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">Tamil Instructions:</span>
                <p className="text-slate-200 font-tamil leading-relaxed">
                  {paper.instructions_ta || 'வழிமுறைகள் குறிப்பிடப்படவில்லை.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">English Instructions:</span>
                <p className="text-slate-200 leading-relaxed">
                  {paper.instructions_en || 'No English instructions provided.'}
                </p>
              </div>
            </div>

            {/* High Yield Topics */}
            {Array.isArray(paper.high_yield_topics) && paper.high_yield_topics.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  High-Yield Focus Areas Identified:
                </span>
                <div className="flex flex-wrap gap-2">
                  {paper.high_yield_topics.map((topic: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 text-xs font-tamil"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: QUESTIONS TABLE (MANAGE ASSIGNED QUESTIONS) */}
      {/* ==================================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400">
                Assigned: <strong className="text-white font-mono">{assignedQuestions.length}</strong> questions
              </span>
              {selectedQuestionIds.size > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold font-mono">
                  {selectedQuestionIds.size} Selected
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {selectedQuestionIds.size > 0 && (
                <button
                  onClick={openBulkRemove}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-red-950/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Remove from Paper ({selectedQuestionIds.size})</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('add_questions')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add More Questions</span>
              </button>
            </div>
          </div>

          {/* Questions List */}
          {assignedQuestions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-850 border border-slate-700 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">இத்தாளில் வினாக்கள் ஒதுக்கப்படவில்லை</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                மத்திய வினா வங்கியிலிருந்து வினாக்களை சேர்க்க 'Add Questions' தத்தலை கிளிக் செய்யவும்.
              </p>
              <button
                onClick={() => setActiveTab('add_questions')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>வினாக்களை சேர்க்கவும் (Add Questions)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All Checkbox */}
              <div className="flex items-center space-x-2 text-xs text-slate-400 px-2">
                <input
                  type="checkbox"
                  id="select-all-assigned"
                  checked={
                    assignedQuestions.length > 0 &&
                    selectedQuestionIds.size === assignedQuestions.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedQuestionIds(new Set(assignedQuestions.map((q) => q.id)));
                    } else {
                      setSelectedQuestionIds(new Set());
                    }
                  }}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <label htmlFor="select-all-assigned" className="cursor-pointer font-medium">
                  அனைத்தையும் தேர்ந்தெடு (Select All {assignedQuestions.length} Questions)
                </label>
              </div>

              {assignedQuestions.map((q, idx) => {
                const isSelected = selectedQuestionIds.has(q.id);
                return (
                  <div
                    key={q.id || idx}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/5 border-amber-500/40 shadow-lg'
                        : 'bg-slate-850 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSet = new Set(selectedQuestionIds);
                            if (e.target.checked) newSet.add(q.id);
                            else newSet.delete(q.id);
                            setSelectedQuestionIds(newSet);
                          }}
                          className="mt-1 rounded text-amber-500 focus:ring-0"
                        />

                        {/* Question Number Badge */}
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 font-mono font-bold text-amber-400 text-xs">
                          #{q.sequence_order || idx + 1}
                        </div>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            <span className="font-mono text-xs font-bold text-amber-400">{q.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {q.kind?.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {q.difficulty}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                q.workflow?.status === 'published' || q.workflow?.status === 'verified'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {q.workflow?.status || 'draft'}
                            </span>
                          </div>

                          {/* Tamil Snippet */}
                          <p className="text-slate-100 font-tamil text-sm font-medium leading-relaxed">
                            {q.texts?.ta?.question}
                          </p>

                          {/* English Snippet */}
                          {q.texts?.en?.question && (
                            <p className="text-slate-400 text-xs leading-relaxed">
                              {q.texts.en.question}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => setDetailsModalQuestion(q)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          title="View Question Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleQuestionEditClick(q)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openSingleRemove(q)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                          title="Remove from Paper"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: ADD QUESTIONS (FROM CENTRAL BANK OR CREATE NEW) */}
      {/* ==================================================================== */}
      {activeTab === 'add_questions' && (
        <div className="space-y-5">
          {/* Subtab Buttons */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>வினாக்களைத் தாளுடன் இணைக்கவும் (Add Questions to Paper)</span>
            </h3>

            {/* Filter controls for Central Bank */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search question bank by text or ID..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <select
                  value={bankSubject}
                  onChange={(e) => setBankSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">அனைத்து பாடங்கள் (All Subjects)</option>
                  <option value="general_tamil">பொதுத் தமிழ் (General Tamil)</option>
                  <option value="sub-polity">இந்திய ஆட்சியியல் (Polity)</option>
                  <option value="sub-history">வரலாறு (History)</option>
                  <option value="sub-aptitude">திறனறிவு (Aptitude)</option>
                </select>
              </div>

              <div>
                <select
                  value={bankDifficulty}
                  onChange={(e) => setBankDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">அனைத்து கடினத்தன்மை (All Difficulties)</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Selection Toolbar */}
            <div className="flex items-center justify-between border-t border-slate-700/60 pt-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Available to Add:</span>
                <strong className="text-white font-mono">{bankQuestions.length}</strong>
                {selectedBankIds.size > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold font-mono">
                    {selectedBankIds.size} Selected
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBankIds.size === bankQuestions.length) {
                      setSelectedBankIds(new Set());
                    } else {
                      setSelectedBankIds(new Set(bankQuestions.map((q) => q.id)));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  {selectedBankIds.size === bankQuestions.length ? 'Deselect All' : 'Select All'}
                </button>

                <button
                  type="button"
                  onClick={handleAddSelectedBankQuestions}
                  disabled={selectedBankIds.size === 0 || addingToPaperLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-amber-500/20"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>
                    {addingToPaperLoading
                      ? 'இணைக்கப்படுகிறது...'
                      : `Add ${selectedBankIds.size} Question(s) to Paper`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Central Bank Questions List */}
          {bankLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>மத்திய வினா வங்கியிலிருந்து வினாக்கள் பெறப்படுகின்றன...</span>
            </div>
          ) : bankQuestions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-850 border border-slate-700 text-center text-xs text-slate-400">
              பொருத்தமான புதிய வினாக்கள் ஏதுமில்லை.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {bankQuestions.map((q) => {
                const isSelected = selectedBankIds.has(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      const newSet = new Set(selectedBankIds);
                      if (isSelected) newSet.delete(q.id);
                      else newSet.add(q.id);
                      setSelectedBankIds(newSet);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow'
                        : 'bg-slate-850 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-1 rounded text-amber-500 focus:ring-0"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-amber-400">{q.id}</span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-slate-200 font-tamil text-xs line-clamp-2 leading-relaxed">
                          {q.texts?.ta?.question}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Subtab B: Create New Question Form */}
          <div className="p-6 rounded-3xl bg-slate-850 border border-slate-700/80 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>புதிய வினா உருவாக்கி இத்தாளுடன் இணை (Create New Question for this Paper)</span>
            </h3>

            <form onSubmit={handleCreateNewQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tamil Question */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-bold">
                    தமிழ் வினா உரை (Tamil Question) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="தமிழ் வினா உள்ளடக்கத்தை இங்கு தட்டச்சு செய்யவும்..."
                    value={newQTa}
                    onChange={(e) => setNewQTa(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-tamil focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      தமிழ் விடைக் குறிப்புகள் (Tamil Options):
                    </span>
                    <input
                      type="text"
                      placeholder="A. விடை 1"
                      value={newOptA_ta}
                      onChange={(e) => setNewOptA_ta(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-tamil"
                    />
                    <input
                      type="text"
                      placeholder="B. விடை 2"
                      value={newOptB_ta}
                      onChange={(e) => setNewOptB_ta(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-tamil"
                    />
                    <input
                      type="text"
                      placeholder="C. விடை 3"
                      value={newOptC_ta}
                      onChange={(e) => setNewOptC_ta(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-tamil"
                    />
                    <input
                      type="text"
                      placeholder="D. விடை 4"
                      value={newOptD_ta}
                      onChange={(e) => setNewOptD_ta(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-tamil"
                    />
                  </div>
                </div>

                {/* English Question */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-bold">
                    English Question Text (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type English question translation here..."
                    value={newQEn}
                    onChange={(e) => setNewQEn(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      English Options:
                    </span>
                    <input
                      type="text"
                      placeholder="A. Option A"
                      value={newOptA_en}
                      onChange={(e) => setNewOptA_en(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="B. Option B"
                      value={newOptB_en}
                      onChange={(e) => setNewOptB_en(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="C. Option C"
                      value={newOptC_en}
                      onChange={(e) => setNewOptC_en(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="D. Option D"
                      value={newOptD_en}
                      onChange={(e) => setNewOptD_en(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Correct Answer & Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700/60">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    சரியான விடை (Correct Answer) *
                  </label>
                  <select
                    value={newCorrectOption}
                    onChange={(e) => setNewCorrectOption(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                  >
                    <option value="A">விடை A (Option A)</option>
                    <option value="B">விடை B (Option B)</option>
                    <option value="C">விடை C (Option C)</option>
                    <option value="D">விடை D (Option D)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">கடினத்தன்மை (Difficulty)</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">பாடம் (Subject)</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="general_tamil">General Tamil</option>
                    <option value="sub-polity">Polity</option>
                    <option value="sub-history">History</option>
                    <option value="sub-aptitude">Aptitude</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={createQLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-950/50"
                >
                  <Check className="w-4 h-4" />
                  <span>{createQLoading ? 'உருவாக்கப்படுகிறது...' : 'உருவாக்கி இணை (Create & Assign to Paper)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: BULK IMPORT INTO THIS PAPER */}
      {/* ==================================================================== */}
      {activeTab === 'import_questions' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-850 border border-slate-700/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-indigo-400" />
                  <span>Bulk JSON / JSONL Import for {paper.title_en}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  பதிவேற்றப்படும் வினாக்கள் தானாகவே இத்தாளுடன் ஒதுக்கப்பட்டு Draft நிலைக்குச் செல்லும்.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Format:</span>
                {(['json', 'jsonl'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setImportFormat(fmt)}
                    className={`px-3 py-1 rounded-lg font-bold uppercase transition ${
                      importFormat === fmt
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-3xl flex flex-col items-center justify-center space-y-2 cursor-pointer bg-slate-900/40 transition"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,.jsonl"
                onChange={(e) => e.target.files?.[0] && handleFileDrop(e.target.files[0])}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-amber-400" />
              <p className="text-xs font-semibold text-slate-200">
                கோப்பைத் தேர்ந்தெடுக்க கிளிக் செய்யவும் அல்லது இங்கே இழுத்துப் போடவும்
              </p>
              <p className="text-[11px] text-slate-500">Supports .json and .jsonl</p>
            </div>

            {/* Direct JSON Textarea */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                அல்லது JSON உள்ளடக்கத்தை இங்கே ஒட்டவும் (Paste Raw Content):
              </label>
              <textarea
                rows={6}
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                placeholder='[{"texts": {"ta": {"question": "..."}}, "answer": {"correct_option_id": "A"}}]'
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCommitPaperImport}
                disabled={importLoading || !importContent.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-amber-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {importLoading ? 'இறக்குமதி செய்யப்படுகிறது...' : 'Import Questions into this Paper'}
                </span>
              </button>
            </div>
          </div>

          {/* Import Summary Results */}
          {importSummary && (
            <div className="p-5 rounded-3xl bg-slate-850 border border-slate-700 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Import Execution Completed</span>
              </div>
              <p className="text-xs text-slate-300">
                Successfully assigned <strong>{importSummary.importedCount}</strong> questions into Draft status for this paper.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: QUESTION ORDER MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === 'question_order' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-amber-400" />
                <span>Question Sequence & Ordering</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                வினாத்தாள் அசல் வரிசையை மாற்ற 'Up' மற்றும் 'Down' பட்டன்களைப் பயன்படுத்தவும்.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {isOrderDirty && (
                <span className="text-xs text-amber-400 font-semibold animate-pulse">
                  Unsaved order changes!
                </span>
              )}
              <button
                onClick={handleSaveOrder}
                disabled={orderSaving || !isOrderDirty}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-40 shadow-lg shadow-emerald-950/50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{orderSaving ? 'சேமிக்கப்படுகிறது...' : 'Save Sequence Order'}</span>
              </button>
            </div>
          </div>

          {orderedList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-850 border border-slate-700 text-center text-xs text-slate-400">
              வரிசைப்படுத்துவதற்கு வினாக்கள் இல்லை.
            </div>
          ) : (
            <div className="space-y-2">
              {orderedList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-850 border border-slate-700/70 flex items-center justify-between gap-3 text-xs hover:border-slate-600 transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-amber-400 text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-mono text-amber-400 font-bold block">{item.id}</span>
                      <p className="text-slate-200 font-tamil truncate max-w-xl">
                        {item.texts?.ta?.question}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => moveQuestion(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveQuestion(idx, 'down')}
                      disabled={idx === orderedList.length - 1}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: AUTHENTIC PAPER PREVIEW (STUDENT VIEW SIMULATION) */}
      {/* ==================================================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          {/* Preview Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 flex items-center justify-between flex-wrap gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">மொழித் தேர்வு (Language):</span>
              <button
                onClick={() => setPreviewLanguage('bilingual')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  previewLanguage === 'bilingual'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                இருமொழி (Bilingual)
              </button>
              <button
                onClick={() => setPreviewLanguage('ta')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  previewLanguage === 'ta'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                தமிழ் மட்டும்
              </button>
              <button
                onClick={() => setPreviewLanguage('en')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  previewLanguage === 'en'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                English Only
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Layout:</span>
              <button
                onClick={() => setPreviewLayout('desktop')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  previewLayout === 'desktop'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                Desktop Sheet
              </button>
              <button
                onClick={() => setPreviewLayout('mobile')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  previewLayout === 'mobile'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                Mobile Scroll
              </button>
            </div>
          </div>

          {/* Paper Sheet Preview Container */}
          <div
            className={`mx-auto bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl ${
              previewLayout === 'mobile' ? 'max-w-md' : 'max-w-4xl'
            }`}
          >
            {/* Authentic Exam Header */}
            <div className="text-center border-b-2 border-slate-700 pb-6 space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide uppercase">
                {paper.title_en}
              </h2>
              <h3 className="text-base sm:text-lg font-bold text-amber-400 font-tamil">
                {paper.title_ta}
              </h3>
              <div className="flex items-center justify-center space-x-4 text-xs text-slate-400 pt-1 font-mono">
                <span>Year: {paper.year}</span>
                <span>•</span>
                <span>Duration: {paper.duration_minutes} Mins</span>
                <span>•</span>
                <span>Maximum Marks: {paper.total_marks}</span>
                <span>•</span>
                <span>Questions: {assignedQuestions.length}</span>
              </div>
            </div>

            {/* Questions Sequence Preview */}
            <div className="space-y-6">
              {assignedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <span className="font-bold text-amber-400 text-sm font-mono shrink-0">
                      {idx + 1}.
                    </span>

                    <div className="space-y-3 flex-1 text-xs">
                      {/* Tamil Question */}
                      {(previewLanguage === 'bilingual' || previewLanguage === 'ta') && (
                        <div className="space-y-2">
                          <p className="font-tamil text-slate-100 text-sm font-medium leading-relaxed">
                            {q.texts?.ta?.question}
                          </p>

                          {q.texts?.ta?.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-tamil">
                              {q.texts.ta.options.map((opt: any) => (
                                <div
                                  key={opt.id}
                                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-start space-x-2"
                                >
                                  <span className="font-mono font-bold text-amber-400">({opt.id})</span>
                                  <span>{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* English Question */}
                      {(previewLanguage === 'bilingual' || previewLanguage === 'en') && (
                        <div className="space-y-2 pt-1 border-t border-slate-800/60">
                          <p className="text-slate-300 text-xs leading-relaxed">
                            {q.texts?.en?.question || <em className="text-slate-500">English translation pending</em>}
                          </p>

                          {q.texts?.en?.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.texts.en.options.map((opt: any) => (
                                <div
                                  key={opt.id}
                                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-start space-x-2"
                                >
                                  <span className="font-mono font-bold text-cyan-400">({opt.id})</span>
                                  <span>{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: PUBLISHING & TEST MANAGER INTEGRATION */}
      {/* ==================================================================== */}
      {activeTab === 'publishing' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Status Banner */}
          <div className="p-6 rounded-3xl bg-slate-850 border border-slate-700/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2.5">
                <Play className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Publishing & Test Manager Integration
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  paper.status === 'published'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}
              >
                Current Status: {paper.status.toUpperCase()}
              </span>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Required Questions Target ({expectedCount} Qs)</span>
                <span className={assignedCount >= expectedCount ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {assignedCount} / {expectedCount} ({assignedCount >= expectedCount ? 'Passed' : 'Incomplete'})
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Valid Answer Keys for All Questions</span>
                <span className={metrics?.missingAnswerCount === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {metrics?.missingAnswerCount === 0 ? 'Passed (100% Valid)' : `${metrics?.missingAnswerCount} Missing Answers`}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Verification Status</span>
                <span className="text-slate-200">
                  {metrics?.verifiedCount || 0} Verified • {metrics?.pendingVerificationCount || 0} in Review
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-end space-x-3">
              {paper.status === 'published' ? (
                <button
                  onClick={() => handlePublishFromWorkspace('unpublish')}
                  disabled={publishingActionLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  {publishingActionLoading ? 'Unpublishing...' : 'Unpublish from Tests'}
                </button>
              ) : (
                <button
                  onClick={() => handlePublishFromWorkspace('publish')}
                  disabled={publishingActionLoading || assignedCount === 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-40 shadow-lg shadow-emerald-950/50"
                >
                  {publishingActionLoading ? 'Publishing...' : 'Publish to Test Manager'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shared Question Warning Modal */}
      <SharedQuestionWarningModal
        isOpen={sharedModalOpen}
        onClose={() => setSharedModalOpen(false)}
        onChoiceSelected={handleSharedChoice}
        questionId={sharedQuestionId}
        paperTitle={paper.title_en}
        otherPapersCount={sharedCheckResult?.otherPapersCount || 0}
        testsCount={sharedCheckResult?.testsCount || 0}
        otherPapers={sharedCheckResult?.otherPapers || []}
        tests={sharedCheckResult?.tests || []}
      />

      {/* Remove Question Association Modal */}
      <RemoveQuestionModal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onConfirm={handleConfirmRemove}
        paperTitle={paper.title_en}
        questionIds={removeTargetIds}
        questionSnippet={removeSnippet}
        isBulk={removeTargetIds.length > 1}
        loading={removeLoading}
      />

      {/* Question Details Modal */}
      <QuestionDetailsModal
        question={detailsModalQuestion}
        isOpen={!!detailsModalQuestion}
        onClose={() => setDetailsModalQuestion(null)}
      />

      {/* Edit Paper Details Modal */}
      <EditPaperDetailsModal
        paper={paper}
        isOpen={isEditDetailsOpen}
        onClose={() => setIsEditDetailsOpen(false)}
        onUpdated={(updated) => {
          showNotification('success', 'Paper details updated.');
          setPaper(updated);
        }}
      />
    </div>
  );
}

