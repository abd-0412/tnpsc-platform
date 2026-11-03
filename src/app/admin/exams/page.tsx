'use client';

import { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, Settings, Edit3, Plus, ArrowRight, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Exam {
  id: string;
  title_en: string;
  title_ta: string;
  description_en: string;
  description_ta: string;
  is_active: boolean;
  config: {
    total_marks: number;
    duration_minutes: number;
    total_questions: number;
    negative_marking: boolean;
    negative_marking_rate?: number;
  };
}

export default function ExamManagementPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const supabase = createClient();

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('id', { ascending: true });
    if (!error && data) {
      setExams(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    const { error } = await supabase
      .from('exams')
      .upsert({
        ...editingExam,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      alert(`Error saving examination: ${error.message}`);
    } else {
      setEditingExam(null);
      fetchExams();
    }
  };

  const handleToggleActive = async (exam: Exam) => {
    const { error } = await supabase
      .from('exams')
      .update({ is_active: !exam.is_active, updated_at: new Date().toISOString() })
      .eq('id', exam.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      fetchExams();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <span>தேர்வு மேலாண்மை (Examination Management)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            TNPSC குரூப் 4, குரூப் 2, மற்றும் குரூப் 2A தேர்வு விதிகள் & வினா அமைப்பு (Module 04).
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExam({
              id: '',
              title_en: '',
              title_ta: '',
              description_en: '',
              description_ta: '',
              is_active: true,
              config: {
                total_marks: 300,
                duration_minutes: 180,
                total_questions: 200,
                negative_marking: false,
              },
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>புதிய தேர்வு சேர் (Add Examination)</span>
        </button>
      </div>

      {/* Exams Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            தேர்வு விவரங்கள் ஏற்றப்படுகின்றன... (Loading examinations...)
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/70 hover:border-slate-600 transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
                    {exam.id.toUpperCase()}
                  </span>
                  {exam.is_active ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[11px] text-red-400 font-medium">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Disabled</span>
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-white leading-snug">{exam.title_ta}</h2>
                  <p className="text-xs text-slate-400">{exam.title_en}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {exam.description_ta || exam.description_en}
                </p>

                {/* Exam Pattern Specs */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/60 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">வினாக்கள்</span>
                    <span className="text-sm font-bold text-white">{exam.config?.total_questions || 200}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">மதிப்பெண்</span>
                    <span className="text-sm font-bold text-amber-400">{exam.config?.total_marks || 300}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">நேரம்</span>
                    <span className="text-sm font-bold text-white">{exam.config?.duration_minutes || 180}m</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
                <button
                  onClick={() => handleToggleActive(exam)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    exam.is_active
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {exam.is_active ? 'முடக்கு (Disable)' : 'இயக்கு (Enable)'}
                </button>

                <button
                  onClick={() => {
                    setEditingExam(exam);
                    setShowAddModal(false);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>திருத்து (Configure)</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Add Modal */}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 my-8">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>
                {editingExam.id ? `தேர்வு கட்டமைப்பு: ${editingExam.title_ta}` : 'புதிய தேர்வு சேர்'}
              </span>
            </h2>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              {!editingExam.id && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">தேர்வு குறியீடு (Exam ID Key)</label>
                  <input
                    type="text"
                    required
                    value={editingExam.id}
                    onChange={(e) => setEditingExam({ ...editingExam, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g. group_1"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">பெயர் (தமிழ்)</label>
                  <input
                    type="text"
                    required
                    value={editingExam.title_ta}
                    onChange={(e) => setEditingExam({ ...editingExam, title_ta: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={editingExam.title_en}
                    onChange={(e) => setEditingExam({ ...editingExam, title_en: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">விளக்கம் (தமிழ்)</label>
                <textarea
                  rows={2}
                  value={editingExam.description_ta || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, description_ta: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Pattern Configuration */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3">
                <h3 className="font-semibold text-amber-400 text-xs">தேர்வு கட்டமைப்பு விதிகளும் மதிப்பெண்களும்</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">மொத்த வினாக்கள்</label>
                    <input
                      type="number"
                      value={editingExam.config?.total_questions || 200}
                      onChange={(e) =>
                        setEditingExam({
                          ...editingExam,
                          config: { ...editingExam.config, total_questions: parseInt(e.target.value, 10) || 0 },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">மொத்த மதிப்பெண்</label>
                    <input
                      type="number"
                      value={editingExam.config?.total_marks || 300}
                      onChange={(e) =>
                        setEditingExam({
                          ...editingExam,
                          config: { ...editingExam.config, total_marks: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">தேர்வு நேரம் (நிமிடம்)</label>
                    <input
                      type="number"
                      value={editingExam.config?.duration_minutes || 180}
                      onChange={(e) =>
                        setEditingExam({
                          ...editingExam,
                          config: { ...editingExam.config, duration_minutes: parseInt(e.target.value, 10) || 0 },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  ரத்து செய் (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
                >
                  சேமி (Save Configuration)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

