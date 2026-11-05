'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Save, AlertCircle } from 'lucide-react';

interface EditPaperDetailsModalProps {
  paper: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedPaper: any) => void;
}

export default function EditPaperDetailsModal({
  paper,
  isOpen,
  onClose,
  onUpdated,
}: EditPaperDetailsModalProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [titleEn, setTitleEn] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [examId, setExamId] = useState('');
  const [examGroup, setExamGroup] = useState('');
  const [year, setYear] = useState(2024);
  const [dateHeld, setDateHeld] = useState('');
  const [paperCode, setPaperCode] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [totalMarks, setTotalMarks] = useState(300);
  const [expectedQuestionCount, setExpectedQuestionCount] = useState(200);
  const [highYieldTopics, setHighYieldTopics] = useState('');
  const [instructionsTa, setInstructionsTa] = useState('');
  const [instructionsEn, setInstructionsEn] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await fetch('/api/admin/exams');
        const data = await res.json();
        if (data.exams) setExams(data.exams);
      } catch (err) {
        console.error('Failed to load exams:', err);
      }
    }

    if (isOpen && paper) {
      loadExams();
      setTitleEn(paper.title_en || '');
      setTitleTa(paper.title_ta || '');
      setExamId(paper.exam_id || 'group_4');
      setExamGroup(paper.exam_group || 'Group 4');
      setYear(paper.year || 2024);
      setDateHeld(paper.date_held ? String(paper.date_held).split('T')[0] : '');
      setPaperCode(paper.paper_code || '');
      setDurationMinutes(paper.duration_minutes || 180);
      setTotalMarks(paper.total_marks || 300);
      setExpectedQuestionCount(paper.expected_question_count || 200);
      setHighYieldTopics(
        Array.isArray(paper.high_yield_topics) ? paper.high_yield_topics.join(', ') : ''
      );
      setInstructionsTa(paper.instructions_ta || '');
      setInstructionsEn(paper.instructions_en || '');
      setStatus(paper.status || 'draft');
      setErrorMsg('');
    }
  }, [isOpen, paper]);

  if (!isOpen || !paper) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleTa.trim() || !titleEn.trim()) {
      setErrorMsg('Please enter both Tamil and English titles.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const topicsArray = highYieldTopics
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch(`/api/admin/pyq/${paper.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en: titleEn.trim(),
          title_ta: titleTa.trim(),
          exam_id: examId,
          exam_group: examGroup,
          year: Number(year),
          date_held: dateHeld || null,
          paper_code: paperCode.trim(),
          duration_minutes: Number(durationMinutes),
          total_marks: Number(totalMarks),
          expected_question_count: Number(expectedQuestionCount),
          instructions_en: instructionsEn.trim(),
          instructions_ta: instructionsTa.trim(),
          high_yield_topics: topicsArray,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update PYQ paper');
      }

      onUpdated(data.paper);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-850">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                வினாத்தாள் விவரங்களை மாற்று (Edit Paper Details)
              </h2>
              <span className="font-mono text-[10px] text-amber-400">{paper.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Titles */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                தமிழ் தலைப்பு (Title in Tamil) *
              </label>
              <input
                type="text"
                required
                value={titleTa}
                onChange={(e) => setTitleTa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-tamil focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                English Title *
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Exam, Year, Code, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">தேர்வு (Exam) *</label>
              <select
                value={examId}
                onChange={(e) => {
                  setExamId(e.target.value);
                  const found = exams.find((ex) => ex.id === e.target.value);
                  if (found) setExamGroup(found.title_en);
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {exams.length > 0 ? (
                  exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title_en}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="group_4">Group 4</option>
                    <option value="group_2">Group 2</option>
                    <option value="group_2a">Group 2A</option>
                    <option value="group_1">Group 1</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ஆண்டு (Year) *</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">தாள் குறியீடு (Paper Code)</label>
              <input
                type="text"
                value={paperCode}
                onChange={(e) => setPaperCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">நிலை (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="draft">வரைவு (Draft)</option>
                <option value="under_review">ஆய்வு (Under Review)</option>
                <option value="ready_to_publish">வெளியிடத் தயார் (Ready to Publish)</option>
                <option value="published">வெளியிடப்பட்டது (Published)</option>
                <option value="archived">காப்பகம் (Archived)</option>
              </select>
            </div>
          </div>

          {/* Exam Date, Expected Qs, Duration, Marks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">தேர்வுத் தேதி (Date)</label>
              <input
                type="date"
                value={dateHeld}
                onChange={(e) => setDateHeld(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">எதிர்பார்க்கப்படும் வினாக்கள்</label>
              <input
                type="number"
                required
                value={expectedQuestionCount}
                onChange={(e) => setExpectedQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">கால அளவு (நிமிடம்)</label>
              <input
                type="number"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">மொத்த மதிப்பெண்</label>
              <input
                type="number"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* High Yield Topics */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              முக்கிய தலைப்புகள் (High-Yield Topics - comma separated)
            </label>
            <input
              type="text"
              value={highYieldTopics}
              onChange={(e) => setHighYieldTopics(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-tamil focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                தேர்வு வழிமுறைகள் (Tamil Instructions)
              </label>
              <textarea
                rows={2}
                value={instructionsTa}
                onChange={(e) => setInstructionsTa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-tamil focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Instructions (English)
              </label>
              <textarea
                rows={2}
                value={instructionsEn}
                onChange={(e) => setInstructionsEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
            >
              ரத்து (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'சேமிக்கப்படுகிறது...' : 'மாற்றங்களைச் சேமி (Save Details)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

