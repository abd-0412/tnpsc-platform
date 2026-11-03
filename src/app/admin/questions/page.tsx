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
  Layers
} from 'lucide-react';
import { Question } from '@/lib/types/question';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Dynamic Subjects from Syllabus
  const [subjects, setSubjects] = useState<Array<{ id: string; title_ta: string; title_en: string }>>([]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/admin/questions?limit=1'); // or query syllabus
      // We can query syllabus directly
      const subRes = await fetch('/api/admin/syllabus');
      // Or fallback to default subjects
    } catch {}
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (subject) params.set('subject', subject);
      if (difficulty) params.set('difficulty', difficulty);
      if (kind) params.set('kind', kind);
      if (status) params.set('status', status);
      params.set('page', page.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch questions');

      setQuestions(data.questions || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalQuestions(data.pagination?.total || 0);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, difficulty, kind, status, subject]);

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this question?')) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to archive');
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
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
            இருமொழி வினாக்கள், வகைகள், பாடப்பிரிவு மற்றும் சரிபார்ப்பு நிலை (Module 06).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/import"
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
          >
            <span>JSONL பதிவேற்றம்</span>
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

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search question in தமிழ் or English, ID, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={fetchQuestions}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>தேடு (Search)</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          {/* Subject Filter */}
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">அனைத்து பாடங்கள் (All Subjects)</option>
            <option value="sub-tamil">பொதுத் தமிழ் (General Tamil)</option>
            <option value="sub-polity">இந்திய ஆட்சியியல் (Polity)</option>
            <option value="sub-history">வரலாறு (History & Culture)</option>
            <option value="sub-aptitude">திறனறிவு (Aptitude & Mental)</option>
            <option value="sub-unit8">அலகு 8 (Unit 8 TN Culture)</option>
          </select>

          {/* Difficulty */}
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">கடினத்தன்மை (All Difficulties)</option>
            <option value="easy">எளிது (Easy)</option>
            <option value="medium">நடுத்தரம் (Medium)</option>
            <option value="hard">கடினம் (Hard)</option>
          </select>

          {/* Question Type */}
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">வினா வகை (All Types)</option>
            <option value="direct_mcq">நேரடி வினா (Direct MCQ)</option>
            <option value="statement_analysis">கூற்று ஆய்வு (Statement Analysis)</option>
            <option value="assertion_reason">கூற்று & காரணம் (Assertion & Reason)</option>
            <option value="match_the_following">பொருத்துக (Match the Following)</option>
            <option value="arrange_in_order">வரிசைப்படுத்துக (Arrange in Order)</option>
            <option value="passage_based">பத்தி வினா (Passage Based)</option>
          </select>

          {/* Verification Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">சரிபார்ப்பு நிலை (All Status)</option>
            <option value="draft">வரைவு (Draft)</option>
            <option value="under_review">ஆய்வில் உள்ளது (Under Review)</option>
            <option value="verified">சரிபார்க்கப்பட்டது (Verified)</option>
            <option value="published">வெளியிடப்பட்டது (Published)</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>காட்டப்படும் வினாக்கள்: <strong className="text-white">{questions.length}</strong> (மொத்தம்: {totalQuestions})</span>
          <span>பக்கம் {page} / {totalPages}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-slate-800/40 rounded-2xl border border-slate-700/60">
            வினாக்கள் ஏற்றப்படுகின்றன... (Loading questions...)
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
            <p>வினாக்கள் எதுவும் கிடைக்கவில்லை. (No questions found with selected filters).</p>
            <Link
              href="/admin/questions/new"
              className="inline-flex items-center space-x-2 text-amber-400 hover:underline"
            >
              <PlusCircle className="w-4 h-4" />
              <span>முதல் வினாவை உருவாக்கவும் (Create your first question)</span>
            </Link>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/70 hover:border-slate-600 transition-all space-y-3.5"
            >
              {/* Question Top Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
                    {q.id}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                    {q.kind.replace(/_/g, ' ').toUpperCase()}
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
                  {q.previous_year?.is_pyq && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                      PYQ: {q.previous_year.exam_name || q.previous_year.year}
                    </span>
                  )}
                </div>

                {/* Workflow Status Badge */}
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-medium ${
                      q.workflow?.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : q.workflow?.status === 'verified'
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {q.workflow?.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Bilingual Question Snippet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Tamil Question */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    தமிழ் வினா (Tamil)
                  </span>
                  <p className="text-slate-100 font-medium leading-relaxed break-words font-tamil">
                    {q.texts.ta?.question}
                  </p>
                </div>

                {/* English Question */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    English Question
                  </span>
                  <p className="text-slate-100 font-medium leading-relaxed break-words">
                    {q.texts.en?.question || <em className="text-slate-500">No English translation yet</em>}
                  </p>
                </div>
              </div>

              {/* Options & Answer Preview */}
              {q.texts.ta?.options && q.texts.ta.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {q.texts.ta.options.map((opt) => {
                    const isCorrect = q.answer?.correct_option_id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`p-2 rounded-lg border flex items-start space-x-2 ${
                          isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="font-bold shrink-0">{opt.id}.</span>
                        <span className="truncate">{opt.text}</span>
                        {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Marks: {q.question_settings?.marks} | Neg: {q.question_settings?.negative_marks}
                </span>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/questions/${q.id}/edit`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>திருத்து (Edit)</span>
                  </Link>

                  <button
                    onClick={() => handleArchive(q.id)}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    title="Archive Question"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-700"
            >
              முந்தைய பக்கம் (Prev)
            </button>
            <span className="text-xs text-slate-400 px-3">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-700"
            >
              அடுத்த பக்கம் (Next)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

