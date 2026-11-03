'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  GraduationCap,
  Bookmark,
  Share2
} from 'lucide-react';
import { RevisionCapsule } from '@/lib/revision-data';
import { useLanguage } from '@/context/LanguageContext';

interface CapsuleCardProps {
  capsule: RevisionCapsule;
}

export default function CapsuleCard({ capsule }: CapsuleCardProps) {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showSources, setShowSources] = useState(false);

  const categoryTheme = {
    tamil: {
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      pill: 'bg-emerald-950/50 text-emerald-300 border-emerald-700/40',
      dot: 'bg-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
      formulaBg: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200',
    },
    polity: {
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      pill: 'bg-indigo-950/50 text-indigo-300 border-indigo-700/40',
      dot: 'bg-indigo-400',
      borderHover: 'hover:border-indigo-500/40',
      formulaBg: 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200',
    },
    aptitude: {
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      pill: 'bg-amber-950/50 text-amber-300 border-amber-700/40',
      dot: 'bg-amber-400',
      borderHover: 'hover:border-amber-500/40',
      formulaBg: 'bg-amber-950/30 border-amber-500/30 text-amber-200',
    },
    history: {
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      pill: 'bg-purple-950/50 text-purple-300 border-purple-700/40',
      dot: 'bg-purple-400',
      borderHover: 'hover:border-purple-500/40',
      formulaBg: 'bg-purple-950/30 border-purple-500/30 text-purple-200',
    },
  }[capsule.category] || {
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    pill: 'bg-indigo-950/50 text-indigo-300 border-indigo-700/40',
    dot: 'bg-indigo-400',
    borderHover: 'hover:border-indigo-500/40',
    formulaBg: 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200',
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sources = capsule.schoolBookRefsTa
      ? `\n\nபாடப்புத்தக ஆதாரங்கள்:\n${capsule.schoolBookRefsTa.join('\n')}`
      : '';
    const content = `${capsule.topicTa}\n\n${capsule.summaryTa}\n\nமுக்கிய குறிப்புகள்:\n${capsule.keyPointsTa.join('\n')}${sources}\n\n${capsule.mnemonicsTa || ''}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to highlight [Standard] tags nicely in key points
  const formatKeyPoint = (point: string) => {
    const match = point.match(/\[(.*?)\]$/);
    if (match) {
      const mainText = point.slice(0, point.lastIndexOf('[')).trim();
      const refTag = match[1];
      return (
        <span className="leading-relaxed">
          {mainText}{' '}
          <span className="inline-block px-1.5 py-0.5 ml-1 text-[10px] font-mono font-medium rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
            {refTag}
          </span>
        </span>
      );
    }
    return <span className="leading-relaxed">{point}</span>;
  };

  return (
    <div
      className={`bg-slate-900/80 border border-slate-800 ${categoryTheme.borderHover} rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-200 shadow-xl space-y-4 hover:shadow-2xl flex flex-col justify-between`}
    >
      <div className="space-y-3.5">
        {/* Top Badges & Actions Bar */}
        <div className="flex items-start justify-between gap-2.5">
          {/* Left Badges Strip */}
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {/* Subject Pill */}
            <span
              className={`text-[10px] font-mono font-bold uppercase ${categoryTheme.badge} border px-2.5 py-0.5 rounded-full shrink-0`}
            >
              {lang === 'ta' ? capsule.categoryNameTa : capsule.categoryNameEn}
            </span>

            {/* High Yield Badge */}
            <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{capsule.highYieldBadge}</span>
            </span>

            {/* School Standards Covered Badges */}
            {capsule.standardsCovered && capsule.standardsCovered.length > 0 && (
              <span className="text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>
                  {capsule.standardsCovered.join(', ')} {lang === 'ta' ? 'வகுப்பு' : 'Std'}
                </span>
              </span>
            )}
          </div>

          {/* Right Action Icons: Copy & Expand */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className={`p-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                copied
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
              }`}
              title={t('குறிப்புகளை நகலெடு (Copy)', 'Copy Capsule')}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] hidden sm:inline text-emerald-300">
                    {t('நகலெடுக்கப்பட்டது', 'Copied')}
                  </span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
              title={expanded ? t('சுருக்குக', 'Collapse') : t('விரிவாக்குக', 'Expand')}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Topic Title */}
        <h3
          className={`text-base sm:text-lg font-bold text-white tracking-tight leading-snug break-words ${
            lang === 'ta' ? 'font-tamil' : ''
          }`}
        >
          {lang === 'ta' ? capsule.topicTa : capsule.topicEn}
        </h3>

        {/* Summary Brief */}
        <p
          className={`text-xs sm:text-sm text-slate-300 font-tamil leading-relaxed break-words ${
            !expanded ? 'line-clamp-2' : ''
          }`}
        >
          {lang === 'ta' ? capsule.summaryTa : capsule.summaryEn}
        </p>

        {/* Expandable Key Points & Formulas */}
        {expanded && (
          <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
            {/* Golden Formula or Core Quote Banner if present */}
            {capsule.formulaOrQuote && (
              <div
                className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs ${categoryTheme.formulaBg}`}
              >
                <div className="flex items-center space-x-2 font-mono font-bold break-words min-w-0">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="break-words leading-relaxed">{capsule.formulaOrQuote}</span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold opacity-80 shrink-0">
                  ⚡ {t('முக்கிய சூத்திரம் / விதி', 'Golden Rule')}
                </span>
              </div>
            )}

            {/* Key Bullet Points */}
            <div className="space-y-2">
              {(lang === 'ta' ? capsule.keyPointsTa : capsule.keyPointsEn).map((point, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-200">
                  <span className={`w-1.5 h-1.5 rounded-full ${categoryTheme.dot} mt-1.5 shrink-0`} />
                  <div className={`min-w-0 flex-1 break-words ${lang === 'ta' ? 'font-tamil' : ''}`}>
                    {formatKeyPoint(point)}
                  </div>
                </div>
              ))}
            </div>

            {/* Samacheer Kalvi School Book References Accordion */}
            {capsule.schoolBookRefsTa && capsule.schoolBookRefsTa.length > 0 && (
              <div className="bg-slate-950/70 border border-cyan-900/30 rounded-2xl p-3 text-xs space-y-2">
                <button
                  type="button"
                  onClick={() => setShowSources(!showSources)}
                  className="w-full flex items-center justify-between text-cyan-300 hover:text-cyan-200 font-mono font-semibold text-[11px] cursor-pointer"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {lang === 'ta'
                        ? `சமச்சீர் பாடப்புத்தக ஆதாரங்கள் (${capsule.schoolBookRefsTa.length})`
                        : `Samacheer School Book Sources (${capsule.schoolBookRefsTa.length})`}
                    </span>
                  </div>
                  {showSources ? (
                    <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  )}
                </button>

                {showSources && (
                  <ul className="space-y-1.5 pl-3 border-l-2 border-cyan-800/40 mt-1">
                    {(lang === 'ta'
                      ? capsule.schoolBookRefsTa
                      : capsule.schoolBookRefsEn || capsule.schoolBookRefsTa
                    ).map((ref, idx) => (
                      <li key={idx} className="text-[11px] text-cyan-200/90 font-tamil list-disc list-inside break-words">
                        {ref}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Mnemonics / Memory Tricks Callout */}
            {capsule.mnemonicsTa && (
              <div className="p-3 bg-amber-950/25 border border-amber-600/30 rounded-2xl text-xs text-amber-200 flex items-start space-x-2.5 font-tamil">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 break-words">
                  <strong className="block text-[11px] text-amber-300 uppercase font-mono">
                    {t('நினைவு உத்தி (Memory Mnemonic):', 'Memory Mnemonic:')}
                  </strong>
                  <p className="mt-0.5 opacity-90 leading-relaxed break-words">
                    {lang === 'ta' ? capsule.mnemonicsTa : capsule.mnemonicsEn || capsule.mnemonicsTa}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
