'use client';

import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import {
  Printer,
  FileSpreadsheet,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Download,
  KeyRound,
  RefreshCw,
  FileCheck2
} from 'lucide-react';

interface QuestionItem {
  order: number;
  id: string;
  question_ta: string;
  question_en: string;
  options_ta: Array<{ id: string; text: string }>;
  options_en: Array<{ id: string; text: string }>;
  subject: string;
}

interface TestPrintData {
  id: string;
  attempt_id?: string;
  template_id?: string;
  title_ta: string;
  title_en: string;
  exam_title_ta: string;
  exam_title_en: string;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  questions: QuestionItem[];
}

export default function TestPrintBookletPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<TestPrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [langView, setLangView] = useState<'both' | 'ta' | 'en'>('both');

  useEffect(() => {
    async function fetchPrintData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/learner/tests/${id}/print`);
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load print data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrintData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">
          அதிகாரப்பூர்வ TNPSC வினாத்தாள் புத்தகம் தயாராகிறது... (Preparing Question Paper Booklet...)
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6 print:p-0 print:bg-white print:text-black">
      {/* Non-printed Screen Action Header */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <Link
            href="/learner/tests"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold uppercase">
              <span>Phase 10</span>
              <span>•</span>
              <span>Printable Question Paper Booklet</span>
            </div>
            <h1 className="text-xl font-bold text-white truncate max-w-lg">
              {data.title_ta}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language Toggle for Printing */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setLangView('both')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                langView === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              இருமொழி (Bilingual)
            </button>
            <button
              onClick={() => setLangView('ta')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                langView === 'ta' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              தமிழ் மட்டும்
            </button>
            <button
              onClick={() => setLangView('en')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                langView === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              English Only
            </button>
          </div>

          <Link
            href="/learner/tests/omr-sheet"
            target="_blank"
            className="px-3.5 py-2 bg-pink-950/60 hover:bg-pink-900/60 text-pink-300 font-bold text-xs rounded-xl border border-pink-700/80 flex items-center space-x-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-pink-400" />
            <span>Pink OMR Sheet</span>
          </Link>

          <Link
            href={`/learner/tests/${id}/omr-sync`}
            className="px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-700/80 flex items-center space-x-1.5 transition"
          >
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>OMR விடை உள்ளீடு (Key-In)</span>
          </Link>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>வினாத்தாளை அச்சிடு (Print Paper)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTIC TNPSC QUESTION BOOKLET CONTAINER                                 */}
      {/* ========================================================================= */}
      <div
        className="max-w-[210mm] mx-auto bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-lg border border-slate-300 print:shadow-none print:m-0 print:p-6 print:border-none print:w-full"
        style={{
          fontFamily: "'Segoe UI', 'Noto Sans Tamil', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        {/* Cover Header */}
        <div className="border-b-2 border-black pb-4 text-center space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase pb-1 border-b border-slate-300">
            <span>வினாத்தொகுப்பு வரிசை எண்: 84192350</span>
            <span className="text-sm px-2 py-0.5 border-2 border-black font-black">A</span>
            <span>நேரம்: {Math.floor(data.duration_minutes / 60)} மணி நேரம்</span>
          </div>

          <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide text-slate-950">
            தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம்
          </h1>
          <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-800">
            {data.exam_title_ta} • {data.exam_title_en}
          </h2>
          <div className="pt-1 text-sm font-black text-indigo-950 border-t border-slate-200 uppercase">
            {data.title_ta}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-semibold pt-2 border-t border-slate-300">
            <div>கால அளவு: {data.duration_minutes} நிமிடங்கள்</div>
            <div>வினாக்கள்: {data.total_questions}</div>
            <div>அதிகபட்ச மதிப்பெண்கள்: {data.total_marks}</div>
          </div>
        </div>

        {/* General Instructions Box */}
        <div className="my-6 p-4 border border-slate-400 bg-slate-50/70 rounded text-[11px] space-y-1.5 leading-relaxed text-slate-800">
          <strong className="block text-xs font-bold text-black uppercase">
            முக்கிய அறிவுரைகள் (IMPORTANT INSTRUCTIONS TO CANDIDATES):
          </strong>
          <ol className="list-decimal list-inside space-y-1 text-slate-700">
            <li>
              இந்த வினாத்தொகுப்பில் <strong>{data.total_questions} வினாக்கள்</strong> உள்ளன. வினாத்தாளைப் பிரித்தவுடன் அனைத்து வினாக்களும் முறையாக அச்சிடப்பட்டுள்ளனவா என உறுதிசெய்க.
            </li>
            <li>
              அனைத்து வினாக்களுக்கும் சமமான மதிப்பெண்கள் உண்டு. <strong>எதிர்மறை மதிப்பெண்கள் இல்லை (No Negative Marks)</strong>.
            </li>
            <li>
              விடைகளை <strong>கருப்பு நிற பந்துமுனை பேனாவால் (Black Ballpoint Pen)</strong> மட்டுமே OMR விடைத்தாளில் வட்டமிட வேண்டும்.
            </li>
            <li>
              விடை தெரியாத வினாவிற்கு <strong>(E)</strong> என்ற வட்டத்தினை நிழலிட வேண்டும்.
            </li>
          </ol>
        </div>

        <div className="text-center font-bold text-xs uppercase tracking-widest my-4 border-b-2 border-black pb-1">
          வினாக்கள் பகுதி (QUESTIONS SECTION)
        </div>

        {/* Questions Listing */}
        <div className="space-y-6 pt-2">
          {data.questions.map((q) => {
            const showTa = langView === 'both' || langView === 'ta';
            const showEn = (langView === 'both' || langView === 'en') && q.question_en;

            return (
              <div
                key={q.id}
                className="break-inside-avoid border-b border-slate-200 pb-5 space-y-2.5 last:border-0"
              >
                {/* Question Text */}
                <div className="flex items-start space-x-2 text-sm">
                  <span className="font-bold font-mono text-black w-7 shrink-0 text-right">
                    {q.order}.
                  </span>
                  <div className="space-y-1 text-slate-950 font-medium leading-relaxed">
                    {showTa && <p className="font-semibold text-[13px]">{q.question_ta}</p>}
                    {showEn && (
                      <p className="text-[12px] text-slate-700 font-sans italic">
                        {q.question_en}
                      </p>
                    )}
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9 text-xs">
                  {q.options_ta.map((opt, optIdx) => {
                    const optEn = q.options_en?.[optIdx]?.text;
                    return (
                      <div
                        key={opt.id}
                        className="flex items-start space-x-2 p-1.5 rounded bg-slate-50 border border-slate-200/80"
                      >
                        <span className="font-bold font-mono text-indigo-950 shrink-0">
                          ({opt.id})
                        </span>
                        <div className="space-y-0.5">
                          {showTa && <span className="text-slate-900 block font-medium">{opt.text}</span>}
                          {showEn && optEn && (
                            <span className="text-slate-600 block text-[11px] italic">
                              {optEn}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* End of Booklet */}
        <div className="mt-8 pt-4 border-t-2 border-black text-center text-xs font-bold text-slate-700 uppercase tracking-widest">
          *** வினாத்தாள் முடிவு • END OF QUESTION PAPER BOOKLET ***
        </div>
      </div>
    </div>
  );
}

