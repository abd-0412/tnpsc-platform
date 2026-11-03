'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  BookOpen,
  Search,
  Printer,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  Filter,
  CheckCircle2,
  Flame,
  HelpCircle,
  FileText,
  Compass,
  GraduationCap,
  X,
  RotateCcw,
  BookMarked
} from 'lucide-react';
import {
  TNPSC_REVISION_CAPSULES,
  TNPSC_FLASHCARDS,
  RevisionCapsule,
  Flashcard
} from '@/lib/revision-data';
import CapsuleCard from '@/components/learner/CapsuleCard';
import FlashcardDeck from '@/components/learner/FlashcardDeck';
import { useLanguage } from '@/context/LanguageContext';

export default function RevisionCapsulesPage() {
  const { lang, t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStandard, setActiveStandard] = useState<string>('all');
  const [activeMode, setActiveMode] = useState<'capsules' | 'flashcards'>('capsules');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories config
  const categories = [
    { id: 'all', labelTa: 'அனைத்து பகுதிகள்', labelEn: 'All Domains', icon: Layers },
    { id: 'tamil', labelTa: 'பொதுத்தமிழ்', labelEn: 'General Tamil', icon: BookOpen },
    { id: 'polity', labelTa: 'அரசியலமைப்பு', labelEn: 'Indian Polity', icon: Compass },
    { id: 'aptitude', labelTa: 'கணித சூத்திரங்கள்', labelEn: 'Aptitude Formulas', icon: Zap },
    { id: 'history', labelTa: 'வரலாறு & தலைவர்கள்', labelEn: 'History & Leaders', icon: Award },
  ];

  // Standards config (6th to 12th)
  const standards = [
    { id: 'all', labelTa: 'அனைத்து வகுப்புகள்', labelEn: 'All Classes' },
    { id: '6', labelTa: '6-ஆம் வகுப்பு', labelEn: '6th Std' },
    { id: '7', labelTa: '7-ஆம் வகுப்பு', labelEn: '7th Std' },
    { id: '8', labelTa: '8-ஆம் வகுப்பு', labelEn: '8th Std' },
    { id: '9', labelTa: '9-ஆம் வகுப்பு', labelEn: '9th Std' },
    { id: '10', labelTa: '10-ஆம் வகுப்பு', labelEn: '10th Std' },
    { id: '11-12', labelTa: '11 & 12-ஆம் வகுப்பு', labelEn: '11th & 12th' },
  ];

  // Filtered Capsules
  const filteredCapsules = useMemo(() => {
    return TNPSC_REVISION_CAPSULES.filter((c) => {
      // Category match
      const matchesCat = activeCategory === 'all' || c.category === activeCategory;
      if (!matchesCat) return false;

      // Standard match
      if (activeStandard !== 'all') {
        const matchesStd = c.standardsCovered?.some((s) =>
          activeStandard === '11-12' ? s === '11' || s === '12' : s === activeStandard
        );
        if (!matchesStd) return false;
      }

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const textMatch =
        c.topicTa.toLowerCase().includes(q) ||
        c.topicEn.toLowerCase().includes(q) ||
        c.summaryTa.toLowerCase().includes(q) ||
        c.keyPointsTa.some((p) => p.toLowerCase().includes(q)) ||
        (c.formulaOrQuote || '').toLowerCase().includes(q);

      return textMatch;
    });
  }, [activeCategory, activeStandard, searchQuery]);

  // Filtered Flashcards
  const filteredFlashcards = useMemo(() => {
    return TNPSC_FLASHCARDS.filter((f) => {
      // Category match
      const matchesCat = activeCategory === 'all' || f.category === activeCategory;
      if (!matchesCat) return false;

      // Standard match
      if (activeStandard !== 'all') {
        const matchesStd =
          activeStandard === '11-12'
            ? f.standard === '11' || f.standard === '12'
            : f.standard === activeStandard;
        if (!matchesStd) return false;
      }

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        f.frontTa.toLowerCase().includes(q) ||
        f.backTa.toLowerCase().includes(q) ||
        f.subtopic.toLowerCase().includes(q) ||
        (f.sourceRefTa || '').toLowerCase().includes(q)
      );
    });
  }, [activeCategory, activeStandard, searchQuery]);

  const categoryTitle =
    categories.find((c) => c.id === activeCategory)?.[lang === 'ta' ? 'labelTa' : 'labelEn'] ||
    'TNPSC Revision Deck';

  const isFilterActive = activeCategory !== 'all' || activeStandard !== 'all' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setActiveCategory('all');
    setActiveStandard('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-20 max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. HERO HEADER BANNER                                                     */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-4 sm:p-7 md:p-8 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            {/* Pill & Subtitle */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>TNPSC EXAM BOOST • 6-12 சமச்சீர் கல்வி</span>
              </span>
              <span className="text-xs text-indigo-300 font-mono hidden sm:inline">•</span>
              <span className="text-xs text-indigo-300 font-mono hidden sm:inline">
                {TNPSC_REVISION_CAPSULES.length} Capsules • {TNPSC_FLASHCARDS.length} Flashcards
              </span>
            </div>

            {/* Main Page Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 break-words">
              <div className="p-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                <Zap className="w-6 h-6" />
              </div>
              <span className="font-tamil">
                {t(
                  'விரைவு திருப்புதல் குறிப்புகள் & 3D Flashcards',
                  'High-Yield Revision Capsules & 3D Flashcards'
                )}
              </span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 font-tamil max-w-2xl leading-relaxed break-words">
              {lang === 'ta'
                ? '6 முதல் 12-ஆம் வகுப்பு வரை சமச்சீர் பாடநூல் ஆதாரங்களுடன் கூடிய அதிவிரைவு தலைப்புகள், பொன்மொழிகள், சூத்திரங்கள் மற்றும் 3D Flashcards கொண்டு TNPSC குரூப் 4 & VAO தேர்வுக்கு விரைவாகத் திருப்புதல் செய்யுங்கள்.'
                : 'Rapid memory booster featuring high-yield summaries, golden mathematical formulas, and active-recall 3D flashcards anchored directly to Samacheer Kalvi 6th to 12th textbooks.'}
            </p>
          </div>

          {/* Quick Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer print:hidden self-start md:self-auto"
            title="Print Revision Sheet (Ctrl + P)"
          >
            <Printer className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-tamil">{t('குறிப்புகளை அச்சிடு (Print)', 'Print Handout')}</span>
          </button>
        </div>

        {/* 4 Micro-KPI Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">CAPSULES</span>
            <strong className="text-lg sm:text-xl font-black text-indigo-300 font-mono">
              {TNPSC_REVISION_CAPSULES.length}
            </strong>
            <span className="text-[10px] text-slate-500 block font-tamil">{t('குறிப்புகள்', 'Notes')}</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">FLASHCARDS</span>
            <strong className="text-lg sm:text-xl font-black text-amber-400 font-mono">
              {TNPSC_FLASHCARDS.length}
            </strong>
            <span className="text-[10px] text-slate-500 block font-tamil">{t('நினைவு அட்டைகள்', 'Cards')}</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">CLASSES</span>
            <strong className="text-lg sm:text-xl font-black text-cyan-300 font-mono">6 - 12</strong>
            <span className="text-[10px] text-slate-500 block font-tamil">{t('வகுப்புகள்', 'Standards')}</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">DOMAINS</span>
            <strong className="text-lg sm:text-xl font-black text-emerald-400 font-mono">4 Core</strong>
            <span className="text-[10px] text-slate-500 block font-tamil">{t('பாடப்பிரிவுகள்', 'Subjects')}</span>
          </div>
        </div>

        {/* View Mode Switcher: 50/50 Dual Pill Tabs */}
        <div className="pt-2 print:hidden">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 max-w-md">
            <button
              type="button"
              onClick={() => setActiveMode('capsules')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'capsules'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="font-tamil truncate">
                {t('வாசிப்பு குறிப்புகள்', 'Capsule Reader')} ({filteredCapsules.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('flashcards')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'flashcards'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-tamil truncate">
                {t('3D Flashcards', '3D Flashcards')} ({filteredFlashcards.length})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTERS & SEARCH HUB                                                   */}
      {/* ========================================================================= */}
      <div className="space-y-3 print:hidden">
        {/* Row 1: Subject Categories & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Horizontal Scroll Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-tamil">{lang === 'ta' ? cat.labelTa : cat.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input Box with Instant Clear Button */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('தலைப்புகள், சூத்திரங்களைத் தேடுக...', 'Search formulas, articles...')}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner font-tamil"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: School Class (6th to 12th) Filter Pills */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 sm:p-2.5 flex items-center space-x-2 overflow-x-auto max-w-full scrollbar-none">
          <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-mono font-semibold pl-1.5 pr-2 shrink-0 border-r border-slate-800">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline font-tamil">{lang === 'ta' ? 'வகுப்பு:' : 'Standard:'}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            {standards.map((std) => {
              const isActive = activeStandard === std.id;
              return (
                <button
                  key={std.id}
                  type="button"
                  onClick={() => setActiveStandard(std.id)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] font-mono font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className="font-tamil">{lang === 'ta' ? std.labelTa : std.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Strip & Reset Action */}
        {isFilterActive && (
          <div className="flex items-center justify-between text-xs bg-indigo-950/30 border border-indigo-500/20 rounded-xl px-3 py-1.5">
            <div className="flex items-center gap-2 text-indigo-300 font-tamil">
              <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                {t('வடிகட்டப்பட்ட முடிவுகள்:', 'Filtered Results:')}{' '}
                <strong className="text-white">
                  {activeMode === 'capsules' ? filteredCapsules.length : filteredFlashcards.length}
                </strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="font-tamil">{t('வடிகட்டிகளை நீக்கு', 'Reset Filters')}</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT: CAPSULES READER OR 3D FLASHCARDS                         */}
      {/* ========================================================================= */}
      {activeMode === 'flashcards' ? (
        /* 3D Flashcards Deck Mode */
        <div className="pt-2">
          {filteredFlashcards.length === 0 ? (
            <div className="p-10 sm:p-14 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-sm sm:text-base font-bold text-slate-300 font-tamil">
                {t('கார்டுகள் எதுவும் கிடைக்கவில்லை', 'No flashcards matched your filter')}
              </h3>
              <p className="text-xs text-slate-500 font-tamil max-w-sm mx-auto leading-relaxed">
                {t(
                  'வகுப்பு அல்லது பாடப்பிரிவு வடிகட்டியை மாற்றி அனைத்து கார்டுகளையும் பார்வையிடவும்.',
                  'Try resetting filters to explore flashcards across all standards.'
                )}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="font-tamil">{t('அனைத்து கார்டுகளையும் காட்டு', 'Show All Flashcards')}</span>
              </button>
            </div>
          ) : (
            <FlashcardDeck cards={filteredFlashcards} categoryTitle={categoryTitle} />
          )}
        </div>
      ) : (
        /* Capsule Reader Mode */
        <div className="space-y-5">
          {filteredCapsules.length === 0 ? (
            <div className="p-10 sm:p-14 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-sm sm:text-base font-bold text-slate-300 font-tamil">
                {t('குறிப்புகள் எதுவும் கிடைக்கவில்லை', 'No revision capsules found')}
              </h3>
              <p className="text-xs text-slate-500 font-tamil max-w-sm mx-auto leading-relaxed">
                {t(
                  'தேடல் வினவலை மாற்றவும் அல்லது வேறு வகுப்பு/பாடப்பிரிவைத் தேர்ந்தெடுக்கவும்.',
                  'Try modifying your search or picking another subject or class standard.'
                )}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="font-tamil">{t('அனைத்து குறிப்புகளையும் காட்டு', 'Show All Capsules')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCapsules.map((capsule) => (
                <CapsuleCard key={capsule.id} capsule={capsule} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
