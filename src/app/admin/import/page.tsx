'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  Table,
  Check,
  Eye,
  Info,
  Layers,
  ShieldAlert,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { parseCSV } from '@/lib/csv-importer';

interface ValidationError {
  lineIndex: number;
  id?: string;
  errors: string[];
  raw: any;
}

interface ImportSummary {
  totalProcessed?: number;
  totalRecords?: number;
  importedCount?: number;
  validCount?: number;
  failedCount?: number;
  invalidCount?: number;
  duplicateInFileCount?: number;
  existingInDbCount?: number;
  missingTamilCount?: number;
  missingEnglishCount?: number;
  missingAnswerCount?: number;
  invalidSyllabusCount?: number;
}

type ImportFormat = 'jsonl' | 'json' | 'csv';
type MappingStrategy = 'fill_missing_with_common' | 'use_json_metadata' | 'override_with_common';

export default function ImportCentrePage() {
  const [format, setFormat] = useState<ImportFormat>('jsonl');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Validation Preview & Commit summaries
  const [previewSummary, setPreviewSummary] = useState<ImportSummary | null>(null);
  const [commitSummary, setCommitSummary] = useState<ImportSummary | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [invalidRecords, setInvalidRecords] = useState<ValidationError[]>([]);
  const [previewSample, setPreviewSample] = useState<any[]>([]);

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common Syllabus Hierarchy State
  const [mappingStrategy, setMappingStrategy] = useState<MappingStrategy>('fill_missing_with_common');

  // Hierarchy selections
  const [selectedExam, setSelectedExam] = useState('all_groups');
  const [selectedClass, setSelectedClass] = useState('std-6th');
  const [selectedSubject, setSelectedSubject] = useState('general_tamil');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedLesson, setSelectedLesson] = useState('all');

  // Dynamic syllabus nodes and exams from database
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [syllabusLoading, setSyllabusLoading] = useState(false);

  // Load syllabus taxonomy and exams on mount
  useEffect(() => {
    async function loadSyllabusAndExams() {
      setSyllabusLoading(true);
      try {
        const [resSyllabus, resExams] = await Promise.all([
          fetch('/api/admin/syllabus'),
          fetch('/api/admin/exams'),
        ]);

        const dataSyllabus = await resSyllabus.json();
        if (dataSyllabus.nodes) {
          setAllNodes(dataSyllabus.nodes);
        }

        const dataExams = await resExams.json();
        if (dataExams.exams) {
          setExams(dataExams.exams);
        }
      } catch (err) {
        console.error('Failed to load syllabus taxonomy or exams:', err);
      } finally {
        setSyllabusLoading(false);
      }
    }
    loadSyllabusAndExams();
  }, []);

  // Filtered dropdown lists based on parent IDs
  const classOptions = useMemo(() => {
    return allNodes.filter((n) => n.level === 'class');
  }, [allNodes]);

  const subjectOptions = useMemo(() => {
    return allNodes.filter((n) => n.level === 'subject');
  }, [allNodes]);

  const termOptions = useMemo(() => {
    if (!selectedClass) return [];
    return allNodes.filter((n) => n.level === 'term' && n.parent_id === selectedClass);
  }, [allNodes, selectedClass]);

  const unitOptions = useMemo(() => {
    if (!selectedTerm || selectedTerm === 'all') return [];
    return allNodes.filter((n) => n.level === 'unit' && n.parent_id === selectedTerm);
  }, [allNodes, selectedTerm]);

  const lessonOptions = useMemo(() => {
    if (!selectedUnit || selectedUnit === 'all') return [];
    return allNodes.filter((n) => n.level === 'lesson' && n.parent_id === selectedUnit);
  }, [allNodes, selectedUnit]);

  // Handle Class change -> reset lower levels
  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    setSelectedTerm('all');
    setSelectedUnit('all');
    setSelectedLesson('all');
  };

  // Handle Term change -> reset lower levels
  const handleTermChange = (newTerm: string) => {
    setSelectedTerm(newTerm);
    setSelectedUnit('all');
    setSelectedLesson('all');
  };

  // Handle Unit change -> reset lower level
  const handleUnitChange = (newUnit: string) => {
    setSelectedUnit(newUnit);
    setSelectedLesson('all');
  };

  // Handle Lesson change
  const handleLessonChange = (newLesson: string) => {
    setSelectedLesson(newLesson);
  };

  // Build complete common mapping payload with explicit scopes
  const buildCommonMappingPayload = () => {
    const isAllTerms = selectedTerm === 'all';
    const isAllIyals = isAllTerms || selectedUnit === 'all';
    const isAllLessons = isAllIyals || selectedLesson === 'all';

    return {
      exam_id: selectedExam,
      exam_scope: selectedExam === 'all_groups' ? 'all_groups' : 'selected',
      class_id: selectedClass,
      subject_id: selectedSubject,
      term_id: isAllTerms ? null : selectedTerm,
      term_scope: isAllTerms ? 'all' : 'specific',
      unit_id: isAllIyals ? null : selectedUnit,
      unit_scope: isAllIyals ? 'all' : 'specific',
      lesson_id: isAllLessons ? null : selectedLesson,
      lesson_scope: isAllLessons ? 'all' : 'specific',
    };
  };

  // Handle file selection
  const handleFileSelection = (selectedFile: File) => {
    setPreviewSummary(null);
    setCommitSummary(null);
    setInvalidRecords([]);
    setPreviewSample([]);
    setStatusMessage(null);

    const isCsv = selectedFile.name.endsWith('.csv');
    const isJsonl = selectedFile.name.endsWith('.jsonl');
    const isJson = selectedFile.name.endsWith('.json');

    if (!isCsv && !isJsonl && !isJson) {
      alert('Please upload a valid .jsonl, .json, or .csv file');
      return;
    }

    if (isJsonl) setFormat('jsonl');
    else if (isJson) setFormat('json');
    else setFormat('csv');

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent((e.target?.result as string) || '');
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  // Step 1: Preview & Validate
  const handlePreviewAndValidate = async () => {
    if (!fileContent.trim()) {
      alert('File is empty or not selected.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(`Validating questions and checking taxonomy against database...`);

    try {
      const commonMapping = buildCommonMappingPayload();

      const res = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fileContent,
          format,
          mode: 'validate_preview',
          commonMapping,
          mappingStrategy,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to validate import');
      }

      setPreviewSummary(data.summary);
      setInvalidRecords(data.invalidRecords || []);
      setPreviewSample(data.previewSample || []);
      setStatusMessage(null);
    } catch (err: any) {
      alert(err.message || 'Validation error occurred');
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Commit Import (CRITICAL: Status enters Draft / Pending Review)
  const handleCommitImport = async () => {
    if (!fileContent.trim()) {
      alert('No file content to import.');
      return;
    }

    if (
      !confirm(
        'Confirm Question Import?\n\nCRITICAL POLICY: All questions will be created in "Draft / Pending Review" status. No questions will be automatically published into student tests until verified.'
      )
    ) {
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Importing questions into Supabase in Draft status...');

    try {
      const commonMapping = buildCommonMappingPayload();

      const res = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fileContent,
          format,
          mode: 'commit',
          commonMapping,
          mappingStrategy,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to commit import');
      }

      setCommitSummary(data.summary);
      setBatchId(data.batchId);
      setInvalidRecords(data.invalidRecords || []);
      setStatusMessage(null);
    } catch (err: any) {
      alert(err.message || 'Import error occurred');
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <span>Module 04</span>
            <span>•</span>
            <span>Bulk Question Ingestion & Taxonomy Mapping</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UploadCloud className="w-7 h-7 text-amber-400" />
            <span>வினா பதிவேற்ற மையம் (Question Import Centre)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            வகுப்பு, பருவம், இயல் மற்றும் பாடம் சார்ந்த வரிசையில் வினாக்களை பதிவேற்றம் செய்து சரிபார்ப்புக்கு அனுப்புக.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/verification"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <span>சரிபார்ப்பு மையம் (Verification Centre)</span>
          </Link>
        </div>
      </div>

      {/* Critical Import Rule Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-300">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-400 block font-bold text-sm">
            Critical Workflow Rule: Questions Enter Draft / Pending Review
          </strong>
          <p className="text-slate-300 leading-relaxed font-tamil">
            JSON அல்லது JSONL கோப்பு மூலம் பதிவேற்றப்படும் அனைத்து வினாக்களும் தானாகவே <strong>Draft (வரைவு)</strong> நிலைக்கு செல்லும். எந்த ஒரு வினாவும் நேரடியாக வெளியிடப்படாது (Never auto-published). நிர்வாகிகள் சரிபார்ப்பு மையத்தில் (Verification Centre) ஆய்வு செய்த பின்னரே வினாக்கள் மாணவர் தேர்வுகளுக்கு வெளியிடப்படும்.
          </p>
        </div>
      </div>

      {/* Syllabus Taxonomy Hierarchy Mapping Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-5 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-700/60 pb-3">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Syllabus & Taxonomy Mapping (பாடத்திட்ட படிநிலை தேர்வு)
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Mapping Strategy:</span>
            <select
              value={mappingStrategy}
              onChange={(e) => setMappingStrategy(e.target.value as MappingStrategy)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="fill_missing_with_common">Option B1: Fill missing metadata only (Recommended)</option>
              <option value="override_with_common">Option B2: Override all with selected hierarchy</option>
              <option value="use_json_metadata">Option A: Rely strictly on JSON metadata</option>
            </select>
          </div>
        </div>

        {/* Dynamic Hierarchical Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* 1. Exam */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              1. தேர்வு (Exam)
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all_groups">All Groups / Common (அனைத்து குரூப் தேர்வுகள்)</option>
              {exams.length > 0 ? (
                exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title_en} ({ex.title_ta})
                  </option>
                ))
              ) : (
                <>
                  <option value="group_4">Group 4 (VAO & JA)</option>
                  <option value="group_2">Group 2 (Interview)</option>
                  <option value="group_2a">Group 2A (Non-Int)</option>
                  <option value="group_1">Group 1 (Services)</option>
                </>
              )}
            </select>
          </div>

          {/* 2. Class */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              2. வகுப்பு (Class)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
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

          {/* 3. Subject */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              3. பாடம் (Subject)
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
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

          {/* 4. Term */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              4. பருவம் (Term)
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => handleTermChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Terms (முழு பாடநூல் / அனைத்து பருவங்கள்)</option>
              {termOptions.length > 0 ? (
                termOptions.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.title_ta || term.title_en}
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

          {/* 5. Unit / Iyal */}
          <div className="space-y-1">
            <label className={`text-[11px] font-bold uppercase tracking-wider block ${
              selectedTerm === 'all' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              5. இயல் / அலகு (Iyal / Unit)
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => handleUnitChange(e.target.value)}
              disabled={selectedTerm === 'all'}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="all">All Iyals in this Term (இப்பருவத்தின் அனைத்து இயல்கள்)</option>
              {unitOptions.length > 0 ? (
                unitOptions.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.title_ta || unit.title_en}
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

          {/* 6. Lesson */}
          <div className="space-y-1">
            <label className={`text-[11px] font-bold uppercase tracking-wider block ${
              selectedTerm === 'all' || selectedUnit === 'all' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              6. பாடம் (Lesson)
            </label>
            <select
              value={selectedLesson}
              onChange={(e) => handleLessonChange(e.target.value)}
              disabled={selectedTerm === 'all' || selectedUnit === 'all'}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="all">All Lessons in this Iyal (இவ்வியலின் அனைத்து பாடங்கள்)</option>
              {lessonOptions.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title_ta || l.title_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active mapping preview badge */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-xs text-slate-300 space-y-2 shadow-inner">
          <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            <Info className="w-4 h-4 shrink-0" />
            <span>Active Mapping Scope Summary (தேர்ந்தெடுக்கப்பட்ட பாடத்திட்ட எல்லை)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
              🎯 Exam: {selectedExam === 'all_groups' ? 'All Groups / Common (அனைத்து குரூப்)' : selectedExam}
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
              📚 Class: {selectedClass}
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
              📖 Subject: {selectedSubject}
            </span>
            <span className="text-slate-600">→</span>
            <span className={`px-2.5 py-1 rounded-lg border ${
              selectedTerm === 'all'
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 font-semibold'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              🗓️ Term: {selectedTerm === 'all' ? 'All Terms (அனைத்துப் பருவம்)' : selectedTerm}
            </span>
            <span className="text-slate-600">→</span>
            <span className={`px-2.5 py-1 rounded-lg border ${
              selectedTerm === 'all'
                ? 'bg-slate-800/40 text-slate-500 border-slate-800'
                : selectedUnit === 'all'
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 font-semibold'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              📑 Unit: {selectedTerm === 'all' ? '— (Entire Subject)' : selectedUnit === 'all' ? 'All Iyals (அனைத்து இயல்)' : selectedUnit}
            </span>
            <span className="text-slate-600">→</span>
            <span className={`px-2.5 py-1 rounded-lg border ${
              selectedTerm === 'all' || selectedUnit === 'all'
                ? 'bg-slate-800/40 text-slate-500 border-slate-800'
                : selectedLesson === 'all'
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 font-semibold'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              📝 Lesson: {selectedTerm === 'all' || selectedUnit === 'all' ? '— (Entire Unit)' : selectedLesson === 'all' ? 'All Lessons (அனைத்துப் பாடம்)' : selectedLesson}
            </span>
          </div>
        </div>
      </div>

      {/* File Upload Zone */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Upload Question Dataset (.jsonl, .json, .csv)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Format:</span>
            {(['jsonl', 'json', 'csv'] as ImportFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase cursor-pointer ${
                  format === fmt
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Drag & Drop Container */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-3 cursor-pointer transition ${
            dragOver
              ? 'border-amber-400 bg-amber-500/10'
              : file
              ? 'border-emerald-500/60 bg-emerald-500/5'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
            accept=".jsonl,.json,.csv"
            className="hidden"
          />

          <div className="p-4 rounded-2xl bg-slate-800 text-amber-400 border border-slate-700">
            <UploadCloud className="w-8 h-8" />
          </div>

          {file ? (
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Selected: {file.name}</span>
              </p>
              <p className="text-xs text-slate-400">
                Size: {(file.size / 1024).toFixed(1)} KB | Format: {format.toUpperCase()}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-slate-200">
                Click to browse or drag and drop your question file here
              </p>
              <p className="text-xs text-slate-400">
                Supports Standard TNPSC JSON, JSONL (1 line per question), and Excel UTF-8 CSV
              </p>
            </div>
          )}
        </div>

        {/* Validation and Commit Action Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <span className="text-xs text-slate-400">
            {isProcessing ? statusMessage : file ? 'File loaded. Run validation check before committing.' : 'Select a file to begin.'}
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreviewAndValidate}
              disabled={!file || isProcessing}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer disabled:opacity-40"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>1. Preview & Validate Records</span>
            </button>

            <button
              onClick={handleCommitImport}
              disabled={!file || isProcessing || (previewSummary && previewSummary.validCount === 0)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-2 cursor-pointer disabled:opacity-40 shadow-lg shadow-amber-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Import into Drafts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation Preview Dashboard */}
      {previewSummary && (
        <div className="p-6 rounded-3xl bg-slate-800/90 border border-indigo-500/30 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pre-Import Validation Breakdown
              </h3>
            </div>
            <span className="text-xs text-indigo-300 font-mono">
              Total Records: {previewSummary.totalRecords}
            </span>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Valid Questions</span>
              <span className="text-lg font-bold text-emerald-400">{previewSummary.validCount || 0}</span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Invalid Records</span>
              <span className="text-lg font-bold text-rose-400">{previewSummary.invalidCount || 0}</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Duplicates in File</span>
              <span className="text-lg font-bold text-amber-400">{previewSummary.duplicateInFileCount || 0}</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Existing in DB</span>
              <span className="text-lg font-bold text-purple-400">{previewSummary.existingInDbCount || 0}</span>
            </div>

            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Missing Tamil</span>
              <span className="text-lg font-bold text-blue-400">{previewSummary.missingTamilCount || 0}</span>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Invalid Taxonomy</span>
              <span className="text-lg font-bold text-cyan-400">{previewSummary.invalidSyllabusCount || 0}</span>
            </div>
          </div>

          {/* Sample Valid Records Preview */}
          {previewSample.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Sample Valid Records Preview ({previewSample.length} shown)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {previewSample.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-amber-400">{q.id}</span>
                      <span className="text-indigo-300 font-mono text-[10px]">
                        [{q.syllabus?.exam_scope === 'all_groups' ? 'All Groups' : q.exam_mappings?.map((m: any) => m.exam_id).join(', ')} | {q.syllabus?.term_scope === 'all' ? 'All Terms' : q.syllabus?.term_id || 'All Terms'} → {q.syllabus?.unit_scope === 'all' ? 'All Iyals' : q.syllabus?.unit_id || 'All Iyals'} → {q.syllabus?.lesson_scope === 'all' ? 'All Lessons' : q.syllabus?.lesson_id || 'All Lessons'}]
                      </span>
                    </div>
                    <p className="text-slate-200 font-tamil truncate">{q.texts?.ta?.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invalid Records Error Table */}
          {invalidRecords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Validation Errors Detected ({invalidRecords.length} records)</span>
              </h4>
              <div className="max-h-60 overflow-y-auto border border-rose-500/30 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-950/40 text-rose-200 border-b border-rose-900/60 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Line #</th>
                      <th className="p-2.5">Question ID</th>
                      <th className="p-2.5">Errors / Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/90 text-slate-300">
                    {invalidRecords.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        <td className="p-2.5 font-mono text-slate-400">{item.lineIndex}</td>
                        <td className="p-2.5 font-mono text-amber-400">{item.id || 'N/A'}</td>
                        <td className="p-2.5 text-rose-300 space-y-0.5">
                          {item.errors.map((e, eIdx) => (
                            <div key={eIdx}>{e}</div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Successful Commit Completion Banner */}
      {commitSummary && (
        <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-7 h-7 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">Import Committed Successfully!</h3>
              <p className="text-xs text-emerald-300">
                Batch ID: <strong className="font-mono">{batchId}</strong> • {commitSummary.importedCount} questions
                imported into <strong>Draft / Pending Review</strong> status.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Link
              href="/admin/verification"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-emerald-900/40"
            >
              <span>சரிபார்ப்பு மையத்திற்குச் செல் (Go to Verification Centre)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/questions"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <span>வினா வங்கி (View in Question Bank)</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
