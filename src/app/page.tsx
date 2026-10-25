'use client';

import React, { useState } from 'react';
import { getDictionary, ScreenLanguage } from '@/i18n';
import { 
  BookOpen, 
  RotateCcw, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const [lang, setLang] = useState<ScreenLanguage>('en');
  const [activeExam, setActiveExam] = useState<'g4' | 'g2'>('g4');
  const t = getDictionary(lang);

  const toggleLang = () => {
    setLang(prev => (prev === 'en' ? 'ta' : 'en'));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between pb-20">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              TN
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">
                {lang === 'ta' ? 'டிஎன்பிஎஸ்சி பயிற்சி' : 'TNPSC Practice'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{activeExam === 'g4' ? t.exams.g4 : t.exams.g2Prelims}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="touch-target px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
              title="Toggle Language"
            >
              {lang === 'en' ? 'தமிழ்' : 'English'}
            </button>

            {/* Exam Toggle */}
            <button
              onClick={() => setActiveExam(prev => (prev === 'g4' ? 'g2' : 'g4'))}
              className="touch-target px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition"
              title="Switch Exam"
            >
              {activeExam === 'g4' ? 'G4' : 'G2'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 space-y-4">
        {/* Primary Due Reviews Card (Section 11.5) */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg shadow-blue-500/10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                <RotateCcw className="w-3 h-3" />
                {lang === 'ta' ? 'மீளாய்வுப் பட்டியல்' : 'Spaced Repetition'}
              </span>
              <h2 className="text-2xl font-bold tracking-tight">
                3 {t.vault.dueCount}
              </h2>
              <p className="text-xs text-blue-100">
                {lang === 'ta' 
                  ? 'நினைவாற்றலை உறுதிப்படுத்த தவறிய வினாக்களை மீண்டும் பயிற்சி செய்க.' 
                  : 'Questions ready for review on the 5-stage retention ladder.'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
            <span className="text-xs text-blue-100 font-medium">
              {lang === 'ta' ? 'மதிப்பீடு: 15 நிமிடங்கள்' : 'Est. time: 15 mins'}
            </span>
            <button className="touch-target px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl text-sm shadow-md transition flex items-center gap-1.5 active:scale-95">
              <span>{t.vault.startReview}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Daily Habit & Streak Card (Section 8.8) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {lang === 'ta' ? 'தினசரி இலக்கு & தொடர்ச்சி' : 'Daily Goal & Streak'}
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              5 {lang === 'ta' ? 'நாட்கள் தொடர்ச்சி' : 'Day Streak'}
            </span>
          </div>

          {/* Metric Progress Bars */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {lang === 'ta' ? 'பயிற்சி நேரம்' : 'Study Time'}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">35 / 60m</span>
              </div>
              <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '58%' }}></div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {lang === 'ta' ? 'வினாக்கள்' : 'Questions'}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">14 / 20</span>
              </div>
              <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'ta' 
              ? '60 நிமிடங்கள் அல்லது 20 வினாக்கள் பயிற்சி செய்தால் இன்றைய நாள் கணக்கில் சேரும்.' 
              : 'Complete either 60 active minutes or 20 questions to count towards your streak.'}
          </p>
        </div>

        {/* Quick Practice Launcher (Section 8.1) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {lang === 'ta' ? 'விரைவுப் பயிற்சி' : 'Practice Modes'}
            </h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold cursor-pointer">
              {lang === 'ta' ? 'அனைத்தும்' : 'View All'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button className="touch-target p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition text-left flex flex-col justify-between group shadow-sm">
              <div className="flex items-center justify-between w-full">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.test.unitQuiz}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'ta' ? '22 அலகுகள்' : '22 Units'}
                </div>
              </div>
            </button>

            <button className="touch-target p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition text-left flex flex-col justify-between group shadow-sm">
              <div className="flex items-center justify-between w-full">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.test.fullMock}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  200 Qs • 180 min
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mistake Vault Status Breakdown (Section 8.6) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t.vault.title}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ta' ? 'மொத்தம்: 42 வினாக்கள்' : '42 Total In Vault'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <div className="text-lg font-bold text-amber-700 dark:text-amber-400">18</div>
              <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                {t.vault.learning}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400">Stages 0–2</div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">15</div>
              <div className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                {t.vault.consolidating}
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400">Stages 3–4</div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">9</div>
              <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                {t.vault.retained}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">60-day check</div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Section 11.3) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-3">
        <div className="max-w-md mx-auto grid grid-cols-5 text-center">
          <button className="touch-target flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">{t.nav.home}</span>
          </button>

          <button className="touch-target flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{t.nav.syllabus}</span>
          </button>

          <button className="touch-target flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{t.nav.practice}</span>
          </button>

          <button className="touch-target flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 relative">
            <RotateCcw className="w-5 h-5" />
            <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-[10px] font-medium mt-0.5">{t.nav.vault}</span>
          </button>

          <button className="touch-target flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{t.nav.search}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
