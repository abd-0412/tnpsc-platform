'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Award, Plus, Calendar, AlertCircle } from 'lucide-react';

interface CreatePaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (paper: any) => void;
}

export default function CreatePaperModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePaperModalProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [titleEn, setTitleEn] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [examId, setExamId] = useState('group_4');
  const [examGroup, setExamGroup] = useState('Group 4');
  const [year, setYear] = useState(new Date().getFullYear());
  const [dateHeld, setDateHeld] = useState('');
  const [paperCode, setPaperCode] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [totalMarks, setTotalMarks] = useState(300);
  const [expectedQuestionCount, setExpectedQuestionCount] = useState(200);
  const [highYieldTopics, setHighYieldTopics] = useState('');
  const [instructionsTa, setInstructionsTa] = useState('');
  const [instructionsEn, setInstructionsEn] = useState('');
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
    if (isOpen) {
      loadExams();
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

      const res = await fetch('/api/admin/pyq', {
        method: 'POST',
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create PYQ paper');
      }

      onCreated(data.paper);
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
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              புதிய PYQ வினாத்தாள் உருவாக்கு (Create PYQ Paper)
            </h2>
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
                placeholder="எ.கா: டி.என்.பி.எஸ்.சி குரூப் 4 அசல் வினாத்தாள் 2024"
                value={titleTa}
                onChange={(e) => setTitleTa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-tamil focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                English Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TNPSC Group 4 Official Question Paper 2024"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Exam, Group, Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">தேர்வு (Exam) *</label>
              <select
                value={examId}
                onChange={(e) => {
                  setExamId(e.target.value);
                  const found = exams.find((ex) => ex.id === e.target.value);
                  if (found) setExamGroup(found.title_en);
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">தாள் குறியீடு (Paper Code)</label>
              <input
                type="text"
                placeholder="e.g. G4-2024-FN"
                value={paperCode}
                onChange={(e) => setPaperCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">மொத்த வினாக்கள் (Expected Qs)</label>
              <input
                type="number"
                required
                value={expectedQuestionCount}
                onChange={(e) => setExpectedQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">கால அளவு (நிமிடம்)</label>
              <input
                type="number"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">மொத்த மதிப்பெண்</label>
              <input
                type="number"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              placeholder="e.g. தமிழ் இலக்கணம், திருக்குறள், இந்திய அரசியலமைப்பு, தனிவட்டி"
              value={highYieldTopics}
              onChange={(e) => setHighYieldTopics(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-tamil focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                placeholder="வினாத்தாளுக்கான முக்கிய குறிப்புகள்..."
                value={instructionsTa}
                onChange={(e) => setInstructionsTa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-tamil focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Instructions (English)
              </label>
              <textarea
                rows={2}
                placeholder="Important exam guidelines..."
                value={instructionsEn}
                onChange={(e) => setInstructionsEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'உருவாக்கப்படுகிறது...' : 'உருவாக்கு (Create Paper)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

