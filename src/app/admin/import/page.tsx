'use client';

import { useState, useRef, useMemo } from 'react';
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
  Info
} from 'lucide-react';
import { parseCSV } from '@/lib/csv-importer';

interface ValidationError {
  lineIndex: number;
  id?: string;
  errors: string[];
  raw: any;
}

interface ImportSummary {
  totalProcessed: number;
  importedCount: number;
  failedCount: number;
}

type ImportFormat = 'csv' | 'jsonl' | 'json';

export default function ImportCentrePage() {
  const [format, setFormat] = useState<ImportFormat>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [invalidRecords, setInvalidRecords] = useState<ValidationError[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute live preview rows when a file is selected
  const previewData = useMemo(() => {
    if (!fileContent.trim()) return null;

    if (format === 'csv') {
      try {
        const { headers, rows } = parseCSV(fileContent);
        return {
          type: 'csv' as const,
          totalRows: rows.length,
          headers: headers.slice(0, 10),
          previewRows: rows.slice(0, 3)
        };
      } catch {
        return null;
      }
    } else if (format === 'jsonl') {
      try {
        const lines = fileContent.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('//'));
        const samples = lines.slice(0, 3).map((l) => {
          try {
            return JSON.parse(l);
          } catch {
            return { parseError: 'Invalid JSON' };
          }
        });
        return {
          type: 'jsonl' as const,
          totalRows: lines.length,
          previewRows: samples
        };
      } catch {
        return null;
      }
    } else {
      try {
        const parsed = JSON.parse(fileContent);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        return {
          type: 'json' as const,
          totalRows: list.length,
          previewRows: list.slice(0, 3)
        };
      } catch {
        return null;
      }
    }
  }, [fileContent, format]);

  const handleFileSelection = (selectedFile: File) => {
    setSummary(null);
    setInvalidRecords([]);
    setStatusMessage(null);

    const isCsv = selectedFile.name.endsWith('.csv');
    const isJsonl = selectedFile.name.endsWith('.jsonl');
    const isJson = selectedFile.name.endsWith('.json');

    if (!isCsv && !isJsonl && !isJson) {
      alert('Please upload a valid .csv, .json, or .jsonl file');
      return;
    }

    if (isCsv) setFormat('csv');
    else if (isJsonl) setFormat('jsonl');
    else setFormat('json');

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

  const handleUploadAndValidate = async () => {
    if (!fileContent.trim()) {
      alert('File is empty or not selected.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(`Validating ${format.toUpperCase()} rows against TNPSC 17-field schema...`);

    try {
      const res = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fileContent,
          format: format
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process import');
      }

      setSummary(data.summary);
      setInvalidRecords(data.invalidRecords || []);
      setStatusMessage(null);
    } catch (err: any) {
      alert(err.message || 'Import error occurred');
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleTemplate = (targetFormat: ImportFormat = format) => {
    if (targetFormat === 'csv') {
      // Direct download of the Excel-compatible CSV with UTF-8 BOM for Tamil font support
      const csvContent =
        '\uFEFFid,question_ta,question_en,option_a,option_b,option_c,option_d,option_a_en,option_b_en,option_c_en,option_d_en,correct_answer,explanation,explanation_en,subject,standard,term,chapter,page,difficulty\n' +
        'TNPSC-TAM-6T1-001,"‘தமிழுக்கும் அமுதென்று பேர்! - அந்தத் தமிழ் இன்பத் தமிழ் எங்கள் உயிருக்கு நேர்!’ - என்ற வரிகளை இயற்றியவர் யார்?","Who authored the lines \'Tamilukkum Amudhendru Paer! ... Uyirukku Naer\'?","பாரதிதாசன்","பாரதியார்","நாமக்கல் கவிஞர்","வாணிதாசன்","Bharathidasan","Bharathiyar","Namakkal Kavignar","Vanidasan","A","தமிழுக்கும் அமுதென்று பேர் என்று பாடியவர் பாரதிதாசன். இவரது இயற்பெயர் சுப்புரத்தினம்.","Bharathidasan composed these lines. His original birth name was Subburathinam.","general_tamil","6","1","இன்பத்தமிழ்","2","easy"\n' +
        'TNPSC-POL-10-001,"இந்திய அரசியலமைப்பின் முகப்புரை எந்த அரசியலமைப்பு திருத்தச் சட்டத்தின் மூலம் ஒரே ஒரு முறை திருத்தப்பட்டது?","Through which Constitutional Amendment Act was the Preamble of the Indian Constitution amended only once?","42-வது திருத்தச் சட்டம், 1976","44-வது திருத்தச் சட்டம், 1978","52-வது திருத்தச் சட்டம், 1985","86-வது திருத்தச் சட்டம், 2002","42nd Amendment Act, 1976","44th Amendment Act, 1978","52nd Amendment Act, 1985","86th Amendment Act, 2002","A","1976-ஆம் ஆண்டு 42-வது அரசியலமைப்பு திருத்தச் சட்டத்தின்படி முகப்புரையில் \'சமதர்ம, சமயச்சார்பற்ற, ஒருமைப்பாடு\' ஆகிய மூன்று புதிய சொற்கள் சேர்க்கப்பட்டன.","The Preamble was amended once by the 42nd Constitutional Amendment Act of 1976, adding Socialist, Secular, and Integrity.","indian_polity","10","1","இந்திய அரசியலமைப்பு","174","medium"\n' +
        'TNPSC-APT-LCM-001,"18, 24 மற்றும் 30 ஆகிய எண்களின் மீப்பெரு பொது வகுத்தி (HCF / மீ.பொ.வ) காண்க.","Find the Highest Common Factor (HCF) of 18, 24, and 30.","6","12","3","360","6","12","3","360","A","18 = 2 x 3^2, 24 = 2^3 x 3, 30 = 2 x 3 x 5. பொதுக் காரணிகள் 2 x 3 = 6.","Prime factors: 18 = 2 x 3^2, 24 = 2^3 x 3, 30 = 2 x 3 x 5. Common prime factor = 2 x 3 = 6.","aptitude","6","2","எண்கள் மற்றும் மீ.பொ.வ","42","easy"\n';

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tnpsc_sample_questions_import.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const sampleRecord = {
      id: 'TNPSC-2025-TAM-6T1-001',
      schema_version: '1.0.0',
      kind: 'direct_mcq',
      level: 'prelims',
      difficulty: 'easy',
      language_status: 'bilingual',
      exam_mappings: [{ exam_id: 'group_4', is_relevant: true }],
      syllabus: {
        subject_id: 'general_tamil',
        class_id: 'std-6th',
        term_id: 'std-6th-term-1',
        chapter_id: 'inbathamil'
      },
      texts: {
        ta: {
          question:
            '‘தமிழுக்கும் அமுதென்று பேர்! - அந்தத் தமிழ் இன்பத் தமிழ் எங்கள் உயிருக்கு நேர்!’ - என்ற வரிகளை இயற்றியவர் யார்?',
          options: [
            { id: 'A', text: 'பாரதிதாசன்' },
            { id: 'B', text: 'பாரதியார்' },
            { id: 'C', text: 'நாமக்கல் கவிஞர்' },
            { id: 'D', text: 'வாணிதாசன்' }
          ],
          explanation: 'தமிழுக்கும் அமுதென்று பேர் என்று பாடியவர் பாரதிதாசன்.'
        },
        en: {
          question:
            'Who authored the lines "Tamilukkum Amudhendru Paer! ... Uyirukku Naer"?',
          options: [
            { id: 'A', text: 'Bharathidasan' },
            { id: 'B', text: 'Bharathiyar' },
            { id: 'C', text: 'Namakkal Kavignar' },
            { id: 'D', text: 'Vanidasan' }
          ],
          explanation: 'Bharathidasan composed these famous lines.'
        }
      },
      answer: {
        correct_option_id: 'A'
      },
      question_settings: {
        marks: 1.5,
        negative_marks: 0.0,
        time_guideline_seconds: 54
      },
      source: {
        book: 'Samacheer Kalvi 6th Standard Tamil',
        standard: '6',
        term: '1',
        page_number: '2',
        edition: '2025 Revised Edition'
      },
      tags: ['tamil', 'bharathidasan', 'std-6', 'term-1'],
      workflow: {
        status: 'draft',
        verification_comments: []
      }
    };

    let blob: Blob;
    let filename: string;

    if (targetFormat === 'jsonl') {
      const line = JSON.stringify(sampleRecord);
      blob = new Blob([line + '\n'], { type: 'application/x-ndjson;charset=utf-8;' });
      filename = 'tnpsc_sample_questions.jsonl';
    } else {
      blob = new Blob([JSON.stringify([sampleRecord], null, 2)], {
        type: 'application/json;charset=utf-8;'
      });
      filename = 'tnpsc_sample_questions.json';
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadRejectedRecords = () => {
    if (invalidRecords.length === 0) return;

    if (format === 'csv') {
      // Export rejected rows with reasons
      const headers = ['line_number', 'question_id', 'errors', 'raw_question', 'raw_answer'];
      const rows = invalidRecords.map((rec) => {
        const row = rec.raw || {};
        const qText = row.question_ta || row.question || JSON.stringify(row.texts || '');
        const ans = row.correct_answer || row.answer || '';
        return [
          rec.lineIndex,
          `"${(rec.id || '').replace(/"/g, '""')}"`,
          `"${rec.errors.join('; ').replace(/"/g, '""')}"`,
          `"${String(qText).replace(/"/g, '""')}"`,
          `"${String(ans).replace(/"/g, '""')}"`
        ].join(',');
      });

      const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tnpsc_rejected_records_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const lines = invalidRecords.map((rec) => JSON.stringify(rec.raw)).join('\n');
      const blob = new Blob([lines + '\n'], { type: 'application/x-ndjson;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tnpsc_rejected_records_${Date.now()}.jsonl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <span>Phase 8</span>
            <span>•</span>
            <span>Excel / CSV & JSON Bulk Intake</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UploadCloud className="w-7 h-7 text-amber-400" />
            Bulk Question Import Centre
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Excel / CSV அல்லது JSON மூலம் நூற்றுக்கணக்கான வினாக்களை ஒரே கிளிக்கில் பதிவேற்றம் செய்யலாம்.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => downloadSampleTemplate('csv')}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-700/80 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Sample CSV (Excel)</span>
          </button>
          <button
            onClick={() => downloadSampleTemplate('jsonl')}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>Sample JSONL</span>
          </button>
          <Link
            href="/admin/verification"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium rounded-lg border border-amber-500/30 transition"
          >
            <span>Verification Centre</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Import Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Format selection and File dropzone */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span>Select Format / வடிவம்:</span>
              </label>
              <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                    format === 'csv'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV (Excel)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('jsonl')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                    format === 'jsonl'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>JSONL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                    format === 'json'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                dragOver
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.jsonl"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud
                className={`w-12 h-12 mx-auto mb-3 ${
                  format === 'csv' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <h3 className="text-sm font-semibold text-slate-200">
                {file ? file.name : 'Click to select or drag and drop your file'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports <strong className="text-emerald-400">.csv (Excel)</strong>,{' '}
                <strong className="text-amber-400">.jsonl</strong>, and{' '}
                <strong className="text-amber-400">.json</strong> with bilingual Tamil & English
                support.
              </p>
              {file && (
                <div className="mt-3 inline-flex items-center space-x-2 text-xs text-emerald-300 bg-emerald-500/15 px-3 py-1.5 rounded-full border border-emerald-500/30">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>
                    {(file.size / 1024).toFixed(1)} KB ready • Format: {format.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Live Data Preview Section */}
            {previewData && (
              <div className="mt-5 p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Live Pre-Import Preview
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      {previewData.totalRows} question{previewData.totalRows !== 1 ? 's' : ''} detected
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Showing first 3 rows</span>
                </div>

                {previewData.type === 'csv' && (
                  <div className="overflow-x-auto max-h-56 border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">வினா / Question</th>
                          <th className="py-2 px-3">A</th>
                          <th className="py-2 px-3">B</th>
                          <th className="py-2 px-3">C</th>
                          <th className="py-2 px-3">D</th>
                          <th className="py-2 px-3">விடை</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {previewData.previewRows.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-slate-800/40 font-mono text-[11px]">
                            <td className="py-2 px-3 text-amber-400 font-bold">{rIdx + 1}</td>
                            <td className="py-2 px-3 text-slate-200 font-sans max-w-xs truncate">
                              {row.question_ta || row.question || row['வினா'] || 'N/A'}
                            </td>
                            <td className="py-2 px-3 max-w-[100px] truncate">
                              {row.option_a || row['விடை_அ'] || '-'}
                            </td>
                            <td className="py-2 px-3 max-w-[100px] truncate">
                              {row.option_b || row['விடை_ஆ'] || '-'}
                            </td>
                            <td className="py-2 px-3 max-w-[100px] truncate">
                              {row.option_c || row['விடை_இ'] || '-'}
                            </td>
                            <td className="py-2 px-3 max-w-[100px] truncate">
                              {row.option_d || row['விடை_ஈ'] || '-'}
                            </td>
                            <td className="py-2 px-3 font-bold text-emerald-400">
                              {row.correct_answer || row['சரியான_விடை'] || row.key || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewData.type !== 'csv' && (
                  <div className="overflow-x-auto max-h-56 p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800">
                    <pre>{JSON.stringify(previewData.previewRows, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
              <span className="text-xs text-slate-400">
                Imported questions will be saved with status:{' '}
                <strong className="text-amber-400">Draft</strong> for verification.
              </span>
              <button
                type="button"
                onClick={handleUploadAndValidate}
                disabled={!file || isProcessing}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow transition ${
                  !file || isProcessing
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : format === 'csv'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing & Validating Batch...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Validate & Import Batch ({format.toUpperCase()})</span>
                  </>
                )}
              </button>
            </div>

            {statusMessage && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Results Summary & Breakdown */}
          {summary && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                  <span className="text-xs text-slate-400 uppercase font-medium">
                    Total Processed
                  </span>
                  <p className="text-2xl font-bold text-white mt-1">{summary.totalProcessed}</p>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl p-4">
                  <span className="text-xs text-emerald-400 uppercase font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Successfully Staged
                  </span>
                  <p className="text-2xl font-bold text-emerald-300 mt-1">
                    {summary.importedCount}
                  </p>
                </div>
                <div
                  className={`border rounded-xl p-4 ${
                    summary.failedCount > 0
                      ? 'bg-rose-950/40 border-rose-700/60'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <span
                    className={`text-xs uppercase font-medium flex items-center gap-1 ${
                      summary.failedCount > 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Validation Failures
                  </span>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      summary.failedCount > 0 ? 'text-rose-300' : 'text-slate-400'
                    }`}
                  >
                    {summary.failedCount}
                  </p>
                </div>
              </div>

              {/* Action notice after import */}
              {summary.importedCount > 0 && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-300">
                      {summary.importedCount} questions successfully staged as Drafts!
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Review side-by-side bilingual details and publish them to tests in the
                      Verification Centre.
                    </p>
                  </div>
                  <Link
                    href="/admin/verification"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
                  >
                    <span>Open Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Validation Failure Details with Download Option */}
          {invalidRecords.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-800/80 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    Validation Errors ({invalidRecords.length} records rejected)
                  </h3>
                  <p className="text-xs text-rose-200/70 mt-1">
                    Zero silent discards: Review the exact errors below or download the rejected
                    records file to fix and re-upload.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadRejectedRecords}
                  className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-medium rounded-lg border border-rose-700/80 flex items-center gap-1.5 transition self-start sm:self-center"
                >
                  <Download className="w-4 h-4 text-rose-300" />
                  <span>Download Rejected ({format.toUpperCase()})</span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-96 border border-rose-900/50 rounded-lg">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-rose-900/40 text-rose-200 font-semibold border-b border-rose-900/80 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Row #</th>
                      <th className="py-2.5 px-3">Question ID</th>
                      <th className="py-2.5 px-3">Failure Reason(s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-950">
                    {invalidRecords.map((item, idx) => (
                      <tr key={idx} className="hover:bg-rose-950/40 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                          #{item.lineIndex}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {item.id || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3">
                          <ul className="list-disc list-inside space-y-0.5 text-rose-300 font-mono text-[11px]">
                            {item.errors.map((err, eIdx) => (
                              <li key={eIdx}>{err}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Instructions & Schema Guidelines Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              CSV Spreadsheet Format Guide
            </h3>
            <p className="text-xs text-slate-400">
              Excel அல்லது Google Sheets-இல் பின்வரும் நெடுவரிசைகளை (Columns) பயன்படுத்தி நேரடியாக
              ஏற்றலாம்:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800">
                <span className="font-mono text-emerald-400 font-semibold">
                  question_ta / வினா
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  வினா உரை (கட்டாயம்). தமிழ் வினாக்கள் இங்கு இருக்க வேண்டும்.
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800">
                <span className="font-mono text-emerald-400 font-semibold">
                  option_a, option_b, option_c, option_d
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  4 விடைகளும் கட்டாயம் (விடை_அ, விடை_ஆ போன்ற தமிழ் பெயர்களும் செல்லுபடியாகும்).
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800">
                <span className="font-mono text-emerald-400 font-semibold">
                  correct_answer / சரியான_விடை
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  A, B, C, D அல்லது 1, 2, 3, 4 அல்லது அ, ஆ, இ, ஈ.
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800">
                <span className="font-mono text-slate-300 font-semibold">
                  explanation, subject, standard, term, chapter, page
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  விளக்கம் மற்றும் சமச்சீர் கல்வி புத்தக விவரங்கள் (விருப்பமானது).
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => downloadSampleTemplate('csv')}
                className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-xs rounded-lg border border-emerald-500/40 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>மாதிரி CSV கோப்பை பதிவிறக்குக</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              தானியங்கி மொழிபெயர்ப்பு & குறியீடுகள்
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ஒரு வினாவிற்கு <code className="text-slate-200">question_en</code> மற்றும்{' '}
              <code className="text-slate-200">option_a_en</code> கொடுக்கப்பட்டால் அது தானாகவே{' '}
              <span className="text-emerald-400 font-medium">Bilingual</span> ஆக மாற்றப்படும்.
              இல்லையெனில் <span className="text-amber-400 font-medium">Tamil Only</span> ஆகக்
              கருதப்படும்.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
