'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Award,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download,
  Play,
  Layers,
  ArrowRight,
  TrendingUp,
  BookOpen
} from 'lucide-react';

interface PYQPaper {
  id: string;
  exam: string;
  exam_id: string;
  year: number;
  date: string;
  title_ta: string;
  title_en: string;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  available_in_bank: number;
  status: 'active_in_tests' | 'ready_to_publish' | 'in_progress';
  test_template_id?: string;
  high_yield_topics: string[];
}

const OFFICIAL_PYQ_PAPERS: PYQPaper[] = [
  {
    id: 'PYQ-G4-2024',
    exam: 'TNPSC Group 4',
    exam_id: 'group_4',
    year: 2024,
    date: '09-06-2024',
    title_ta: 'டி.என்.பி.எஸ்.சி குரூப் 4 அசல் வினாத்தாள் 2024',
    title_en: 'TNPSC Group 4 Official Question Paper 2024',
    total_questions: 200,
    duration_minutes: 180,
    total_marks: 300,
    available_in_bank: 200,
    status: 'ready_to_publish',
    high_yield_topics: [
      'பகுதி அ: தமிழ் இலக்கணம் & மரபு',
      'திருக்குறள் அதிகாரங்கள்',
      'அரசியலமைப்பு முகப்புரை & அடிப்படை உரிமைகள்',
      'கணிதம்: தனிவட்டி, கூட்டுவட்டி & மீ.பொ.வ',
      'விடுதலைப் போராட்டத்தில் தமிழகத்தின் பங்கு'
    ]
  },
  {
    id: 'PYQ-G4-2022',
    exam: 'TNPSC Group 4',
    exam_id: 'group_4',
    year: 2022,
    date: '24-07-2022',
    title_ta: 'டி.என்.பி.எஸ்.சி குரூப் 4 அசல் வினாத்தாள் 2022',
    title_en: 'TNPSC Group 4 Official Question Paper 2022',
    total_questions: 200,
    duration_minutes: 180,
    total_marks: 300,
    available_in_bank: 200,
    status: 'active_in_tests',
    test_template_id: 'TEST-GROUP4-FULLMOCK-2025',
    high_yield_topics: [
      'பாரதிதாசன் & பாரதியார் படைப்புகள்',
      '42-வது அரசியலமைப்பு சட்டத்திருத்தம்',
      'கீழடி தொல்லியல் அகழாய்வு',
      'மீ.பொ.வ மற்றும் மீ.பொ.ம கணக்குகள்',
      'நீதிக்கட்சி & சுயமரியாதை இயக்கம்'
    ]
  },
  {
    id: 'PYQ-G2-2022',
    exam: 'TNPSC Group 2 & 2A',
    exam_id: 'group_2',
    year: 2022,
    date: '21-05-2022',
    title_ta: 'டி.என்.பி.எஸ்.சி குரூப் 2 / 2A முதல்நிலை அசல் வினாத்தாள் 2022',
    title_en: 'TNPSC Group 2 & 2A Prelims Official Question Paper 2022',
    total_questions: 200,
    duration_minutes: 180,
    total_marks: 300,
    available_in_bank: 200,
    status: 'ready_to_publish',
    high_yield_topics: [
      'சங்க இலக்கியம்: புறநானூறு & நற்றிணை',
      'மத்திய-மாநில உறவுகள் (சர்க்காரியா ஆணையம்)',
      'அறிவியல்: மரபியல் & நோயியல்',
      'விகிதம் & விகிதாச்சாரம்',
      'வைக்கம் போராட்டம் & பெரியார்'
    ]
  },
  {
    id: 'PYQ-G4-2019',
    exam: 'TNPSC Group 4',
    exam_id: 'group_4',
    year: 2019,
    date: '01-09-2019',
    title_ta: 'டி.என்.பி.எஸ்.சி குரூப் 4 அசல் வினாத்தாள் 2019',
    title_en: 'TNPSC Group 4 Official Question Paper 2019',
    total_questions: 200,
    duration_minutes: 180,
    total_marks: 300,
    available_in_bank: 200,
    status: 'ready_to_publish',
    high_yield_topics: [
      'எட்டுத்தொகை & பத்துப்பாட்டு நூல்கள்',
      'பஞ்சாயத்து ராஜ் & 73-வது சட்டத்திருத்தம்',
      'காலம் மற்றும் வேலை கணக்குகள்',
      'வேலு நாச்சியார் & மருது சகோதரர்கள்',
      'சுருக்குதல் & வர்க்கமூலம்'
    ]
  }
];

