'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Question } from '@/lib/types/question';

interface QuestionEditorProps {
  initialData?: Partial<Question>;
  isEditMode?: boolean;
}

export default function QuestionEditor({ initialData, isEditMode = false }: QuestionEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Core Metadata
  const [id, setId] = useState(initialData?.id || '');
  const [kind, setKind] = useState(initialData?.kind || 'direct_mcq');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'medium');
  const [marks, setMarks] = useState(initialData?.question_settings?.marks || 1.5);
  const [negativeMarks, setNegativeMarks] = useState(initialData?.question_settings?.negative_marks || 0.0);
  const [status, setStatus] = useState(initialData?.workflow?.status || 'draft');

  // 2. Exam Mappings
  const [exams, setExams] = useState<string[]>(
    initialData?.exam_mappings?.map((m) => m.exam_id) || ['group_4']
  );

  // 3. Syllabus Mapping
  const [subjectId, setSubjectId] = useState(initialData?.syllabus?.subject_id || 'sub-polity');
  const [unitId, setUnitId] = useState(initialData?.syllabus?.unit_id || '');
  const [chapterId, setChapterId] = useState(initialData?.syllabus?.chapter_id || '');

  // 4. Texts - Tamil
  const [questionTa, setQuestionTa] = useState(initialData?.texts?.ta?.question || '');
  const [explanationTa, setExplanationTa] = useState(initialData?.texts?.ta?.explanation || '');
  const [optionsTa, setOptionsTa] = useState<Array<{ id: string; text: string }>>(
    initialData?.texts?.ta?.options || [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ]
  );

  // 5. Texts - English
  const [questionEn, setQuestionEn] = useState(initialData?.texts?.en?.question || '');
  const [explanationEn, setExplanationEn] = useState(initialData?.texts?.en?.explanation || '');
  const [optionsEn, setOptionsEn] = useState<Array<{ id: string; text: string }>>(
    initialData?.texts?.en?.options || [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ]
  );

  // 6. Answer
  const [correctOptionId, setCorrectOptionId] = useState(initialData?.answer?.correct_option_id || 'A');

  // 7. Source & PYQ
  const [bookSource, setBookSource] = useState(initialData?.source?.book || '');
  const [standardSource, setStandardSource] = useState(initialData?.source?.standard || '');
  const [isPyq, setIsPyq] = useState(initialData?.previous_year?.is_pyq || false);
  const [pyqExam, setPyqExam] = useState(initialData?.previous_year?.exam_name || 'TNPSC Group 4');
  const [pyqYear, setPyqYear] = useState<number | undefined>(initialData?.previous_year?.year || 2022);

  // Toggle Exam checkbox
  const toggleExam = (examId: string) => {
    if (exams.includes(examId)) {
      if (exams.length > 1) setExams(exams.filter((e) => e !== examId));
    } else {
      setExams([...exams, examId]);
    }
  };

  const handleOptionChange = (lang: 'ta' | 'en', index: number, text: string) => {
    if (lang === 'ta') {
      const updated = [...optionsTa];
      updated[index] = { ...updated[index], text };
      setOptionsTa(updated);
    } else {
      const updated = [...optionsEn];
      updated[index] = { ...updated[index], text };
      setOptionsEn(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = {
        id: id || undefined,
        schema_version: '1.0.0',
        kind,
        level: 'prelims',
        difficulty,
        exam_mappings: exams.map((e) => ({ exam_id: e, is_relevant: true })),
        syllabus: {
          subject_id: subjectId,
          unit_id: unitId || undefined,
          chapter_id: chapterId || undefined,
        },
        texts: {
          ta: {
            question: questionTa,
            options: optionsTa,
            explanation: explanationTa,
          },
          en: {
            question: questionEn,
            options: optionsEn,
            explanation: explanationEn,
          },
        },
        question_data: {},
        answer: {
          correct_option_id: correctOptionId,
        },
        question_settings: {
          marks: Number(marks),
          negative_marks: Number(negativeMarks),
          time_guideline_seconds: 60,
        },
        source: {
          book: bookSource,
          standard: standardSource,
        },
        previous_year: {
          is_pyq: isPyq,
          exam_name: isPyq ? pyqExam : undefined,
          year: isPyq ? Number(pyqYear) : undefined,
        },
        media: [],
        tags: [subjectId, difficulty],
        language_status: questionEn.trim() ? 'bilingual' : 'tamil_only',
        workflow: {
          status,
          verification_comments: [],
        },
        version: initialData?.version || 1,
      };

      const url = isEditMode ? `/api/admin/questions/${id}` : '/api/admin/questions';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save question');
      }

      setSuccessMsg(isEditMode ? 'Question updated successfully!' : 'Question created successfully!');
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/questions"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white">
              {isEditMode ? `வினா திருத்து (Edit Question): ${id}` : 'புதிய வினா உருவாக்கம் (Create Question)'}
            </h1>
            <p className="text-xs text-slate-400">இருமொழி உள்ளடக்கம் மற்றும் விடை அமைப்புகள்</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium focus:ring-1 focus:ring-amber-500"
          >
            <option value="draft">வரைவு (Draft)</option>
            <option value="under_review">ஆய்வு (Under Review)</option>
            <option value="verified">சரிபார்க்கப்பட்டது (Verified)</option>
            <option value="published">வெளியிடப்பட்டது (Published)</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'சேமிக்கப்படுகிறது...' : isEditMode ? 'புதுப்பி (Update)' : 'சேமி (Save Question)'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Section 1: Classification & Exam Configuration */}
      <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 shadow-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
          <Award className="w-4 h-4" />
          <span>1. தேர்வு மற்றும் பாடப் பிரிவு (Classification & Mapping)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Question Kind */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">வினா வகை (Question Kind)</label>
            <select
              value={kind}
              onChange={(e: any) => setKind(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="direct_mcq">நேரடி கொள்குறி வினா (Direct MCQ)</option>
              <option value="statement_analysis">கூற்று ஆய்வு (Statement Analysis)</option>
              <option value="assertion_reason">கூற்று & காரணம் (Assertion & Reason)</option>
              <option value="match_the_following">பொருத்துக (Match the Following)</option>
              <option value="arrange_in_order">வரிசைப்படுத்துக (Arrange in Order)</option>
              <option value="passage_based">பத்தி வினா (Passage Based)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">கடினத்தன்மை (Difficulty)</label>
            <select
              value={difficulty}
              onChange={(e: any) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="easy">எளிது (Easy)</option>
              <option value="medium">நடுத்தரம் (Medium)</option>
              <option value="hard">கடினம் (Hard)</option>
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">பாடம் (Subject)</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="sub-tamil">பொதுத் தமிழ் (General Tamil)</option>
              <option value="sub-polity">இந்திய ஆட்சியியல் (Indian Polity)</option>
              <option value="sub-history">வரலாறு மற்றும் பண்பாடு (History)</option>
              <option value="sub-aptitude">திறனறிவு (Aptitude & Mental Ability)</option>
              <option value="sub-unit8">அலகு 8 (Unit 8 TN Culture & History)</option>
            </select>
          </div>
        </div>

        {/* Target Examination Checkboxes */}
        <div className="pt-2">
          <label className="block text-slate-300 text-xs font-medium mb-2">
            இலக்கு தேர்வுகள் (Target Examinations)
          </label>
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { id: 'group_4', label: 'TNPSC Group 4 (VAO & JA)' },
              { id: 'group_2', label: 'TNPSC Group 2' },
              { id: 'group_2a', label: 'TNPSC Group 2A' },
            ].map((ex) => (
              <label
                key={ex.id}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                  exams.includes(ex.id)
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-medium'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={exams.includes(ex.id)}
                  onChange={() => toggleExam(ex.id)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>{ex.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Bilingual Question Content & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tamil Section */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              தமிழ் வடிவம் (Tamil Content)
            </h2>
            <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
              முதன்மையானது
            </span>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">வினா வாசகம் (Tamil Question Text) *</label>
            <textarea
              rows={4}
              required
              value={questionTa}
              onChange={(e) => setQuestionTa(e.target.value)}
              placeholder="எ.கா: இந்திய அரசியலமைப்பின் முகப்புரை எந்த அரசமைப்பு சட்டத்திருத்தத்தின் மூலம் முதன்முதலில் திருத்தப்பட்டது?"
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Tamil Options */}
          <div className="space-y-2.5 pt-2">
            <label className="block text-slate-300 text-xs font-medium">விடைக் குறிப்புகள் (Tamil Options)</label>
            {optionsTa.map((opt, idx) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <span className="w-7 text-center font-bold text-xs text-amber-400">{opt.id}.</span>
                <input
                  type="text"
                  required
                  value={opt.text}
                  onChange={(e) => handleOptionChange('ta', idx, e.target.value)}
                  placeholder={`விடை ${opt.id}`}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            ))}
          </div>

          {/* Tamil Explanation */}
          <div className="pt-2">
            <label className="block text-slate-300 text-xs font-medium mb-1.5">விளக்கக் குறிப்பு (Tamil Explanation)</label>
            <textarea
              rows={3}
              value={explanationTa}
              onChange={(e) => setExplanationTa(e.target.value)}
              placeholder="விடைக்கான பள்ளிப் பாடப்புத்தக ஆதார விளக்கம்..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* English Section */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              English Content
            </h2>
            <span className="text-[10px] text-slate-400 bg-slate-700/40 px-2 py-0.5 rounded border border-slate-700">
              Parallel Translation
            </span>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">Question Text (English)</label>
            <textarea
              rows={4}
              value={questionEn}
              onChange={(e) => setQuestionEn(e.target.value)}
              placeholder="e.g.: Through which Constitutional Amendment Act was the Preamble of the Indian Constitution amended for the first time?"
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* English Options */}
          <div className="space-y-2.5 pt-2">
            <label className="block text-slate-300 text-xs font-medium">Answer Options (English)</label>
            {optionsEn.map((opt, idx) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <span className="w-7 text-center font-bold text-xs text-indigo-400">{opt.id}.</span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange('en', idx, e.target.value)}
                  placeholder={`Option ${opt.id}`}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* English Explanation */}
          <div className="pt-2">
            <label className="block text-slate-300 text-xs font-medium mb-1.5">Explanation (English)</label>
            <textarea
              rows={3}
              value={explanationEn}
              onChange={(e) => setExplanationEn(e.target.value)}
              placeholder="Detailed authentic textbook reference explanation..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Answer Key & Marking Settings */}
      <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 shadow-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>3. சரியான விடை & மதிப்பெண் (Correct Answer Key & Scoring)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* Select Correct Option */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">சரியான விடை தெரிவு (Correct Answer Key) *</label>
            <div className="flex space-x-3">
              {['A', 'B', 'C', 'D'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCorrectOptionId(key)}
                  className={`w-12 h-10 rounded-xl font-bold text-sm transition-all border ${
                    correctOptionId === key
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Marks */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">மதிப்பெண் (Marks Awarded)</label>
            <input
              type="number"
              step="0.25"
              value={marks}
              onChange={(e) => setMarks(parseFloat(e.target.value) || 1.5)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Negative Marks */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">எதிர்மறை மதிப்பெண் (Negative Marks)</label>
            <input
              type="number"
              step="0.25"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Authenticity Source & Previous Year Question (PYQ) */}
      <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 shadow-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>4. மூல ஆதாரம் & முந்தைய வினாத்தாள் குறிப்பு (Source & PYQ Metadata)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">பாடநூல் / ஆதாரம் (Book / Source)</label>
            <input
              type="text"
              value={bookSource}
              onChange={(e) => setBookSource(e.target.value)}
              placeholder="e.g. 10th Standard Samacheer Kalvi Social Science (Civics Unit 1)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">வகுப்பு / பருவம் (Standard / Term)</label>
            <input
              type="text"
              value={standardSource}
              onChange={(e) => setStandardSource(e.target.value)}
              placeholder="e.g. 10th Standard Term 1, Page 164"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* PYQ Toggle & Fields */}
        <div className="pt-3 border-t border-slate-700/60 space-y-3 text-xs">
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPyq}
              onChange={(e) => setIsPyq(e.target.checked)}
              className="rounded text-amber-500 focus:ring-0"
            />
            <span className="font-semibold text-slate-200">
              இது முந்தைய ஆண்டு TNPSC வினாத்தாளில் கேட்கப்பட்ட வினாவா? (Is this a Previous Year Question?)
            </span>
          </label>

          {isPyq && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div>
                <label className="block text-slate-300 font-medium mb-1">தேர்வு பெயர் (PYQ Exam Name)</label>
                <input
                  type="text"
                  value={pyqExam}
                  onChange={(e) => setPyqExam(e.target.value)}
                  placeholder="e.g. TNPSC Group 4 - 2022"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-purple-500/40 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">ஆண்டு (Year)</label>
                <input
                  type="number"
                  value={pyqYear || 2022}
                  onChange={(e) => setPyqYear(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-purple-500/40 rounded-lg text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
        <Link
          href="/admin/questions"
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
        >
          ரத்து செய் (Cancel)
        </Link>
        <div className="flex items-center space-x-3">
          <select
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium focus:ring-1 focus:ring-amber-500"
          >
            <option value="draft">வரைவு (Draft)</option>
            <option value="under_review">ஆய்வு (Under Review)</option>
            <option value="verified">சரிபார்க்கப்பட்டது (Verified)</option>
            <option value="published">வெளியிடப்பட்டது (Published)</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'சேமிக்கப்படுகிறது...' : isEditMode ? 'புதுப்பி (Update)' : 'சேமி (Save Question)'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

