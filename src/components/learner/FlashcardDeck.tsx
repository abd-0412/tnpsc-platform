'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shuffle,
  Sparkles,
  Trophy,
  GraduationCap,
  BookOpen,
  Zap,
  Repeat
} from 'lucide-react';
import { Flashcard } from '@/lib/revision-data';
import { useLanguage } from '@/context/LanguageContext';

interface FlashcardDeckProps {
  cards: Flashcard[];
  categoryTitle: string;
}

export default function FlashcardDeck({ cards, categoryTitle }: FlashcardDeckProps) {
  const { lang, t } = useLanguage();

  const [deck, setDeck] = useState<Flashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());

  // Update deck when props change
  useEffect(() => {
    setDeck(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  }, [cards]);

  const currentCard = deck[currentIndex];

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev < deck.length - 1 ? prev + 1 : prev));
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleMarkMastered = () => {
    if (!currentCard) return;
    setMasteredIds((prev) => new Set(prev).add(currentCard.id));
    setReviewIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  const handleMarkReview = () => {
    if (!currentCard) return;
    setReviewIds((prev) => new Set(prev).add(currentCard.id));
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const handleReset = () => {
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleMarkMastered();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleMarkReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFlipped, currentCard]);

  if (!deck || deck.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 sm:p-12 text-center space-y-3 max-w-xl mx-auto shadow-2xl">
        <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white font-tamil">
          {t('இந்த வடிகட்டலில் Flashcards இல்லை', 'No Flashcards Found For This Selection')}
        </h3>
        <p className="text-xs text-slate-400 font-tamil max-w-sm mx-auto leading-relaxed">
          {t(
            'வகுப்பு அல்லது பாடப்பிரிவு வடிகட்டியை மாற்றி அனைத்து கார்டுகளையும் பார்வையிடவும்.',
            'Try switching the class or subject filter to view cards from other standards.'
          )}
        </p>
      </div>
    );
  }

  const isMastered = currentCard ? masteredIds.has(currentCard.id) : false;
  const isReview = currentCard ? reviewIds.has(currentCard.id) : false;
  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      {/* Top Deck Header & Progress */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
        {/* Left: Card Counter & Subtopic */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold font-mono text-xs shrink-0 shadow-sm">
            {currentIndex + 1}/{deck.length}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase truncate">
                {categoryTitle}
              </h3>
              {currentCard?.standardBadgeTa && (
                <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full shrink-0">
                  {lang === 'ta' ? currentCard.standardBadgeTa : currentCard.standardBadgeEn}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {currentCard?.subtopic}
            </p>
          </div>
        </div>

        {/* Right: Mastered Counter & Shuffle */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 font-mono font-bold">{masteredIds.size}</span>
            <span className="text-slate-500 text-[10px]">/</span>
            <span className="text-slate-400 font-mono text-[11px]">{deck.length}</span>
          </div>

          <button
            type="button"
            onClick={handleShuffle}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title={t('கார்டுகளை வரிசை மாற்று (Shuffle)', 'Shuffle Deck')}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="perspective-1000 relative w-full min-h-[20rem] sm:min-h-[22rem] md:min-h-[24rem] h-auto cursor-pointer select-none"
        style={{ perspective: 1000, WebkitPerspective: 1000 }}
      >
        <div
          className={`preserve-3d w-full h-full duration-500 transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            WebkitTransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ============================================================= */}
          {/* FRONT SIDE (Question / Prompt)                               */}
          {/* ============================================================= */}
          <div
            className="backface-hidden absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Front Card Top Meta */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20 font-bold">
                  {t('வினா (Front)', 'Question (Front)')}
                </span>
                {currentCard?.standardBadgeTa && (
                  <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    {lang === 'ta' ? currentCard.standardBadgeTa : currentCard.standardBadgeEn}
                  </span>
                )}
              </div>

              {currentCard?.hintTa && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono cursor-pointer px-2 py-0.5 rounded-md hover:bg-amber-500/10 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? t('மறை', 'Hide Hint') : t('குறிப்பு', 'Hint')}</span>
                </button>
              )}
            </div>

            {/* Front Content */}
            <div className="space-y-3.5 text-center my-auto py-3">
              <h4
                className={`text-base sm:text-xl md:text-2xl font-bold text-white leading-relaxed break-words ${
                  lang === 'ta' ? 'font-tamil' : ''
                }`}
              >
                {lang === 'ta' ? currentCard?.frontTa : currentCard?.frontEn}
              </h4>

              {showHint && currentCard?.hintTa && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 inline-block font-tamil max-w-full break-words animate-in fade-in">
                  💡 {t('குறிப்பு:', 'Hint:')}{' '}
                  {lang === 'ta' ? currentCard?.hintTa : currentCard?.hintEn}
                </div>
              )}

              {/* School Book Source Pill on Front */}
              {currentCard?.sourceRefTa && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-cyan-400/90 bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full max-w-full truncate">
                    <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {lang === 'ta'
                        ? currentCard.sourceRefTa
                        : currentCard.sourceRefEn || currentCard.sourceRefTa}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Front Footer Cue */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-800/60 font-mono">
              <span className="hidden sm:inline">Space / Tap to Flip</span>
              <span className="sm:hidden">{t('தொட்டு திருப்புக', 'Tap to flip')}</span>
              <span className="text-indigo-400 font-bold flex items-center gap-1">
                <span>{t('விடையைப் பார்', 'Show Answer')}</span>
                <Repeat className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* ============================================================= */}
          {/* BACK SIDE (Answer & Facts)                                   */}
          {/* ============================================================= */}
          <div
            className="backface-hidden absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-500/60 rounded-3xl p-5 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              WebkitTransform: 'rotateY(180deg)',
            }}
          >
            {/* Back Card Top Meta */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('விடை (Answer)', 'Answer (Back)')}
                </span>
                {currentCard?.standardBadgeTa && (
                  <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    {lang === 'ta' ? currentCard.standardBadgeTa : currentCard.standardBadgeEn}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[120px] sm:max-w-none">
                {currentCard?.subtopic}
              </span>
            </div>

            {/* Back Content */}
            <div className="space-y-3 sm:space-y-4 text-center my-auto py-3">
              <span className="text-[11px] sm:text-xs text-indigo-300 uppercase tracking-widest block font-bold font-mono">
                {t('சரியான விடை', 'Correct Answer')}
              </span>
              <h3
                className={`text-lg sm:text-2xl font-bold text-white leading-relaxed break-words ${
                  lang === 'ta' ? 'font-tamil' : ''
                }`}
              >
                {lang === 'ta' ? currentCard?.backTa : currentCard?.backEn}
              </h3>

              {/* Source Tag on back */}
              {currentCard?.sourceRefTa && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-emerald-300/90 bg-emerald-950/40 border border-emerald-800/30 px-3 py-1 rounded-full max-w-full truncate">
                    <GraduationCap className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      {lang === 'ta'
                        ? currentCard.sourceRefTa
                        : currentCard.sourceRefEn || currentCard.sourceRefTa}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Back Footer Cue */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/60 font-mono">
              <span className="hidden sm:inline">Rate recall below</span>
              <span className="sm:hidden">{t('கீழே மதிப்பீடு செய்', 'Rate below')}</span>
              <span className="text-indigo-300 flex items-center gap-1">
                <span>{t('மீண்டும் திருப்புக', 'Flip back')}</span>
                <Repeat className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls & Self-Rating */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3 shadow-xl">
        {/* Tier 1: Two Prominent Self-Rating Buttons (50/50 split) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkReview();
            }}
            className={`py-2.5 sm:py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 ${
              isReview
                ? 'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500/40'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-500/50'
            }`}
            title="Mark to review again later (Down Arrow)"
          >
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="whitespace-nowrap font-tamil">{t('மறந்துவிட்டது', 'Review Again')}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkMastered();
            }}
            className={`py-2.5 sm:py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 ${
              isMastered
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-emerald-500/80 shadow-md shadow-emerald-600/25'
            }`}
            title="Mark as mastered (Up Arrow)"
          >
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span className="whitespace-nowrap font-tamil">{t('நன்றாகத் தெரியும்!', 'Mastered!')}</span>
          </button>
        </div>

        {/* Tier 2: Prev, Flip & Next Navigation Strip */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold disabled:opacity-30 border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span className="font-tamil">{t('முந்தையது', 'Prev')}</span>
          </button>

          <button
            type="button"
            onClick={handleFlip}
            className="px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold border border-slate-700/80 flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Flip Card"
          >
            <Repeat className="w-3.5 h-3.5 shrink-0" />
            <span className="font-tamil">{t('திருப்புக', 'Flip')}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === deck.length - 1}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold disabled:opacity-30 border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span className="font-tamil">{t('அடுத்தது', 'Next')}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Completion Trophy Card */}
      {masteredIds.size === deck.length && deck.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/40 rounded-3xl text-center space-y-2.5 shadow-2xl animate-in fade-in">
          <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
          <h4 className="text-base sm:text-lg font-bold text-white font-tamil">
            {t('அற்புதம்! அனைத்து கார்டுகளையும் மனனம் செய்துவிட்டீர்கள்!', 'Deck Mastered! You recall 100% of these cards!')}
          </h4>
          <p className="text-xs text-slate-300 font-tamil max-w-md mx-auto leading-relaxed">
            {t(
              'இந்த அதிவிரைவு குறிப்புகள் TNPSC குரூப் 4 தேர்வில் உங்களுக்கு 4 முதல் 8 மதிப்பெண்கள் வரை கூடுதலாக பெற்றுத்தரும்.',
              'These high-yield flashcards will grant an immediate 4-8 mark boost in your actual exam score.'
            )}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('மீண்டும் பயிற்சி செய்', 'Practice Deck Again')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