export default function AdminPYQPage() {
  const [papers, setPapers] = useState<PYQPaper[]>(OFFICIAL_PYQ_PAPERS);
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const filteredPapers = papers.filter((p) => {
    if (selectedExam !== 'all' && p.exam_id !== selectedExam) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title_ta.toLowerCase().includes(q) || p.title_en.toLowerCase().includes(q);
      const matchYear = String(p.year).includes(q);
      return matchTitle || matchYear;
    }
    return true;
  });

  const handlePublishAsTest = async (paper: PYQPaper) => {
    setPublishingId(paper.id);
    setSuccessMsg('');

    try {
      // Create or ensure test template exists in test_templates table
      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `TEST-${paper.id}`,
          title_ta: paper.title_ta,
          title_en: paper.title_en,
          category: 'previous_year',
          exam_id: paper.exam_id,
          duration_minutes: paper.duration_minutes,
          total_marks: paper.total_marks,
          negative_marking_rate: 0.0,
          question_ids: [], // Automatically links available PYQ questions
          is_published: true,
        }),
      });

      if (res.ok) {
        setPapers((prev) =>
          prev.map((p) => (p.id === paper.id ? { ...p, status: 'active_in_tests' } : p))
        );
        setSuccessMsg(`"${paper.title_ta}" வெற்றிகரமாக தேர்வு மேலாண்மையில் வெளியிடப்பட்டது!`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to publish PYQ paper as active test');
      }
    } catch (err: any) {
      alert(err.message || 'Error publishing test');
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <span>Module 17</span>
            <span>•</span>
            <span>Official Archives & Question Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-400" />
            முந்தைய ஆண்டு வினாத்தாள்கள் (PYQ Archive Centre)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Official TNPSC Previous Year Question Papers with High-Yield Topic Trends and 1-Click Mock Conversion.
          </p>
        </div>

        <Link
          href="/admin/tests"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>தேர்வு மேலாண்மை செல் (Test Manager)</span>
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-700/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">மொத்த PYQ தாள்கள்</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white mt-1">4 அசல் தாள்கள்</p>
          <span className="text-[10px] text-slate-500">2019 முதல் 2024 வரை</span>
        </div>

        <div className="bg-slate-850 p-4 rounded-xl border border-slate-700/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">மொத்த வினாக்கள்</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-indigo-400 mt-1">800 வினாக்கள்</p>
          <span className="text-[10px] text-slate-500">இருமொழி வினா வங்கி</span>
        </div>

        <div className="bg-slate-850 p-4 rounded-xl border border-slate-700/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">குரூப் 4 தாள்கள்</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-1">3 தேர்வுகள்</p>
          <span className="text-[10px] text-slate-500">2024, 2022, 2019</span>
        </div>

        <div className="bg-slate-850 p-4 rounded-xl border border-slate-700/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">குரூப் 2 தாள்கள்</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-purple-400 mt-1">1 தேர்வு</p>
          <span className="text-[10px] text-slate-500">2022 முதல்நிலைத் தேர்வு</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-850 p-3.5 rounded-xl border border-slate-700/70">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search papers by year, exam name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">அனைத்து தேர்வுகள் (All Exams)</option>
            <option value="group_4">TNPSC Group 4</option>
            <option value="group_2">TNPSC Group 2 & 2A</option>
          </select>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            className="bg-slate-850 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-600 transition shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    {paper.exam}
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {paper.year}
                  </span>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    paper.status === 'active_in_tests'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  }`}
                >
                  {paper.status === 'active_in_tests' ? '● Published in Tests' : '○ Ready to Publish'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base font-tamil leading-snug">
                  {paper.title_ta}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{paper.title_en}</p>
                <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                  அதிகாரப்பூர்வ தேர்வுத் தேதி: {paper.date}
                </span>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-slate-700/60">
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Questions</span>
                  <strong className="text-amber-400">{paper.total_questions} Qs</strong>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Duration</span>
                  <strong className="text-slate-200">{paper.duration_minutes}m</strong>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Total Marks</span>
                  <strong className="text-emerald-400">{paper.total_marks}m</strong>
                </div>
              </div>

              {/* High Yield Focus Areas */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  அதிக முறை கேட்கப்பட்ட முக்கிய தலைப்புகள் (High-Yield):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {paper.high_yield_topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-750 font-tamil"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Code: {paper.id}
              </span>

              <div className="flex items-center space-x-2">
                {paper.status === 'active_in_tests' ? (
                  <Link
                    href="/admin/tests"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>தேர்வு பட்டியலில் உள்ளது</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => handlePublishAsTest(paper)}
                    disabled={publishingId === paper.id}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>
                      {publishingId === paper.id ? 'வெளியிடப்படுகிறது...' : 'மாதிரித் தேர்வாக வெளியிடு'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

