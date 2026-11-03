'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  PlusCircle,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Edit3,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface TestTemplate {
  id: string;
  title_en: string;
  title_ta: string;
  category: string;
  exam_id: string | null;
  duration_minutes: number;
  total_marks: number;
  negative_marking_rate: number;
  question_count: number;
  question_ids: string[];
  is_published: boolean;
  created_at: string;
  exams?: {
    id: string;
    title_en: string;
    title_ta: string;
  };
}

// Helper to extract question snippet whether stored as text or blocks
function getQuestionTitle(q: any): string {
  if (q.texts?.ta?.question) return q.texts.ta.question;
  if (q.texts?.ta?.blocks?.[0]?.content) return q.texts.ta.blocks[0].content;
  if (q.texts?.en?.question) return q.texts.en.question;
  if (q.texts?.en?.blocks?.[0]?.content) return q.texts.en.blocks[0].content;
  return 'வினா உரை இல்லை (No text preview)';
}

export default function AdminTestsPage() {
  const [tests, setTests] = useState<TestTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Available questions for selection
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [qSearchQuery, setQSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
    title_ta: '',
    title_en: '',
    category: 'unit_quiz',
    exam_id: 'group_4',
    duration_minutes: 60,
    total_marks: 30,
    negative_marking_rate: 0.0,
    is_published: true,
  });

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tests');
      const data = await res.json();
      if (res.ok) {
        setTests(data.tests || []);
      }
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/questions?limit=300');
      const data = await res.json();
      if (res.ok) {
        setAvailableQuestions(data.questions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchQuestions();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTestId(null);
    setSelectedQuestionIds([]);
    setQSearchQuery('');
    setSubjectFilter('all');
    setFormData({
      title_ta: '',
      title_en: '',
      category: 'unit_quiz',
      exam_id: 'group_4',
      duration_minutes: 45,
      total_marks: 0,
      negative_marking_rate: 0.0,
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (test: TestTemplate) => {
    setEditingTestId(test.id);
    setSelectedQuestionIds(test.question_ids || []);
    setQSearchQuery('');
    setSubjectFilter('all');
    setFormData({
      title_ta: test.title_ta || '',
      title_en: test.title_en || '',
      category: test.category || 'unit_quiz',
      exam_id: test.exam_id || 'group_4',
      duration_minutes: test.duration_minutes || 60,
      total_marks: test.total_marks || (test.question_ids?.length ? test.question_ids.length * 1.5 : 0),
      negative_marking_rate: test.negative_marking_rate || 0.0,
      is_published: test.is_published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleToggleQuestionSelect = (qId: string) => {
    if (selectedQuestionIds.includes(qId)) {
      const updated = selectedQuestionIds.filter((id) => id !== qId);
      setSelectedQuestionIds(updated);
      setFormData((prev) => ({ ...prev, total_marks: updated.length * 1.5 }));
    } else {
      const updated = [...selectedQuestionIds, qId];
      setSelectedQuestionIds(updated);
      setFormData((prev) => ({ ...prev, total_marks: updated.length * 1.5 }));
    }
  };

  // Filtered questions based on search query and subject
  const filteredQuestions = useMemo(() => {
    return availableQuestions.filter((q) => {
      // Subject filter
      if (subjectFilter !== 'all') {
        const subId = q.syllabus?.subject_id || '';
        if (subId !== subjectFilter) return false;
      }

      // Search query
      if (!qSearchQuery.trim()) return true;
      const lower = qSearchQuery.toLowerCase();
      const idMatch = q.id?.toLowerCase().includes(lower);
      const textMatch = getQuestionTitle(q).toLowerCase().includes(lower);
      const diffMatch = q.difficulty?.toLowerCase().includes(lower);
      const topicMatch = (q.syllabus?.topic_id || '').toLowerCase().includes(lower);

      return idMatch || textMatch || diffMatch || topicMatch;
    });
  }, [availableQuestions, qSearchQuery, subjectFilter]);

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredQuestions.map((q) => q.id);
    const allFilteredSelected = filteredIds.every((id) => selectedQuestionIds.includes(id));

    if (allFilteredSelected) {
      // Deselect filtered
      const updated = selectedQuestionIds.filter((id) => !filteredIds.includes(id));
      setSelectedQuestionIds(updated);
      setFormData((prev) => ({ ...prev, total_marks: updated.length * 1.5 }));
    } else {
      // Add missing filtered
      const newSet = new Set([...selectedQuestionIds, ...filteredIds]);
      const updated = Array.from(newSet);
      setSelectedQuestionIds(updated);
      setFormData((prev) => ({ ...prev, total_marks: updated.length * 1.5 }));
    }
  };

  const handleSelectFirstN = (n: number) => {
    const idsToSelect = filteredQuestions.slice(0, n).map((q) => q.id);
    const newSet = new Set([...selectedQuestionIds, ...idsToSelect]);
    const updated = Array.from(newSet);
    setSelectedQuestionIds(updated);
    setFormData((prev) => ({ ...prev, total_marks: updated.length * 1.5 }));
  };

  const handleDeselectAll = () => {
    setSelectedQuestionIds([]);
    setFormData((prev) => ({ ...prev, total_marks: 0 }));
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      alert('Please select at least 1 question for this test.');
      return;
    }

    if (!formData.title_ta.trim() || !formData.title_en.trim()) {
      alert('Please provide both Tamil and English titles for this test.');
      return;
    }

    setSaving(true);
    try {
      const url = editingTestId ? `/api/admin/tests/${editingTestId}` : '/api/admin/tests';
      const method = editingTestId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          question_ids: selectedQuestionIds,
          total_marks: selectedQuestionIds.length * 1.5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save test template');
      }

      setIsModalOpen(false);
      setEditingTestId(null);
      await fetchTests();
    } catch (err: any) {
      alert(err.message || 'Error saving test');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (test: TestTemplate) => {
    try {
      const res = await fetch(`/api/admin/tests/${test.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !test.is_published }),
      });
      if (res.ok) {
        setTests(tests.map((t) => (t.id === test.id ? { ...t, is_published: !t.is_published } : t)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test template?')) return;
    try {
      const res = await fetch(`/api/admin/tests/${testId}`, { method: 'DELETE' });
      if (res.ok) {
        setTests(tests.filter((t) => t.id !== testId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <span>Module 10</span>
            <span>•</span>
            <span>Assessment & Test Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2 break-words">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 shrink-0" />
            <span>Test Templates & Papers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 break-words">
            Assemble, edit, and publish Full Mocks, Unit Quizzes, and Samacheer Kalvi standard tests for TNPSC candidates.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Assemble New Test</span>
        </button>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="text-center py-20 bg-slate-800/40 rounded-xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading test papers...</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/40 rounded-xl border border-slate-800">
          <FileText className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-300">No test templates created yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click the button below to assemble your first exam template from your question bank.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Assemble Test Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="text-[11px] font-mono uppercase bg-slate-900 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/20 truncate">
                    {test.category.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(test)}
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      test.is_published
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-700 border-slate-600 text-slate-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${test.is_published ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                    <span>{test.is_published ? 'Published' : 'Draft'}</span>
                  </button>
                </div>

                <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug font-tamil break-words">
                  {test.title_ta}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1 break-words">{test.title_en}</p>

                <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
                  <div className="bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block truncate">Questions</span>
                    <strong className="text-amber-400">{test.question_count}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block truncate">Duration</span>
                    <strong className="text-slate-200">{test.duration_minutes}m</strong>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block truncate">Marks</span>
                    <strong className="text-emerald-400">{test.total_marks}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 font-mono truncate">
                  {test.exams?.title_en || 'TNPSC Group 4'}
                </span>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(test)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Edit Test Paper"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Delete Test Paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assemble / Edit Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                {editingTestId ? (
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                    <Edit3 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingTestId ? 'Edit Test Paper' : 'Assemble New Test Paper'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingTestId
                      ? `Editing template ID: ${editingTestId}`
                      : 'Configure exam parameters and select questions from the repository.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-5 overflow-y-auto pr-1">
              {/* Basic Meta Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Test Title (Tamil) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: 6ஆம் வகுப்பு பொதுத்தமிழ் - மாதிரித் தேர்வு 2"
                    value={formData.title_ta}
                    onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-tamil"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Test Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6th Standard General Tamil - Mock Test 2"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="unit_quiz">Unit / Lesson Quiz</option>
                    <option value="full_mock">Full Mock Examination (200 Qs)</option>
                    <option value="part_test">Part Test (General Tamil / GS)</option>
                    <option value="previous_year">Previous Year Question Paper</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Exam Mapping
                  </label>
                  <select
                    value={formData.exam_id}
                    onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="group_4">TNPSC Group 4 (VAO / Junior Assistant)</option>
                    <option value="group_2">TNPSC Group 2 (Interview Posts)</option>
                    <option value="group_2a">TNPSC Group 2A (Non-Interview Posts)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 45 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Negative Marking Rate
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.negative_marking_rate}
                    onChange={(e) => setFormData({ ...formData, negative_marking_rate: parseFloat(e.target.value) || 0.0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Questions Selection Header & Filter Bar */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      Select Questions from Repository
                    </label>
                    <p className="text-xs text-slate-400">
                      Currently Selected: <span className="font-bold text-amber-400">{selectedQuestionIds.length}</span> questions
                      {' '}(Total Marks: <span className="font-bold text-emerald-400">{selectedQuestionIds.length * 1.5}</span>)
                    </p>
                  </div>

                  {/* Quick Select Actions */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="px-2.5 py-1 text-xs rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
                    >
                      Select All Filtered ({filteredQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectFirstN(10)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectFirstN(25)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                    >
                      +25
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="px-2.5 py-1 text-xs rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search questions by ID, Tamil words, English words, topic..."
                      value={qSearchQuery}
                      onChange={(e) => setQSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    {qSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setQSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full sm:w-48 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Subjects</option>
                    <option value="general_tamil">General Tamil (பொதுத்தமிழ்)</option>
                    <option value="indian_polity">Indian Polity</option>
                    <option value="aptitude">Aptitude & Mental Ability</option>
                    <option value="unit_8">Unit 8 (History & Culture of TN)</option>
                  </select>
                </div>

                {/* Question List Box */}
                <div className="max-h-64 overflow-y-auto border border-slate-700/80 rounded-xl divide-y divide-slate-800/80 bg-slate-950/70 p-1">
                  {filteredQuestions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No questions matched your search query. Try clearing the filter.
                    </div>
                  ) : (
                    filteredQuestions.map((q) => {
                      const isSelected = selectedQuestionIds.includes(q.id);
                      const titleSnippet = getQuestionTitle(q);
                      return (
                        <div
                          key={q.id}
                          onClick={() => handleToggleQuestionSelect(q.id)}
                          className={`p-3 text-xs flex items-center justify-between cursor-pointer rounded-lg transition ${
                            isSelected
                              ? 'bg-indigo-950/70 border border-indigo-500/40 text-indigo-100'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3 pr-4 overflow-hidden">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 pointer-events-none shrink-0"
                            />
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                                  {q.id}
                                </span>
                                {q.syllabus?.subject_id && (
                                  <span className="text-[10px] text-indigo-400 font-mono">
                                    {q.syllabus.subject_id}
                                  </span>
                                )}
                              </div>
                              <p className="font-tamil line-clamp-2 text-slate-200 text-xs">
                                {titleSnippet}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                            <span className="text-[9px] font-mono uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                              {q.difficulty || 'medium'}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400">
                              +1.5m
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Validation Warning & Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div>
                  {selectedQuestionIds.length === 0 ? (
                    <div className="flex items-center space-x-1.5 text-xs text-amber-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Please check at least 1 question above to enable saving.</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Ready: {selectedQuestionIds.length} questions ({selectedQuestionIds.length * 1.5} marks)
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || selectedQuestionIds.length === 0}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1.5"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{editingTestId ? 'Updating Test...' : 'Saving Test...'}</span>
                      </>
                    ) : (
                      <span>{editingTestId ? 'Save Changes' : 'Publish Test Paper'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
