'use client';

import { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft,
  Info
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

  // 2. Exam Mappings & Scope
  const [examScope, setExamScope] = useState<'all_groups' | 'selected'>(
    initialData?.syllabus?.exam_scope === 'all_groups' ? 'all_groups' : 'selected'
  );
  const [exams, setExams] = useState<string[]>(
    initialData?.exam_mappings?.map((m) => m.exam_id) || ['group_4']
  );
  const [availableExams, setAvailableExams] = useState<any[]>([]);

  // 3. Dynamic Syllabus Nodes & Scope Hierarchy
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [classId, setClassId] = useState(initialData?.syllabus?.class_id || 'std-6th');
  const [subjectId, setSubjectId] = useState(initialData?.syllabus?.subject_id || 'general_tamil');

  const [termScope, setTermScope] = useState<'all' | 'specific'>(
    initialData?.syllabus?.term_scope || (initialData?.syllabus?.term_id ? 'specific' : 'all')
  );
  const [termId, setTermId] = useState(initialData?.syllabus?.term_id || 'std-6th-term-1');

  const [unitScope, setUnitScope] = useState<'all' | 'specific'>(
    initialData?.syllabus?.unit_scope || (initialData?.syllabus?.unit_id ? 'specific' : 'all')
  );
  const [unitId, setUnitId] = useState(initialData?.syllabus?.unit_id || 'std-6-t1-i1');

  const [lessonScope, setLessonScope] = useState<'all' | 'specific'>(
    initialData?.syllabus?.lesson_scope || (initialData?.syllabus?.lesson_id ? 'specific' : 'all')
  );
  const [lessonId, setLessonId] = useState(initialData?.syllabus?.lesson_id || '');

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

  // Load syllabus taxonomy and exams on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [resSyllabus, resExams] = await Promise.all([
          fetch('/api/admin/syllabus'),
          fetch('/api/admin/exams'),
        ]);

        const dataSyllabus = await resSyllabus.json();
        if (dataSyllabus.nodes) setAllNodes(dataSyllabus.nodes);

        const dataExams = await resExams.json();
        if (dataExams.exams) setAvailableExams(dataExams.exams);
      } catch (err) {
        console.error('Failed to load metadata in QuestionEditor:', err);
      }
    }
    loadMetadata();
  }, []);

  // Filtered dropdown lists based on parent IDs
  const classOptions = useMemo(() => {
    return allNodes.filter((n) => n.level === 'class');
  }, [allNodes]);

  const subjectOptions = useMemo(() => {
    return allNodes.filter((n) => n.level === 'subject');
  }, [allNodes]);

  const termOptions = useMemo(() => {
    if (!classId) return [];
    return allNodes.filter((n) => n.level === 'term' && n.parent_id === classId);
  }, [allNodes, classId]);

  const unitOptions = useMemo(() => {
    if (!termId || termScope === 'all') return [];
    return allNodes.filter((n) => n.level === 'unit' && n.parent_id === termId);
  }, [allNodes, termId, termScope]);

  const lessonOptions = useMemo(() => {
    if (!unitId || unitScope === 'all' || termScope === 'all') return [];
    return allNodes.filter((n) => n.level === 'lesson' && n.parent_id === unitId);
  }, [allNodes, unitId, unitScope, termScope]);

  // Handle Class change
  const handleClassChange = (newClass: string) => {
    setClassId(newClass);
    setTermScope('all');
    setUnitScope('all');
    setLessonScope('all');
  };

  // Handle Term change
  const handleTermChange = (val: string) => {
    if (val === 'all') {
      setTermScope('all');
      setUnitScope('all');
      setLessonScope('all');
    } else {
      setTermScope('specific');
      setTermId(val);
      setUnitScope('all');
      setLessonScope('all');
    }
  };

  // Handle Unit change
  const handleUnitChange = (val: string) => {
    if (val === 'all') {
      setUnitScope('all');
      setLessonScope('all');
    } else {
      setUnitScope('specific');
      setUnitId(val);
      setLessonScope('all');
    }
  };

  // Handle Lesson change
  const handleLessonChange = (val: string) => {
    if (val === 'all') {
      setLessonScope('all');
      setLessonId('');
    } else {
      setLessonScope('specific');
      setLessonId(val);
    }
  };

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
      const isAllGroups = examScope === 'all_groups';
      const isAllTerms = termScope === 'all';
      const isAllIyals = isAllTerms || unitScope === 'all';
      const isAllLessons = isAllIyals || lessonScope === 'all';

      const examMappingsList = isAllGroups
        ? (availableExams.length > 0
            ? availableExams.map((e) => ({ exam_id: e.id, is_relevant: true }))
            : [
                { exam_id: 'group_4', is_relevant: true },
                { exam_id: 'group_2', is_relevant: true },
                { exam_id: 'group_2a', is_relevant: true },
                { exam_id: 'group_1', is_relevant: true },
              ])
        : exams.map((e) => ({ exam_id: e, is_relevant: true }));

      const payload = {
        id: id || undefined,
        schema_version: '1.0.0',
        kind,
        level: 'prelims',
        difficulty,
        exam_mappings: examMappingsList,
        syllabus: {
          exam_scope: isAllGroups ? 'all_groups' : 'selected',
          class_id: classId,
          subject_id: subjectId,
          term_id: isAllTerms ? null : termId || null,
          term_scope: isAllTerms ? 'all' : 'specific',
          unit_id: isAllIyals ? null : unitId || null,
          unit_scope: isAllIyals ? 'all' : 'specific',
          lesson_id: isAllLessons ? null : lessonId || null,
          lesson_scope: isAllLessons ? 'all' : 'specific',
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
      <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-5 shadow-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
          <Award className="w-4 h-4" />
          <span>1. வகைப்பாடு, தேர்வு மற்றும் பாடத்திட்ட படிநிலை (Classification & Hierarchy)</span>
        </h2>

        {/* Kind and Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
        </div>

        {/* Target Examination Scope */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">
              இலக்கு தேர்வுகள் (Target Examinations)
            </label>

            <label className="flex items-center space-x-2 text-xs font-semibold text-amber-300 cursor-pointer bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              <input
                type="checkbox"
                checked={examScope === 'all_groups'}
                onChange={(e) => setExamScope(e.target.checked ? 'all_groups' : 'selected')}
                className="rounded text-amber-500 focus:ring-0"
              />
              <span>All Groups / Common to All Groups (அனைத்து குரூப் தேர்வுகள்)</span>
            </label>
          </div>

          {examScope === 'all_groups' ? (
            <p className="text-xs text-amber-300/80 font-tamil">
              ✓ இவ்வினா அனைத்து தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணைய (TNPSC) குரூப் தேர்வுகளுக்கும் பொதுவானதாகக் கருதப்படும் (Group 1, 2, 2A, 4, etc.).
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              {(availableExams.length > 0 ? availableExams : [
                { id: 'group_4', title_en: 'Group 4', title_ta: 'குரூப் 4' },
                { id: 'group_2', title_en: 'Group 2', title_ta: 'குரூப் 2' },
                { id: 'group_2a', title_en: 'Group 2A', title_ta: 'குரூப் 2A' },
                { id: 'group_1', title_en: 'Group 1', title_ta: 'குரூப் 1' },
              ]).map((ex) => (
                <label
                  key={ex.id}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                    exams.includes(ex.id)
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={exams.includes(ex.id)}
                    onChange={() => toggleExam(ex.id)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>{ex.title_en} ({ex.title_ta})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Syllabus Hierarchy Cascading Selectors */}
        <div className="space-y-3 pt-1">
          <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">
            பாடத்திட்ட படிநிலை & பரந்த எல்லை (Syllabus Hierarchy & Broad Scope)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {/* Class */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">வகுப்பு (Class)</label>
              <select
                value={classId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {classOptions.length > 0 ? (
                  classOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title_ta || c.title_en}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="std-6th">6-ஆம் வகுப்பு (6th Std)</option>
                    <option value="std-7th">7-ஆம் வகுப்பு (7th Std)</option>
                    <option value="std-8th">8-ஆம் வகுப்பு (8th Std)</option>
                    <option value="std-9th">9-ஆம் வகுப்பு (9th Std)</option>
                    <option value="std-10th">10-ஆம் வகுப்பு (10th Std)</option>
                    <option value="std-11th">11-ஆம் வகுப்பு (11th Std)</option>
                    <option value="std-12th">12-ஆம் வகுப்பு (12th Std)</option>
                  </>
                )}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">பாடம் (Subject)</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {subjectOptions.length > 0 ? (
                  subjectOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title_ta || s.title_en}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="general_tamil">பொதுத் தமிழ் (General Tamil)</option>
                    <option value="sub-polity">இந்திய ஆட்சியியல் (Polity)</option>
                    <option value="sub-history">வரலாறு (History)</option>
                    <option value="sub-aptitude">திறனறிவு (Aptitude)</option>
                    <option value="sub-geography">புவியியல் (Geography)</option>
                    <option value="sub-economy">பொருளாதாரம் (Economy)</option>
                    <option value="sub-unit8">தமிழ் சமுதாய வரலாறு (Unit 8)</option>
                    <option value="sub-unit9">தமிழக நிர்வாகம் (Unit 9)</option>
                  </>
                )}
              </select>
            </div>

            {/* Term */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">பருவம் (Term)</label>
              <select
                value={termScope === 'all' ? 'all' : termId}
                onChange={(e) => handleTermChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Terms (அனைத்துப் பருவம்)</option>
                {termOptions.length > 0 ? (
                  termOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title_ta || t.title_en}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="std-6th-term-1">பருவம் 1 (Term 1)</option>
                    <option value="std-6th-term-2">பருவம் 2 (Term 2)</option>
                    <option value="std-6th-term-3">பருவம் 3 (Term 3)</option>
                  </>
                )}
              </select>
            </div>

            {/* Unit / Iyal */}
            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase block ${
                termScope === 'all' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                இயல் (Unit / Iyal)
              </label>
              <select
                value={termScope === 'all' || unitScope === 'all' ? 'all' : unitId}
                onChange={(e) => handleUnitChange(e.target.value)}
                disabled={termScope === 'all'}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="all">All Iyals in Term (அனைத்து இயல்)</option>
                {unitOptions.length > 0 ? (
                  unitOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title_ta || u.title_en}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="std-6-t1-i1">இயல் 1: தமிழ் தேன்</option>
                    <option value="std-6-t1-i2">இயல் 2: இயற்கை இன்பம்</option>
                    <option value="std-6-t1-i3">இயல் 3: எந்திர உலகம்</option>
                  </>
                )}
              </select>
            </div>

            {/* Lesson */}
            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase block ${
                termScope === 'all' || unitScope === 'all' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                பாடம் (Lesson)
              </label>
              <select
                value={termScope === 'all' || unitScope === 'all' || lessonScope === 'all' ? 'all' : lessonId}
                onChange={(e) => handleLessonChange(e.target.value)}
                disabled={termScope === 'all' || unitScope === 'all'}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="all">All Lessons in Iyal (அனைத்துப் பாடம்)</option>
                {lessonOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title_ta || l.title_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Scope Pill Summary */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-[11px]">
              Scope:{' '}
              <strong className="text-amber-400">
                {examScope === 'all_groups' ? 'All Groups' : exams.join(', ')}
              </strong>{' '}
              | {classId} | {subjectId} |{' '}
              <strong className={termScope === 'all' ? 'text-purple-400' : 'text-slate-200'}>
                {termScope === 'all' ? 'All Terms' : termId}
              </strong>{' '}
              →{' '}
              <strong className={unitScope === 'all' ? 'text-purple-400' : 'text-slate-200'}>
                {termScope === 'all' ? '— (Subject)' : unitScope === 'all' ? 'All Iyals' : unitId}
              </strong>{' '}
              →{' '}
              <strong className={lessonScope === 'all' ? 'text-purple-400' : 'text-slate-200'}>
                {termScope === 'all' || unitScope === 'all' ? '— (Unit)' : lessonScope === 'all' ? 'All Lessons' : lessonId || 'All Lessons'}
              </strong>
            </span>
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

