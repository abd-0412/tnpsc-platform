'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Sparkles,
  Target,
  Clock,
  ShieldCheck,
  GraduationCap,
  Layers,
  BookmarkCheck,
  Zap,
  Check
} from 'lucide-react';

interface ExamInfo {
  id: string;
  code: string;
  titleEn: string;
  titleTa: string;
  taglineTa: string;
  taglineEn: string;
  badgeTa: string;
  badgeEn: string;
  badgeColor: string;
  qualificationTa: string;
  qualificationEn: string;
  selectionTa: string;
  selectionEn: string;
  postsTa: string[];
  postsEn: string[];
  totalMarks: number;
  durationMinutes: number;
  totalQuestions: number;
  scheme: {
    sectionTa: string;
    sectionEn: string;
    questions: number;
    marks: number;
    standardTa: string;
    standardEn: string;
    isMandatory?: boolean;
    noteTa?: string;
    noteEn?: string;
  }[];
  keyHighlightsTa: string[];
  keyHighlightsEn: string[];
}

const EXAMS_DATA: ExamInfo[] = [
  {
    id: 'group_4',
    code: 'CCSE-IV',
    titleEn: 'TNPSC Group 4 & VAO',
    titleTa: 'டி.என்.பி.எஸ்.சி குரூப் 4 & வி.ஏ.ஓ',
    taglineTa: 'கிராம நிர்வாக அலுவலர் & இளநிலை உதவியாளர் பணிகள்',
    taglineEn: 'Village Administrative Officer & Junior Assistant Services',
    badgeTa: 'மிகவும் பிரபலம் (Most Popular)',
    badgeEn: 'Most Popular Examination',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    qualificationTa: '10-ஆம் வகுப்பு தேர்ச்சி (SSLC Pass)',
    qualificationEn: '10th Standard (SSLC) Pass or Equivalent',
    selectionTa: 'ஒற்றை நிலை எழுத்துத் தேர்வு (Single Stage OMR Written Exam)',
    selectionEn: 'Single Stage OMR Objective Written Exam (No Interview)',
    postsTa: [
      'கிராம நிர்வாக அலுவலர் (VAO)',
      'இளநிலை உதவியாளர் (Junior Assistant - Non-Security & Security)',
      'வரித் தண்டலர் (Bill Collector Grade-I)',
      'தட்டச்சர் (Typist)',
      'சுருக்கெழுத்து தட்டச்சர் (Steno-Typist Grade-III)',
      'வனக்காவலர் (Forest Guard & Forest Watcher)',
    ],
    postsEn: [
      'Village Administrative Officer (VAO)',
      'Junior Assistant (Non-Security & Security)',
      'Bill Collector Grade-I',
      'Typist',
      'Steno-Typist Grade-III',
      'Forest Guard & Forest Watcher',
    ],
    totalMarks: 300,
    durationMinutes: 180,
    totalQuestions: 200,
    scheme: [
      {
        sectionTa: 'பகுதி அ: கட்டாயத் தமிழ் மொழித் தகுதி மற்றும் மதிப்பீட்டுத் தேர்வு',
        sectionEn: 'Part A: Mandatory Tamil Eligibility & Scoring Test',
        questions: 100,
        marks: 150,
        standardTa: '10-ஆம் வகுப்பு தரம் (SSLC Standard)',
        standardEn: 'SSLC Standard (Samacheer Kalvi)',
        isMandatory: true,
        noteTa: 'குறைந்தபட்ச தகுதி மதிப்பெண்: 40% (60 மதிப்பெண்கள்). இதில் தகுதி பெற்றால் மட்டுமே பகுதி ஆ மதிப்பீடு செய்யப்படும்.',
        noteEn: 'Minimum qualifying mark: 40% (60 marks). Part B will only be evaluated if you qualify in Part A.',
      },
      {
        sectionTa: 'பகுதி ஆ (1): பொது அறிவு (General Studies)',
        sectionEn: 'Part B (1): General Studies',
        questions: 75,
        marks: 112.5,
        standardTa: '10-ஆம் வகுப்பு தரம் (SSLC Standard)',
        standardEn: 'SSLC Standard',
      },
      {
        sectionTa: 'பகுதி ஆ (2): திறனறிவும் மனக்கணக்கும் (Aptitude & Mental Ability)',
        sectionEn: 'Part B (2): Aptitude & Mental Ability',
        questions: 25,
        marks: 37.5,
        standardTa: '10-ஆம் வகுப்பு தரம் (SSLC Standard)',
        standardEn: 'SSLC Standard',
      },
    ],
    keyHighlightsTa: [
      'நேர்முகத் தேர்வு கிடையாது (No Interview) — எழுத்துத் தேர்வு மதிப்பெண் மட்டுமே வேலைவாய்ப்பை நிர்ணயிக்கும்.',
      'பகுதி அ பொதுத்தமிழ் 100 வினாக்களில் 95+ எடுப்பதே வெற்றிக்கு முக்கிய வழிகாட்டி.',
      'தவறான விடைகளுக்கு எதிர்மறை மதிப்பெண் (Negative Marking) கிடையாது.',
      'விடை தெரியாத வினாக்களுக்கு (E) குமிழியை நிழலிடுதல் கட்டாயமாகும்.',
    ],
    keyHighlightsEn: [
      'Single stage objective written exam with OMR answering — No interview round.',
      'Scoring 95+ out of 100 in Part A General Tamil is decisive for securing a top state rank.',
      'No negative marking for incorrect options.',
      'Option (E) must be shaded on the OMR sheet for unattempted questions per TNPSC rules.',
    ],
  },
  {
    id: 'group_2',
    code: 'CCSE-II (Interview)',
    titleEn: 'TNPSC Group 2 (Interview Posts)',
    titleTa: 'டி.என்.பி.எஸ்.சி குரூப் 2 (நேர்முகப் பதவிகள்)',
    taglineTa: 'துணை வணிகவரி அலுவலர் & சார்-பதிவாளர் நிலை-2',
    taglineEn: 'Sub-Registrar, Municipal Commissioner & Executive Posts',
    badgeTa: 'உயர் நிர்வாகப் பதவிகள் (Executive Cadre)',
    badgeEn: 'Executive & Administrative Cadre',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    qualificationTa: 'ஏதேனும் ஒரு இளங்கலை பட்டம் (Any Bachelor\'s Degree)',
    qualificationEn: 'Any Bachelor\'s Degree from a recognized university',
    selectionTa: 'முதல்நிலைத் தேர்வு (OMR) → முதன்மைத் தேர்வு (Descriptive) → நேர்முகத் தேர்வு (Interview)',
    selectionEn: 'Preliminary (OMR) → Main Written (Descriptive) → Oral Interview (40 Marks)',
    postsTa: [
      'சார் பதிவாளர் நிலை-2 (Sub-Registrar Grade-II)',
      'நகராட்சி ஆணையர் நிலை-2 (Municipal Commissioner Grade-II)',
      'உதவி வணிகவரி அலுவலர் (Assistant Commercial Tax Officer)',
      'துணை வணிகவரி அலுவலர் (Deputy Commercial Tax Officer)',
      'சிறைத்துறை நன்னடத்தை அலுவலர் (Probation Officer)',
      'தொழிலாளர் நல உதவி ஆய்வாளர் (Assistant Inspector of Labour)',
    ],
    postsEn: [
      'Sub-Registrar Grade-II (Registration Dept)',
      'Municipal Commissioner Grade-II',
      'Assistant Commercial Tax Officer (ACTO)',
      'Deputy Commercial Tax Officer',
      'Probation Officer (Prisons & Social Defence)',
      'Assistant Inspector of Labour',
    ],
    totalMarks: 300,
    durationMinutes: 180,
    totalQuestions: 200,
    scheme: [
      {
        sectionTa: 'பகுதி அ: கட்டாயத் தமிழ் மொழித் தகுதி மற்றும் மதிப்பீட்டுத் தேர்வு',
        sectionEn: 'Part A: Mandatory Tamil Eligibility & Scoring Test',
        questions: 100,
        marks: 150,
        standardTa: '10-ஆம் வகுப்பு தரம் (SSLC Standard)',
        standardEn: 'SSLC Standard',
        isMandatory: true,
        noteTa: 'குறைந்தபட்ச தகுதி மதிப்பெண் 40% (60 மதிப்பெண்கள்).',
        noteEn: 'Minimum qualifying mark: 40% (60 marks).',
      },
      {
        sectionTa: 'பகுதி ஆ (1): பொது அறிவு (General Studies)',
        sectionEn: 'Part B (1): General Studies',
        questions: 75,
        marks: 112.5,
        standardTa: 'பட்டப்படிப்பு தரம் (Degree Standard)',
        standardEn: 'Degree Standard',
      },
      {
        sectionTa: 'பகுதி ஆ (2): திறனறிவும் மனக்கணக்கும் (Aptitude & Mental Ability)',
        sectionEn: 'Part B (2): Aptitude & Mental Ability',
        questions: 25,
        marks: 37.5,
        standardTa: '10-ஆம் வகுப்பு தரம் (SSLC Standard)',
        standardEn: 'SSLC Standard',
      },
    ],
    keyHighlightsTa: [
      'முதல்நிலைத் தேர்வு (Prelims) தகுதித் தேர்வாக மட்டுமே செயல்படும் (Shortlisting for Mains).',
      'முதன்மைத் தேர்வு (Mains): தாள் 1 (தமிழ் மொழி தகுதித் தேர்வு - கட்டாயம்) + தாள் 2 (பொது அறிவு விரிவான விடையளிக்கும் முறை - 300 மதிப்பெண்கள்).',
      'நேர்முகத் தேர்வு (Interview): 40 மதிப்பெண்கள்.',
    ],
    keyHighlightsEn: [
      'Preliminary exam is qualifying in nature for Mains shortlisting (1:10 ratio).',
      'Main written exam contains Paper 1 (Tamil Eligibility) + Paper 2 (General Studies Descriptive 300 Marks).',
      'Oral test / interview carries 40 marks.',
    ],
  },
  {
    id: 'group_2a',
    code: 'CCSE-IIA (Non-Interview)',
    titleEn: 'TNPSC Group 2A (Non-Interview Posts)',
    titleTa: 'டி.என்.பி.எஸ்.சி குரூப் 2A (நேர்முகத் தேர்வல்லா பதவிகள்)',
    taglineTa: 'தலைமைச் செயலக உதவியாளர் & அமைச்சுப் பணிகள்',
    taglineEn: 'Secretariat Assistant & Departmental Ministerial Cadre',
    badgeTa: 'அமைச்சுப் பதவிகள் (Ministerial Cadre)',
    badgeEn: 'Ministerial & Departmental Cadre',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    qualificationTa: 'ஏதேனும் ஒரு இளங்கலை பட்டம் (Any Bachelor\'s Degree)',
    qualificationEn: 'Any Bachelor\'s Degree from a recognized university',
    selectionTa: 'முதல்நிலைத் தேர்வு (OMR) → முதன்மை எழுத்துத் தேர்வு (Descriptive) → சான்றிதழ் சரிபார்ப்பு (No Interview)',
    selectionEn: 'Preliminary (OMR) → Main Written Examination (Descriptive) → Certificate Verification (No Interview)',
    postsTa: [
      'தலைமைச் செயலக உதவியாளர் (Assistant in Secretariat - Various Depts)',
      'TNPSC உதவியாளர் (Assistant in TNPSC)',
      'வருவாய்த் துறை உதவியாளர் (Assistant in Revenue Department)',
      'உள்ளாட்சி நிதித் தணிக்கை உதவியாளர் (Local Fund Audit Assistant)',
      'வணிகவரி உதவியாளர் (Assistant in Commercial Taxes)',
      'கூட்டுறவு சங்கங்களின் இளநிலை ஆய்வாளர் (Junior Inspector of Co-op Societies)',
    ],
    postsEn: [
      'Assistant in Tamil Nadu Secretariat',
      'Assistant in TNPSC',
      'Assistant in Revenue Administration',
      'Audit Assistant in Local Fund Audit Department',
      'Assistant in Commercial Taxes Department',
      'Junior Inspector of Co-operative Societies',
    ],
    totalMarks: 300,
    durationMinutes: 180,
    totalQuestions: 200,
    scheme: [
      {
        sectionTa: 'பகுதி அ: கட்டாயத் தமிழ் மொழித் தகுதி மற்றும் மதிப்பீட்டுத் தேர்வு',
        sectionEn: 'Part A: Mandatory Tamil Eligibility & Scoring Test',
        questions: 100,
        marks: 150,
        standardTa: '10-ஆம் வகுப்பு தரம் (SSLC Standard)',
        standardEn: 'SSLC Standard',
        isMandatory: true,
        noteTa: 'குறைந்தபட்ச தகுதி மதிப்பெண் 40% (60 மதிப்பெண்கள்).',
        noteEn: 'Minimum qualifying mark: 40% (60 marks).',
      },
      {
        sectionTa: 'பகுதி ஆ (1): பொது அறிவு (General Studies)',
        sectionEn: 'Part B (1): General Studies',
        questions: 75,
        marks: 112.5,
        standardTa: 'பட்டப்படிப்பு தரம் (Degree Standard)',
        standardEn: 'Degree Standard',
      },
      {
        sectionTa: 'பகுதி ஆ (2): திறனறிவும் மனக்கணக்கும் (Aptitude & Mental Ability)',
        sectionEn: 'Part B (2): Aptitude & Mental Ability',
        questions: 25,
        marks: 37.5,
        standardTa: '10-ஆம் வகுப்பு தரம் (SSLC Standard)',
        standardEn: 'SSLC Standard',
      },
    ],
    keyHighlightsTa: [
      'நேர்முகத் தேர்வு கிடையாது (No Oral Interview).',
      'முதல்நிலைத் தேர்வு குரூப் 2 மற்றும் 2A இரண்டிற்கும் பொதுவான ஒரே வினாத்தாள் ஆகும்.',
      'முதன்மைத் தேர்வு எழுத்துத் தேர்வு மட்டுமே இறுதித் தரவரிசையை நிர்ணயிக்கும்.',
    ],
    keyHighlightsEn: [
      'No oral interview. Final selection is purely based on Main written examination marks.',
      'Preliminary examination syllabus and question paper are combined with Group 2.',
      'Certificate verification followed by single counseling process.',
    ],
  },
];

