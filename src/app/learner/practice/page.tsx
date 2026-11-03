'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Award,
  Filter,
  Check,
  Languages
} from 'lucide-react';

interface QuestionOption {
  id: string;
  text: string;
}

interface QuestionItem {
  id: string;
  kind?: string;
  difficulty?: string;
  subject?: string;
  texts: {
    ta: {
      question?: string;
      options?: any;
      explanation?: string;
      blocks?: Array<{ type: string; content: string }>;
    };
    en?: {
      question?: string;
      options?: any;
      explanation?: string;
      blocks?: Array<{ type: string; content: string }>;
    };
  };
  answer: {
    correct_option_id: string;
  };
  syllabus?: {
    subject_id?: string;
    standard?: number;
    node_id?: string;
    node_title?: string;
  };
  source?: {
    book?: string;
    term?: string;
    unit?: string;
    page_number?: number;
    citation?: string;
  };
  tags?: string[];
  is_in_vault?: boolean;
}

function isTamilSubject(q: QuestionItem): boolean {
  const subj = (q.syllabus?.subject_id || q.subject || '').toLowerCase();
  const title = (q.syllabus?.node_title || '').toLowerCase();
  const tags = (q.tags || []).map((t) => t.toLowerCase());
  return (
    subj.includes('tamil') ||
    subj === 'general_tamil' ||
    title.includes('தமிழ்') ||
    title.includes('இலக்கியம்') ||
    title.includes('இலக்கணம்') ||
    title.includes('திருக்குறள்') ||
    tags.some((t) => t.includes('tamil'))
  );
}

function getQuestionContent(q: QuestionItem, lang: 'ta' | 'en'): string {
  // If the question is General Tamil / Tamil literature, keep Tamil text
  if (isTamilSubject(q)) {
    const textObj = q.texts?.ta || q.texts?.en || {};
    return textObj.question || textObj.blocks?.[0]?.content || 'வினா உரை இல்லை';
  }

  // For General Studies / Aptitude / Polity / History / Science:
  const textObj = q.texts?.[lang] || q.texts?.ta || q.texts?.en || {};
  if (textObj.question) return textObj.question;
  if (textObj.blocks?.[0]?.content) return textObj.blocks[0].content;
  return 'வினா உரை இல்லை (Question text unavailable)';
}

function getOptionsArray(q: QuestionItem, lang: 'ta' | 'en'): QuestionOption[] {
  const useLang = isTamilSubject(q) ? 'ta' : lang;
  const textObj = q.texts?.[useLang] || q.texts?.ta || q.texts?.en || {};
  const opts = textObj.options;
  if (!opts) return [];

  if (Array.isArray(opts)) {
    return opts.map((o: any) => ({
      id: String(o.id || ''),
      text: String(o.text || o.content || ''),
    }));
  }

  if (typeof opts === 'object') {
    return Object.entries(opts).map(([key, val]) => ({
      id: key,
      text: typeof val === 'string' ? val : String((val as any)?.text || ''),
    }));
  }

  return [];
}

function getExplanation(q: QuestionItem, lang: 'ta' | 'en'): string {
  const useLang = isTamilSubject(q) ? 'ta' : lang;
  const textObj = q.texts?.[useLang] || q.texts?.ta || q.texts?.en || {};
  return textObj.explanation || (lang === 'en' ? 'No explanation provided.' : 'விளக்கம் சேர்க்கப்படவில்லை.');
}

function PracticeSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const nodeIdParam = searchParams.get('nodeId') || '';
  const nodeTitleParam = searchParams.get('title') || '';

  // Filter States
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Session States
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [vaultMap, setVaultMap] = useState<Record<string, boolean>>({});
  const [vaultLoading, setVaultLoading] = useState(false);

  // Performance tally
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredMap, setAnsweredMap] = useState<Record<string, { selected: string; isCorrect: boolean }>>({});
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Fetch practice questions from dedicated API
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setSessionCompleted(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setCorrectCount(0);
    setWrongCount(0);
    setAnsweredMap({});

    try {
      const params = new URLSearchParams();
      if (nodeIdParam) params.set('nodeId', nodeIdParam);
      if (selectedSubject !== 'all') params.set('subject', selectedSubject);
      if (selectedClass !== 'all') params.set('standard', selectedClass);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
      params.set('limit', '30');

      const res = await fetch(`/api/learner/practice?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        const qList: QuestionItem[] = data.questions || [];
        setQuestions(qList);

        // Prepopulate mistake vault bookmark state
        const initialVault: Record<string, boolean> = {};
        qList.forEach((q) => {
          if (q.is_in_vault) initialVault[q.id] = true;
        });
        setVaultMap(initialVault);
      }
    } catch (err) {
      console.error('Failed to load practice questions:', err);
    } finally {
      setLoading(false);
    }
  }, [nodeIdParam, selectedSubject, selectedClass, selectedDifficulty]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const currentQ = questions[currentIndex];

  // Options memoization for current question
  const options = useMemo(() => {
    if (!currentQ) return [];
    return getOptionsArray(currentQ, lang);
  }, [currentQ, lang]);

  // Handle option selection
  const handleSelectOption = (optId: string) => {
    if (isAnswerRevealed || !currentQ) return;

    setSelectedOption(optId);
    setIsAnswerRevealed(true);

    const isCorrect = currentQ.answer?.correct_option_id === optId;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((w) => w + 1);
    }

    setAnsweredMap((prev) => ({
      ...prev,
      [currentQ.id]: { selected: optId, isCorrect },
    }));
  };

  // Navigate to Next Question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      const nextQ = questions[nextIdx];
      const prevAnswer = answeredMap[nextQ.id];
      if (prevAnswer) {
        setSelectedOption(prevAnswer.selected);
        setIsAnswerRevealed(true);
      } else {
        setSelectedOption(null);
        setIsAnswerRevealed(false);
      }
    } else {
      setSessionCompleted(true);
    }
  };

  // Navigate to Previous Question
  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);

      const prevQ = questions[prevIdx];
      const prevAnswer = answeredMap[prevQ.id];
      if (prevAnswer) {
        setSelectedOption(prevAnswer.selected);
        setIsAnswerRevealed(true);
      } else {
        setSelectedOption(null);
        setIsAnswerRevealed(false);
      }
    }
  };

  // Toggle Mistake Vault Bookmark
  const handleToggleVault = async (questionId: string) => {
    if (vaultLoading) return;
    setVaultLoading(true);

    const isCurrentlySaved = !!vaultMap[questionId];
    try {
      if (isCurrentlySaved) {
        // Remove from vault
        const res = await fetch(`/api/learner/mistakes?question_id=${questionId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setVaultMap((prev) => ({ ...prev, [questionId]: false }));
        }
      } else {
        // Add to vault
        const res = await fetch('/api/learner/mistakes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_id: questionId }),
        });
        if (res.ok) {
          setVaultMap((prev) => ({ ...prev, [questionId]: true }));
        }
      }
    } catch (err) {
      console.error('Error toggling mistake vault:', err);
    } finally {
      setVaultLoading(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (isAnswerRevealed) handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (['1', '2', '3', '4'].includes(e.key) && !isAnswerRevealed && options.length > 0) {
        const idx = parseInt(e.key, 10) - 1;
        if (options[idx]) handleSelectOption(options[idx].id);
      } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase()) && !isAnswerRevealed) {
        const letter = e.key.toUpperCase();
        const match = options.find((o) => o.id === letter);
        if (match) handleSelectOption(match.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isAnswerRevealed, options, questions.length]);

  const totalAttempted = correctCount + wrongCount;
  const accuracyRate = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">
          {t('வினா வங்கி ஏற்றப்படுகிறது...', 'Loading practice questions...')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      {/* Top Header & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-start sm:items-center space-x-3">
            <Link
              href="/learner/syllabus"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 mt-0.5 sm:mt-0"
              title={t('பாடத்திட்டத்திற்குத் திரும்பு', 'Back to Syllabus')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                  {t('உடனடி பயிற்சி மையம்', 'Interactive Practice Centre')}
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-[11px] sm:text-xs text-slate-400">
                  {t('உடனடி விடை & விளக்கம்', 'Instant Solution & Textbook Citations')}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white mt-0.5 break-words">
                {nodeTitleParam || t('TNPSC பயிற்சி மையம் (Practice Bank)', 'TNPSC Practice Bank')}
              </h1>
            </div>
          </div>

          {/* Quick Metrics & Language Toggle */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Live Tally Badges */}
            <div className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold">
              <span className="text-emerald-400 font-bold">✓ {correctCount}</span>
              <span className="text-slate-600">|</span>
              <span className="text-rose-400 font-bold">✗ {wrongCount}</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold">{accuracyRate}%</span>
            </div>

            {/* Language Switch */}
            <div className="flex items-center p-0.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setLang('ta')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'ta' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              {t('பாடம்', 'Subject')}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">{t('அனைத்துப் பாடங்கள் (All Subjects)', 'All Subjects')}</option>
              <option value="general_tamil">{t('பொதுத்தமிழ் (General Tamil)', 'General Tamil')}</option>
              <option value="indian_polity">{t('இந்திய அரசியலமைப்பு (Polity)', 'Indian Polity')}</option>
              <option value="aptitude">{t('கணிதம் & திறனறிவு (Aptitude)', 'Aptitude & Mental Ability')}</option>
              <option value="unit_8">{t('அலகு 8: தமிழக வரலாறு & பண்பாடு', 'Unit 8: TN History & Culture')}</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              {t('வகுப்பு', 'Standard')}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">{t('அனைத்து வகுப்புகள் (All Standards)', 'All Standards')}</option>
              <option value="6">{t('6-ஆம் வகுப்பு (6th Standard)', '6th Standard')}</option>
              <option value="7">{t('7-ஆம் வகுப்பு (7th Standard)', '7th Standard')}</option>
              <option value="8">{t('8-ஆம் வகுப்பு (8th Standard)', '8th Standard')}</option>
              <option value="9">{t('9-ஆம் வகுப்பு (9th Standard)', '9th Standard')}</option>
              <option value="10">{t('10-ஆம் வகுப்பு (10th Standard)', '10th Standard')}</option>
              <option value="11">{t('11-ஆம் வகுப்பு (11th Standard)', '11th Standard')}</option>
              <option value="12">{t('12-ஆம் வகுப்பு (12th Standard)', '12th Standard')}</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              {t('கடினத்தன்மை', 'Difficulty')}
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">{t('அனைத்து நிலைகள் (All Levels)', 'All Levels')}</option>
              <option value="easy">{t('எளியது (Easy)', 'Easy')}</option>
              <option value="medium">{t('நடுத்தரம் (Medium)', 'Medium')}</option>
              <option value="hard">{t('கடினம் (Hard)', 'Hard')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {questions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-slate-900/80 rounded-3xl border border-slate-800 space-y-4 max-w-lg mx-auto my-8">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
          <h2 className="text-base font-bold text-white">
            {t('இப்பிரிவில் வினாக்கள் கண்டறியப்படவில்லை', 'No Questions Found for Selected Filters')}
          </h2>
          <p className="text-slate-400 leading-relaxed">
            {t(
              'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுக்கு வினாக்கள் இல்லை. வடிகட்டிகளை மாற்றி முயற்சிக்கவும்.',
              'No practice questions match the selected filters. Please reset filters to view all questions.'
            )}
          </p>
          <button
            onClick={() => {
              setSelectedSubject('all');
              setSelectedClass('all');
              setSelectedDifficulty('all');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer"
          >
            {t('அனைத்து வினாக்களையும் காட்டு (Reset Filters)', 'Reset Filters')}
          </button>
        </div>
      ) : sessionCompleted ? (
        /* Session Completed Congratulatory Screen */
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {t('பயிற்சி அமர்வு நிறைவடைந்தது!', 'Practice Session Completed!')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('உங்கள் துல்லியத்தை சரிபார்த்து தவறுகளை பெட்டகத்தில் திருத்தவும்.', 'Check your performance summary and review flagged questions in Mistake Vault.')}
            </p>
          </div>

          {/* Scorecard Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">{t('சரியானவை', 'Correct')}</span>
              <strong className="text-lg text-emerald-400 font-bold">{correctCount}</strong>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">{t('தவறானவை', 'Incorrect')}</span>
              <strong className="text-lg text-rose-400 font-bold">{wrongCount}</strong>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">{t('துல்லியம்', 'Accuracy')}</span>
              <strong className="text-lg text-amber-400 font-bold">{accuracyRate}%</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={loadQuestions}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('மீண்டும் பயிற்சி செய்', 'Practice Again')}</span>
            </button>

            <Link
              href="/learner/mistake-vault"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-amber-500/30 transition"
            >
              <Flame className="w-4 h-4" />
              <span>{t('தவறு திருத்த பெட்டகம்', 'Mistake Vault')}</span>
            </Link>

            <Link
              href="/learner/tests"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('நேர மாதிரித் தேர்வு எழுது', 'Take Timed Mock Test')}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Interactive Question Card */
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 sm:space-y-6">
            {/* Question Counter & Vault Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {t('வினா', 'Question')} {currentIndex + 1} / {questions.length}
                </span>
                <span className="font-mono text-[10px] text-amber-400 font-semibold">
                  {currentQ.id}
                </span>
                {currentQ.syllabus?.subject_id && (
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    • {currentQ.syllabus.subject_id}
                  </span>
                )}
              </div>

              {/* Mistake Vault Bookmark Button */}
              <button
                onClick={() => handleToggleVault(currentQ.id)}
                disabled={vaultLoading}
                className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  vaultMap[currentQ.id]
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
                title={t('தவறு பெட்டகத்தில் சேர்', 'Bookmark to Mistake Vault')}
              >
                <Flame className={`w-3.5 h-3.5 ${vaultMap[currentQ.id] ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                <span>
                  {vaultMap[currentQ.id]
                    ? t('பெட்டகத்தில் உள்ளது (Saved)', 'In Vault')
                    : t('பெட்டகத்தில் சேர்', 'Add to Vault')}
                </span>
              </button>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <p className={`text-sm sm:text-base md:text-lg font-bold text-white leading-relaxed break-words whitespace-pre-line ${isTamilSubject(currentQ) || lang === 'ta' ? 'font-tamil' : ''}`}>
                {getQuestionContent(currentQ, lang)}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 sm:space-y-3 pt-1">
              {options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrectOption = currentQ.answer?.correct_option_id === opt.id;

                let optionStyle =
                  'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-200 hover:border-slate-700 active:scale-[0.99]';

                if (isAnswerRevealed) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold shadow-lg shadow-emerald-500/10';
                  } else if (isSelected) {
                    optionStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-semibold';
                  } else {
                    optionStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={isAnswerRevealed}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer gap-3 ${optionStyle}`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <span className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 font-mono transition-colors shadow-sm ${
                        isAnswerRevealed && isCorrectOption
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : isAnswerRevealed && isSelected
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-900 border-slate-700 text-slate-200'
                      }`}>
                        {opt.id}
                      </span>
                      <span className={`text-sm sm:text-base leading-relaxed break-words flex-1 min-w-0 ${isTamilSubject(currentQ) || lang === 'ta' ? 'font-tamil' : ''}`}>
                        {opt.text}
                      </span>
                    </div>

                    {isAnswerRevealed && isCorrectOption && (
                      <div className="flex items-center space-x-1 shrink-0 text-emerald-400 text-xs font-bold font-mono">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="hidden sm:inline">{t('சரியான விடை', 'Correct')}</span>
                      </div>
                    )}
                    {isAnswerRevealed && isSelected && !isCorrectOption && (
                      <div className="flex items-center space-x-1 shrink-0 text-rose-400 text-xs font-bold font-mono">
                        <XCircle className="w-5 h-5" />
                        <span className="hidden sm:inline">{t('தவறு', 'Wrong')}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Solution & Textbook Citation Callout */}
            {isAnswerRevealed && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5 min-w-0 truncate">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t('பாடப்புத்தக விளக்கம் (Explanation)', 'Textbook Citation & Explanation')}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold uppercase bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-lg text-emerald-400 shrink-0 whitespace-nowrap">
                    {t('விடை', 'Key')}: {currentQ.answer?.correct_option_id}
                  </span>
                </div>

                <p className={`text-xs text-slate-300 leading-relaxed whitespace-pre-line break-words ${isTamilSubject(currentQ) || lang === 'ta' ? 'font-tamil' : ''}`}>
                  {getExplanation(currentQ, lang)}
                </p>

                {currentQ.source && (currentQ.source.book || currentQ.source.citation) && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-slate-400 font-mono">
                    <span className="break-words">
                      {t('ஆதாரம்:', 'Citation:')} {currentQ.source.book || currentQ.source.citation}
                      {currentQ.source.page_number ? ` (${t('பக்கம்', 'Page')} ${currentQ.source.page_number})` : ''}
                    </span>
                    {currentQ.difficulty && (
                      <span className="text-[10px] text-amber-400 shrink-0">
                        {t('நிலை:', 'Level:')} {currentQ.difficulty}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Navigation Buttons: 100% Responsive, Zero-Clip */}
            <div className="flex items-center justify-between pt-3.5 sm:pt-5 border-t border-slate-800 gap-2 sm:gap-4">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer border border-slate-700 text-center min-w-0"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('முந்தைய', 'Previous')}</span>
              </button>

              <div className="text-[11px] text-slate-500 font-mono hidden md:block">
                Question <strong className="text-white">{currentIndex + 1}</strong> of {questions.length}
              </div>

              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer text-center min-w-0"
              >
                <span className="truncate">
                  {currentIndex === questions.length - 1
                    ? t('முடி (Finish)', 'Finish')
                    : t('அடுத்தது (Next)', 'Next')}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <PracticeSession />
    </Suspense>
  );
}
