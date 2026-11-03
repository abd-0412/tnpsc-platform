'use client';

import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Zap,
  TrendingDown,
  Award,
  ChevronRight,
  ShieldAlert,
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BarChart3,
  Timer,
  Info
} from 'lucide-react';
import { TimeAnalyticsReport, TimeTrap, SubjectSpeedMetric } from '@/lib/time-analytics';
import { useLanguage } from '@/context/LanguageContext';

interface TimeAnalyticsHubProps {
  report: TimeAnalyticsReport;
  onFilterByTrap?: (questionId: string) => void;
}

export default function TimeAnalyticsHub({ report, onFilterByTrap }: TimeAnalyticsHubProps) {
  const { lang, t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<'traps' | 'subjects' | 'fatigue' | 'matrix'>('traps');
  const [expandedTrapIdx, setExpandedTrapIdx] = useState<number | null>(null);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {t('நேர மேலாண்மை & வேக ஆய்வு', 'Time-Trap & Speed Analytics')}
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Phase 11
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-tamil">
              {lang === 'ta'
                ? 'TNPSC தேர்வில் நேர விரயத்தைத் தடுத்து, வேகம் & துல்லியத்தை உயர்த்தும் நுண்ணறிவுப் பகுப்பாய்வு'
                : 'Advanced pacing insights and time-trap detection calibrated to official TNPSC benchmarks'}
            </p>
          </div>
        </div>

        {/* Speed Status Pill */}
        <div className="flex items-center space-x-2">
          <div
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm ${
              report.overallSpeedStatus === 'fast'
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : report.overallSpeedStatus === 'balanced'
                ? 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300'
                : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {report.overallSpeedStatus === 'fast'
                ? t('அதிவேக பயிற்சி (Fast)', 'Fast Pacing')
                : report.overallSpeedStatus === 'balanced'
                ? t('சீரான வேகம் (Balanced)', 'Balanced Pacing')
                : t('மந்தமான வேகம் (Pacing Lag)', 'Pacing Lag')}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Speed Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Average Time per Question */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t('சராசரி நேரம் / வினா', 'Avg Time / Question')}</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {report.averageTimePerQuestion}s
            </span>
            <span className="text-[11px] text-slate-400 ml-1.5 block sm:inline">
              (TNPSC இலக்கு: {report.tnpscBenchmarkAverage}s)
            </span>
          </div>
          <div className="mt-2 text-[10px] text-cyan-400/90 font-mono">
            {report.averageTimePerQuestion <= report.tnpscBenchmarkAverage
              ? `⚡ ${report.tnpscBenchmarkAverage - report.averageTimePerQuestion}s faster than target`
              : `⚠️ ${report.averageTimePerQuestion - report.tnpscBenchmarkAverage}s slower than target`}
          </div>
        </div>

        {/* Metric 2: Time Traps Wasted */}
        <div className="bg-slate-950/70 border border-rose-900/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t('நேரப் பொறிகள் (Traps)', 'Time-Traps Detected')}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
              {report.timeTraps.length}
            </span>
            <span className="text-xs text-rose-300 ml-1 font-semibold">
              {t('வினாக்கள்', 'questions')}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-rose-400 font-mono">
            Lost: {formatSeconds(report.totalTimeWastedInTrapsSeconds)} in dead-ends
          </div>
        </div>

        {/* Metric 3: Fast & Accurate */}
        <div className="bg-slate-950/70 border border-emerald-900/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t('அதிவேகம் & சரி (<35s)', 'Fast & Accurate')}</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
              {report.fastAndCorrectCount}
            </span>
            <span className="text-xs text-emerald-400/80 ml-1 font-semibold">
              {t('வினாக்கள்', 'questions')}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 font-mono">
            High Confidence mastery
          </div>
        </div>

        {/* Metric 4: Blind Rushes */}
        <div className="bg-slate-950/70 border border-amber-900/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t('அவசர யூகங்கள் (<8s)', 'Impulse / Rushed')}</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              {report.blindRushCount}
            </span>
            <span className="text-xs text-amber-400/80 ml-1 font-semibold">
              {t('வினாக்கள்', 'questions')}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-amber-400/90 font-mono">
            {report.blindRushCount > 2 ? 'Risk of silly mistakes' : 'Healthy pacing control'}
          </div>
        </div>
      </div>

      {/* Tactical Insights (High-Impact Alerts) */}
      <div className="space-y-2.5">
        {report.tacticalInsights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-3.5 sm:p-4 rounded-2xl border flex items-start space-x-3 transition ${
              insight.type === 'warning'
                ? 'bg-rose-950/40 border-rose-700/50 text-rose-200'
                : insight.type === 'praise'
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
                : 'bg-indigo-950/40 border-indigo-700/50 text-indigo-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {insight.type === 'warning' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              ) : insight.type === 'praise' ? (
                <Sparkles className="w-5 h-5 text-emerald-400" />
              ) : (
                <Info className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold">
                {lang === 'ta' ? insight.titleTa : insight.titleEn}
              </h4>
              <p className="text-xs leading-relaxed opacity-90 font-tamil">
                {lang === 'ta' ? insight.descriptionTa : insight.descriptionEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setSelectedTab('traps')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            selectedTab === 'traps'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t('நேரப் பொறிகள் பட்டியல்', 'Time Traps Breakdown')} ({report.timeTraps.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('subjects')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            selectedTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{t('பாடம் வாரியான வேகம்', 'Subject Speed Meter')}</span>
        </button>

        <button
          onClick={() => setSelectedTab('fatigue')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            selectedTab === 'fatigue'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{t('தேர்வு சோர்வு & காலவரிசை', 'Pacing Timeline & Fatigue')}</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Time Traps Deep-Dive */}
      {selectedTab === 'traps' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {lang === 'ta'
                ? 'அதிக நேரம் செலவழித்தும் தவறான/விடுபட்ட வினாக்கள்:'
                : 'Questions where excessive time was spent with zero or negative return:'}
            </span>
            <span className="text-rose-400 font-mono text-[11px]">
              Total Lost: {formatSeconds(report.totalTimeWastedInTrapsSeconds)}
            </span>
          </div>

          {report.timeTraps.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-200">
                {t('நேரப் பொறிகள் ஏதுமில்லை!', 'No Time-Traps detected in this exam!')}
              </p>
              <p className="text-xs text-slate-400 font-tamil max-w-md mx-auto">
                {t(
                  'நீங்கள் கடினமான வினாக்களில் சிக்காமல் சரியான நேரத்தில் தவிர்த்துள்ளீர்கள் அல்லது மிக விரைவாக தீர்வு கண்டுள்ளீர்கள்.',
                  'You maintained disciplined pacing without getting anchored into lengthy unproductive questions.'
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {report.timeTraps.map((trap, idx) => {
                const isExpanded = expandedTrapIdx === idx;
                return (
                  <div
                    key={trap.questionId}
                    className="bg-slate-950/80 border border-rose-900/40 hover:border-rose-700/60 rounded-2xl p-4 transition shadow-sm space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          Q{trap.questionOrder}
                        </span>
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {trap.subject}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-600/40 text-rose-300 font-mono text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatSeconds(trap.timeSpentSeconds)}</span>
                        </div>
                        <button
                          onClick={() => setExpandedTrapIdx(isExpanded ? null : idx)}
                          className="text-xs text-slate-400 hover:text-white p-1 cursor-pointer"
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Question text snippet */}
                    <p className={`text-xs text-slate-300 leading-relaxed font-tamil line-clamp-2 ${isExpanded ? 'line-clamp-none' : ''}`}>
                      {trap.questionText}
                    </p>

                    {/* Quick Choice Meta */}
                    <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-800/80 text-slate-400 gap-2">
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="flex items-center gap-1 text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Your Choice: <strong>{trap.userChoice}</strong></span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct: <strong>{trap.correctChoice}</strong></span>
                        </span>
                      </div>

                      <div className="text-[10px] text-amber-400/90 font-mono">
                        💡 TNPSC Tip: Skip after 60s & mark for review later
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: Subject Speed Meter */}
      {selectedTab === 'subjects' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-tamil">
            {lang === 'ta'
              ? 'TNPSC பாடத்திட்டத்தின் ஒவ்வொரு பகுதிக்கும் டாப்பர் சராசரி வேகத்துடன் உங்களின் வேகம் ஒப்பீடு:'
              : 'Pacing breakdown by TNPSC syllabus domain against topper target speeds:'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {report.subjectMetrics.map((subj) => {
              const diff = subj.averageTimeSeconds - subj.targetBenchmarkSeconds;
              const isFaster = diff <= 0;

              return (
                <div
                  key={subj.subjectKey}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">
                        {lang === 'ta' ? subj.subjectNameTa : subj.subjectNameEn}
                      </h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          subj.speedRating === 'fast'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : subj.speedRating === 'optimal'
                            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {subj.speedRating}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-extrabold text-white font-mono">
                          {subj.averageTimeSeconds}s
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1">/ question</span>
                      </div>
                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        Target: <strong className="text-slate-300">{subj.targetBenchmarkSeconds}s</strong>
                      </div>
                    </div>

                    {/* Progress Speed Bar */}
                    <div className="mt-2 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFaster ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (subj.targetBenchmarkSeconds / Math.max(1, subj.averageTimeSeconds)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Accuracy: <strong className="text-indigo-300">{subj.accuracyPercentage}%</strong></span>
                    <span>Total: <strong>{subj.totalQuestions} Qs</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Fatigue Timeline (4 Quarters) */}
      {selectedTab === 'fatigue' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-tamil">
            {lang === 'ta'
              ? 'தேர்வின் தொடக்கம் முதல் இறுதி வரை உங்கள் வேகம் மற்றும் துல்லியத்தில் ஏற்பட்ட மாற்றங்கள் (Exam Fatigue Curve):'
              : 'Evolution of your speed and accuracy across the 4 stages of the examination:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.quarters.map((q, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{q.quarterName}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      q.status === 'fresh'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : q.status === 'steady'
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                        : q.status === 'fatigued'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400">{q.questionRange}</div>

                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg Pace</span>
                    <strong className="text-sm font-mono text-white">{q.averageTimeSeconds}s</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Accuracy</span>
                    <strong className="text-sm font-mono text-emerald-400">{q.accuracyPercentage}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl text-xs text-indigo-300 flex items-center gap-2 font-tamil">
            <Info className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>
              {lang === 'ta'
                ? 'டாப்பர் உத்தி: 3-வது மற்றும் 4-வது காலாண்டுகளில் சோர்வினால் வேகம் குறைய வாய்ப்புண்டு. நடுவே 15 வினாடிகள் ஆழமாக மூச்சை உள்ளிழுத்து கண் சிமிட்டுவது சோர்வைத் தடுக்கும்!'
                : 'Pro Tip: Candidates often slow down in the 3rd quarter. Taking a 10-second deep breath reset at Q100 restores full mental agility!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