export default function LearnerExamsPage() {
  const { lang, t } = useLanguage();
  const [selectedExamId, setSelectedExamId] = useState<string>('group_4');
  const [currentTargetExamId, setCurrentTargetExamId] = useState<string>('group_4');
  const [updatingTarget, setUpdatingTarget] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/learner/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.target_exam_id) {
            setCurrentTargetExamId(data.profile.target_exam_id);
            setSelectedExamId(data.profile.target_exam_id);
          }
        }
      } catch (err) {
        console.error('Failed to load learner profile:', err);
      }
    }
    loadProfile();
  }, []);

  const handleSetTargetExam = async (examId: string) => {
    setUpdatingTarget(true);
    try {
      const res = await fetch('/api/learner/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_exam_id: examId }),
      });
      if (res.ok) {
        setCurrentTargetExamId(examId);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to set target exam:', err);
    } finally {
      setUpdatingTarget(false);
    }
  };

  const activeExam = EXAMS_DATA.find((e) => e.id === selectedExamId) || EXAMS_DATA[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-5 sm:p-7 lg:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('TNPSC தேர்வு வழிகாட்டி & மாதிரித் திட்டம்', 'TNPSC Examination Blueprint & Guide')}</span>
              </span>
              {updateSuccess && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <Check className="w-3 h-3" />
                  <span>{t('இலக்கு புதுப்பிக்கப்பட்டது!', 'Target Exam Updated!')}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-md shadow-indigo-500/10">
                <Award className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {t('TNPSC தேர்வுகள் மையம்', 'TNPSC Examinations Hub')}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-tamil break-words">
              {t(
                'தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம் (TNPSC) நடத்தும் முதன்மைத் தேர்வுகள், பாடத்திட்ட அமைப்பு, மதிப்பெண் பங்கீடு மற்றும் மாதிரித் தேர்வுகள் வழிகாட்டி.',
                'Official guide to Tamil Nadu Public Service Commission (TNPSC) examinations, syllabus structure, mark distribution, and real-time mock test papers.'
              )}
            </p>
          </div>

          {/* Quick Target Indicator */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-950/80 border border-indigo-500/30 text-xs shrink-0 flex flex-col justify-center space-y-1.5 shadow-lg">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('உங்கள் தற்போதைய முதன்மை இலக்கு:', 'Your Active Primary Target:')}</span>
            </span>
            <span className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === 'en'
                  ? EXAMS_DATA.find((e) => e.id === currentTargetExamId)?.titleEn || 'TNPSC Group 4'
                  : EXAMS_DATA.find((e) => e.id === currentTargetExamId)?.titleTa || 'டி.என்.பி.எஸ்.சி குரூப் 4'}
              </span>
            </span>
            <span className="text-[11px] text-indigo-300 font-mono">
              {EXAMS_DATA.find((e) => e.id === currentTargetExamId)?.code || 'CCSE-IV'}
            </span>
          </div>
        </div>
      </div>

      {/* Exam Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {EXAMS_DATA.map((exam) => {
          const isSelected = selectedExamId === exam.id;
          const isCurrentTarget = currentTargetExamId === exam.id;

          return (
            <button
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${exam.badgeColor}`}>
                    {exam.code}
                  </span>
                  {isCurrentTarget && (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <BookmarkCheck className="w-3 h-3" />
                      <span>{t('என் இலக்கு', 'My Target')}</span>
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-white">
                  {lang === 'en' ? exam.titleEn : exam.titleTa}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'en' ? exam.taglineEn : exam.taglineTa}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {lang === 'en'
                    ? `${exam.totalQuestions} Questions • ${exam.totalMarks} Marks`
                    : `${exam.totalQuestions} வினாக்கள் • ${exam.totalMarks} மதிப்பெண்`}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-400 translate-x-1' : 'text-slate-600'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Exam Detailed View */}
      <div className="space-y-6">
        {/* Exam Title & Action Bar */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/40 border border-slate-800 hover:border-slate-700/80 transition-all shadow-xl space-y-4">
          {/* Header Badges: Clean flex row without 3-row wrapping */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border shadow-sm ${activeExam.badgeColor}`}>
                {activeExam.code} • {lang === 'en' ? activeExam.badgeEn : activeExam.badgeTa}
              </span>
            </div>

            {/* Target Status Indicator */}
            {currentTargetExamId === activeExam.id ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('தற்போதைய முதன்மை இலக்கு', 'Active Primary Target')}</span>
              </span>
            ) : (
              <button
                onClick={() => handleSetTargetExam(activeExam.id)}
                disabled={updatingTarget}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
              >
                <Target className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {updatingTarget
                    ? t('புதுப்பிக்கப்படுகிறது...', 'Updating...')
                    : t('இதை என் இலக்காக மாற்று', 'Set as Target')}
                </span>
              </button>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight break-words font-tamil">
              {lang === 'en' ? activeExam.titleEn : activeExam.titleTa}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-tamil leading-relaxed break-words">
              {lang === 'en' ? activeExam.taglineEn : activeExam.taglineTa}
            </p>
          </div>

          {/* Quick Action Navigation: Full-width primary button on mobile + 2 balanced secondary buttons; 3 side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-800/80">
            {/* Primary Action Button: Full width on mobile, so text never wraps into 3 lines! */}
            <Link
              href="/learner/tests"
              className="w-full sm:flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 transition cursor-pointer text-center"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>{t('மாதிரித் தேர்வுகள் எழுது', 'Take Mock Tests')}</span>
              <ChevronRight className="w-4 h-4 text-indigo-300 shrink-0" />
            </Link>

            {/* Secondary Buttons: 50/50 side-by-side on mobile, side-by-side on desktop */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto sm:flex-1">
              <Link
                href="/learner/syllabus"
                className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer text-center"
              >
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{t('பாடத்திட்டம்', 'Syllabus')}</span>
              </Link>

              <Link
                href="/learner/practice"
                className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer text-center"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t('பயிற்சி வினாக்கள்', 'Practice')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">
                {t('கல்வித் தகுதி (Eligibility)', 'Educational Qualification')}
              </p>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                {lang === 'en' ? activeExam.qualificationEn : activeExam.qualificationTa}
              </p>
              <p className="text-[11px] text-slate-500">
                {lang === 'en' ? activeExam.qualificationTa : activeExam.qualificationEn}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">
                {t('நேரம் & மதிப்பெண்', 'Duration & Total Marks')}
              </p>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                {lang === 'en' ? '3 Hours (180 Minutes)' : '3 மணி நேரம் (180 நிமிடம்)'}
              </p>
              <p className="text-[11px] text-slate-500">
                {lang === 'en'
                  ? `${activeExam.totalQuestions} Questions | ${activeExam.totalMarks} Marks`
                  : `${activeExam.totalQuestions} வினாக்கள் | ${activeExam.totalMarks} மதிப்பெண்கள்`}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">
                {t('தேர்வு முறை (Selection Process)', 'Selection Process')}
              </p>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5 line-clamp-1">
                {lang === 'en' ? activeExam.selectionEn : activeExam.selectionTa}
              </p>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {lang === 'en' ? activeExam.selectionTa : activeExam.selectionEn}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Scheme of Examination */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base text-white">
                {t('தேர்வு வினாத்தாள் கட்டமைப்பு (Scheme of Examination)', 'Scheme of Examination & Marks Distribution')}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {t('OMR மாதிரி வினாத்தாள் முறை', 'OMR Objective Pattern')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">
                    {t('பகுதி / பாடம் (Subject / Section)', 'Section / Subject')}
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">
                    {t('வினாக்கள் (Questions)', 'Questions')}
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">
                    {t('மதிப்பெண் (Marks)', 'Marks')}
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    {t('கல்வித் தரம் (Standard)', 'Standard')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {activeExam.scheme.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {lang === 'en' ? item.sectionEn : item.sectionTa}
                        {item.isMandatory && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                            {t('கட்டாயம்', 'Mandatory')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {lang === 'en' ? item.sectionTa : item.sectionEn}
                      </div>
                      {(item.noteTa || item.noteEn) && (
                        <div className="text-[10px] text-amber-400/90 mt-1 italic">
                          ℹ️ {lang === 'en' ? item.noteEn || item.noteTa : item.noteTa}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-300">{item.questions}</td>
                    <td className="py-3 px-4 text-center font-bold text-white">{item.marks}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300">
                        {lang === 'en' ? item.standardEn : item.standardTa}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lang === 'en' ? item.standardTa : item.standardEn}
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-slate-950 font-bold border-t-2 border-indigo-500/40">
                  <td className="py-3 px-4 text-indigo-300">{t('மொத்தம் (Grand Total)', 'Grand Total')}</td>
                  <td className="py-3 px-4 text-center text-indigo-300">
                    {lang === 'en' ? `${activeExam.totalQuestions} Questions` : `${activeExam.totalQuestions} வினாக்கள்`}
                  </td>
                  <td className="py-3 px-4 text-center text-indigo-300">
                    {lang === 'en' ? `${activeExam.totalMarks} Marks` : `${activeExam.totalMarks} மதிப்பெண்கள்`}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {lang === 'en' ? '3 Hours (180 Minutes)' : '3 மணி நேரம் (180 நிமிடங்கள்)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-Column Grid: Post Cadres & Important Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post Cadres */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                {t('இத்தேர்வில் அடங்கியுள்ள பதவிகள் (Posts Included)', 'Designations & Posts Included')}
              </h3>
            </div>
            <ul className="space-y-2 text-xs">
              {activeExam.postsTa.map((post, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-medium text-white">
                      {lang === 'en' ? activeExam.postsEn[idx] : post}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {lang === 'en' ? post : activeExam.postsEn[idx]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Exam Rules & Strategy */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                {t('முக்கிய விதிகள் & வழிகாட்டுதல் (Key TNPSC Rules)', 'Key Rules & Exam Strategy')}
              </h3>
            </div>
            <ul className="space-y-2 text-xs">
              {activeExam.keyHighlightsTa.map((rule, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-200">
                      {lang === 'en' ? activeExam.keyHighlightsEn[idx] : rule}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {lang === 'en' ? rule : activeExam.keyHighlightsEn[idx]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Launch Hub */}
        <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/40 border border-indigo-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight font-tamil">
                  {t('தயாரிப்பை இன்றே தொடங்குங்கள்!', 'Start Your Preparation Today!')}
                </h4>
              </div>
              <p className="text-xs text-slate-300 font-tamil leading-relaxed break-words">
                {lang === 'en'
                  ? `Access syllabus, practice questions, and timed mock tests for ${activeExam.titleEn}.`
                  : `${activeExam.titleTa} தேர்வுக்குரிய வினாக்கள், பாடத்திட்டம் மற்றும் மாதிரித் தேர்வுகளை அணுகவும்.`}
              </p>
            </div>
          </div>

          {/* 2x2 on Mobile, 4-col on Desktop Launchpad Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <Link
              href="/learner/syllabus"
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white font-tamil">{t('பாடத்திட்டம்', 'Syllabus')}</span>
              <span className="text-[10px] text-slate-400 hidden sm:block">{t('முழு விவரங்கள்', 'Full Outline')}</span>
            </Link>

            <Link
              href="/learner/practice"
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white font-tamil">{t('பயிற்சி வினாக்கள்', 'Practice Bank')}</span>
              <span className="text-[10px] text-slate-400 hidden sm:block">{t('உடனடி விடைகள்', 'Instant Solutions')}</span>
            </Link>

            <Link
              href="/learner/tracker"
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white font-tamil">{t('பாட நிறைவு கண்காணிப்பு', 'Tracker')}</span>
              <span className="text-[10px] text-slate-400 hidden sm:block">{t('முன்னேற்றம்', 'Progress Bar')}</span>
            </Link>

            <Link
              href="/learner/tests"
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-white/10 text-white border border-white/20 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-white font-tamil">{t('மாதிரித் தேர்வு எழுது', 'Take Mock Test')}</span>
              <span className="text-[10px] text-indigo-200 hidden sm:block">{t('நேரடி OMR தேர்வு', 'Timed Exam')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
