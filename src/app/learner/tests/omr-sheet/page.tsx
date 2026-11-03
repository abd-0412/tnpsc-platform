'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Printer, Download, ArrowLeft, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export default function OfficialPinkOMRSheetPage() {
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Generate 200 questions split into 4 columns of 50 questions each
  // Col 1: 1 - 50
  // Col 2: 51 - 100
  // Col 3: 101 - 150
  // Col 4: 151 - 200
  const columns = [
    { start: 1, end: 50, title: 'PART - A (பொதுத்தமிழ்: வினாக்கள் 1 - 50)' },
    { start: 51, end: 100, title: 'PART - A (பொதுத்தமிழ்: வினாக்கள் 51 - 100)' },
    { start: 101, end: 150, title: 'PART - B (பொது அறிவு: வினாக்கள் 101 - 150)' },
    { start: 151, end: 200, title: 'PART - B (திறனறிவு: வினாக்கள் 151 - 200)' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6 print:p-0 print:bg-white print:text-black">
      {/* Non-printed Screen Navigation Toolbar */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <Link
            href="/learner/tests"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-xs text-pink-400 font-semibold uppercase">
              <span>Phase 10</span>
              <span>•</span>
              <span>Official Simulation</span>
            </div>
            <h1 className="text-xl font-bold text-white">
              அதிகாரப்பூர்வ TNPSC இளஞ்சிவப்பு OMR விடைத்தாள் (Official Pink OMR)
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-pink-600/30 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>OMR தாளை அச்சிடு / PDF ஆக சேமி (Print OMR)</span>
          </button>
        </div>
      </div>

      {/* Screen Instructions banner */}
      <div className="max-w-5xl mx-auto mb-6 p-4 bg-pink-950/30 border border-pink-700/50 rounded-2xl print:hidden flex items-start space-x-3 text-xs text-pink-200">
        <AlertTriangle className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold text-pink-300">
            உண்மையான தேர்வு அரங்கு பயிற்சி முறை (Exam Hall Simulation Guide):
          </strong>
          <p className="text-pink-200/80 leading-relaxed">
            1. மேலே உள்ள <strong>"OMR தாளை அச்சிடு"</strong> பொத்தானை அழுத்தி A4 தாளில் அச்சிடவும் (Print in A4 Color or B&W).
            <br />
            2. மாதிரி வினாத்தாளைப் பார்த்து, <strong>கருப்பு நிற பந்துமுனை பேனாவால் (Black Ballpoint Pen)</strong> வட்டங்களை முழுமையாக நிழலிட்டு (Shade) தேர்வு எழுதவும்.
            <br />
            3. தேர்வு முடிந்ததும், <strong>"OMR விடை உள்ளீடு (OMR Key-In)"</strong> பக்கத்தில் உங்கள் விடைகளை 2 நிமிடத்தில் உள்ளீடு செய்து உடனடி ஆன்லைன் மதிப்பெண் மற்றும் தவறு திருத்த பகுப்பாய்வைப் பெறுங்கள்!
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OFFICIAL TNPSC PINK OMR ANSWER SHEET CONTAINER                            */}
      {/* Uses crisp print styling, pink borders, authentic grids & 200 questions   */}
      {/* ========================================================================= */}
      <div
        ref={printContainerRef}
        className="max-w-[210mm] mx-auto bg-[#FFF5F7] text-slate-900 border-2 border-pink-800 rounded-lg p-4 sm:p-6 shadow-2xl print:border-pink-800 print:shadow-none print:m-0 print:p-2 print:max-w-none print:w-full print:bg-[#FFF5F7]"
        style={{
          boxSizing: 'border-box',
          fontFamily: "'Segoe UI', 'Noto Sans Tamil', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        {/* Header Block */}
        <div className="border-b-2 border-pink-800 pb-3 mb-3 text-center">
          <div className="flex items-center justify-between border-b border-pink-600/40 pb-2 mb-2">
            <span className="text-[10px] font-bold font-mono tracking-wider text-pink-900">
              TAMIL NADU PUBLIC SERVICE COMMISSION
            </span>
            <span className="text-[11px] font-black font-mono px-2 py-0.5 bg-pink-800 text-white rounded">
              OMR-2025/2026
            </span>
            <span className="text-[10px] font-bold font-mono tracking-wider text-pink-900">
              ORIGINAL ANSWER SHEET
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black tracking-wide text-pink-950 uppercase">
            தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம்
          </h2>
          <h3 className="text-xs sm:text-sm font-bold text-pink-900 tracking-wide uppercase">
            விடைத்தாள் • OMR ANSWER SHEET • 200 QUESTIONS
          </h3>
        </div>

        {/* Candidate Details & Registration Grids */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 border border-pink-700 rounded p-2.5 bg-white/70 text-[11px]">
          {/* Box 1: Exam Info */}
          <div className="space-y-1">
            <span className="font-bold text-pink-950 block">தேர்வின் பெயர் / Name of Exam:</span>
            <div className="border border-pink-400 p-1 rounded font-semibold text-pink-900 bg-pink-50/50">
              COMBINED CIVIL SERVICES EXAM (GROUP-IV)
            </div>
            <div className="flex justify-between pt-1">
              <span>பாடம்: <strong>பொதுத்தமிழ் & GS</strong></span>
              <span>தாள் குறியீடு: <strong>001</strong></span>
            </div>
          </div>

          {/* Box 2: Register Number Bubble Grid Mockup */}
          <div className="space-y-1 text-center">
            <span className="font-bold text-pink-950 block">பதிவு எண் / Register Number:</span>
            <div className="grid grid-cols-9 gap-1 font-mono font-bold text-[10px] justify-center">
              {[1, 2, 0, 4, 0, 5, 8, 9, 2].map((num, idx) => (
                <div key={idx} className="border border-pink-700 rounded p-0.5 bg-white">
                  {num}
                </div>
              ))}
            </div>
            <span className="text-[9px] text-pink-800 block">தேர்வு மைய எண்: 0101 (சென்னை)</span>
          </div>

          {/* Box 3: Question Booklet No */}
          <div className="space-y-1 text-right sm:text-left">
            <span className="font-bold text-pink-950 block">வினாத்தாள் எண் / Booklet No:</span>
            <div className="grid grid-cols-8 gap-1 font-mono font-bold text-[10px] justify-center">
              {[8, 4, 1, 9, 2, 3, 5, 0].map((num, idx) => (
                <div key={idx} className="border border-pink-700 rounded p-0.5 bg-white text-center">
                  {num}
                </div>
              ))}
            </div>
            <span className="text-[9px] text-pink-800 block text-center">சீரியல் எண் குறியீடு: A</span>
          </div>
        </div>

        {/* Instruction Reminder Bar */}
        <div className="bg-pink-900 text-white text-[10px] font-bold p-1 rounded mb-3 text-center uppercase tracking-wide">
          கருப்பு நிற பந்துமுனை பேனாவால் மட்டுமே வட்டமிட வேண்டும் • SHADE WITH BLACK BALLPOINT PEN ONLY • OPTION (E) = விடை தெரியவில்லை
        </div>

        {/* ========================================================================= */}
        {/* 200 QUESTIONS BUBBLE MATRIX (4 COLUMNS OF 50 QUESTIONS)                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
          {columns.map((col, colIdx) => (
            <div
              key={colIdx}
              className="border border-pink-700 rounded bg-white/80 p-1.5 shadow-sm space-y-1"
            >
              <div className="bg-pink-100 text-pink-950 font-black text-[9px] text-center py-0.5 rounded border border-pink-300 uppercase">
                {col.title}
              </div>

              {/* Render 50 questions */}
              <div className="space-y-0.5 pt-0.5">
                {Array.from({ length: col.end - col.start + 1 }, (_, i) => {
                  const qNum = col.start + i;
                  return (
                    <div
                      key={qNum}
                      className="flex items-center justify-between py-0.5 px-1 hover:bg-pink-50 border-b border-pink-100 last:border-0"
                    >
                      <span className="font-mono font-bold text-pink-950 w-6 text-right pr-1">
                        {qNum}.
                      </span>
                      <div className="flex items-center space-x-1">
                        {['A', 'B', 'C', 'D', 'E'].map((opt) => (
                          <div
                            key={opt}
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-pink-900 flex items-center justify-center font-mono font-bold text-[8px] sm:text-[9px] transition ${
                              opt === 'E'
                                ? 'bg-pink-50 text-pink-700 border-pink-600'
                                : 'bg-white text-slate-800'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL TNPSC BOTTOM SECTION: BUBBLE TOTAL COUNT & SIGNATURES             */}
        {/* ========================================================================= */}
        <div className="mt-4 pt-3 border-t-2 border-pink-800 space-y-3 text-[11px]">
          {/* Shaded Count Matrix (No. of A, B, C, D, E) */}
          <div className="border border-pink-700 rounded p-2 bg-white/90">
            <span className="font-black text-pink-950 text-xs block mb-1">
              வட்டமிட்ட மொத்த விடைகளின் எண்ணிக்கை (COUNT OF SHADED BUBBLES):
            </span>
            <div className="grid grid-cols-6 gap-2 text-center font-mono font-bold">
              <div className="border border-pink-400 p-1 rounded bg-pink-50">
                <span className="text-[10px] block text-pink-800">A</span>
                <span className="text-xs text-pink-950">[ &nbsp; &nbsp; ]</span>
              </div>
              <div className="border border-pink-400 p-1 rounded bg-pink-50">
                <span className="text-[10px] block text-pink-800">B</span>
                <span className="text-xs text-pink-950">[ &nbsp; &nbsp; ]</span>
              </div>
              <div className="border border-pink-400 p-1 rounded bg-pink-50">
                <span className="text-[10px] block text-pink-800">C</span>
                <span className="text-xs text-pink-950">[ &nbsp; &nbsp; ]</span>
              </div>
              <div className="border border-pink-400 p-1 rounded bg-pink-50">
                <span className="text-[10px] block text-pink-800">D</span>
                <span className="text-xs text-pink-950">[ &nbsp; &nbsp; ]</span>
              </div>
              <div className="border border-pink-400 p-1 rounded bg-pink-50">
                <span className="text-[10px] block text-pink-800">E</span>
                <span className="text-xs text-pink-950">[ &nbsp; &nbsp; ]</span>
              </div>
              <div className="border-2 border-pink-800 p-1 rounded bg-pink-200 text-pink-950">
                <span className="text-[10px] block font-black">TOTAL</span>
                <span className="text-xs font-black">200</span>
              </div>
            </div>
          </div>

          {/* Signature Verification */}
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="border-t border-dashed border-pink-800 pt-1 text-center">
              <span className="font-bold text-pink-950 block">தேர்வரின் கையொப்பம்</span>
              <span className="text-[9px] text-pink-800">Signature of the Candidate</span>
            </div>
            <div className="border-t border-dashed border-pink-800 pt-1 text-center">
              <span className="font-bold text-pink-950 block">அறைக் கண்காணிப்பாளர் கையொப்பம்</span>
              <span className="text-[9px] text-pink-800">Signature of the Invigilator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

