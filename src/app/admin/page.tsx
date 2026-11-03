import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
import {
  Database,
  Layers,
  FileCheck2,
  Users,
  AlertCircle,
  PlusCircle,
  UploadCloud,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/learner');
  }

  // Fetch metrics in parallel
  const [
    { count: totalQuestions },
    { count: pendingVerification },
    { count: totalExams },
    { count: totalSyllabusNodes },
    { count: totalTests },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }).eq('workflow->>status', 'draft'),
    supabase.from('exams').select('*', { count: 'exact', head: true }),
    supabase.from('syllabus_nodes').select('*', { count: 'exact', head: true }),
    supabase.from('test_templates').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    {
      titleEn: 'Total Questions',
      titleTa: 'மொத்த வினாக்கள்',
      value: totalQuestions || 0,
      icon: Database,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      href: '/admin/questions'
    },
    {
      titleEn: 'Pending Verification',
      titleTa: 'சரிபார்ப்பு நிலுவை',
      value: pendingVerification || 0,
      icon: AlertCircle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      href: '/admin/verification'
    },
    {
      titleEn: 'Target Examinations',
      titleTa: 'இலக்கு தேர்வுகள்',
      value: totalExams || 3,
      icon: Award,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      href: '/admin/exams'
    },
    {
      titleEn: 'Syllabus Nodes',
      titleTa: 'பாடத்திட்ட பகுதிகள்',
      value: totalSyllabusNodes || 0,
      icon: Layers,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      href: '/admin/syllabus'
    },
    {
      titleEn: 'Configured Tests',
      titleTa: 'தேர்வு வார்ப்புருக்கள்',
      value: totalTests || 0,
      icon: FileCheck2,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      href: '/admin/tests'
    },
    {
      titleEn: 'Authorized Accounts',
      titleTa: 'பயனர்கள்',
      value: totalUsers || 2,
      icon: Users,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      href: '/admin/users'
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-7 lg:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/30 border border-slate-700/80 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TNPSC System Administrator</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">Control Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              நிர்வாக கட்டுப்பாட்டு மையம் (Admin Dashboard)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              TNPSC தளத்தின் வினா வங்கி, பாடத்திட்டம், அதிகாரப்பூர்வ மாதிரி தேர்வுகள் மற்றும் பயனர் மேலாண்மை.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              href="/admin/questions/new"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 text-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>புதிய வினா சேர்</span>
            </Link>
            <Link
              href="/admin/import"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition text-center"
            >
              <UploadCloud className="w-4 h-4 text-slate-300" />
              <span>மொத்த பதிவேற்றம் (Bulk Import)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Metrics Grid (2-col on Mobile, 3-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              href={s.href}
              className="p-4 sm:p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all group flex flex-col justify-between space-y-3 shadow-sm cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-amber-400 flex items-center transition-colors">
                  <span className="hidden sm:inline mr-1">விவரம்</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight block">
                  {s.value}
                </span>
                <span className="text-xs font-bold text-slate-200 block truncate mt-0.5">
                  {s.titleTa}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {s.titleEn}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Quick Launchpad & Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Verification & Content Workflow */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm sm:text-base text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>வினா சரிபார்ப்பு நிலை (Quality Verification)</span>
              </h2>
              <Link href="/admin/verification" className="text-xs text-amber-400 hover:underline shrink-0">
                சரிபார்ப்பு மையம் ➔
              </Link>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              பதிவேற்றப்பட்ட அனைத்து வினாக்களும் (தமிழ், ஆங்கிலம், மூல ஆதாரம்) நிர்வாகியால் சரிபார்க்கப்பட்ட பின்னரே மாணவர் மாதிரி தேர்வுகளுக்கு வெளியிடப்படும்.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">நிலுவையில் உள்ள வினாக்கள்:</span>
            <span className="font-bold font-mono text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              {pendingVerification || 0} வினாக்கள்
            </span>
          </div>
        </div>

        {/* Examinations & Pattern Overview */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm sm:text-base text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <span>இலக்கு தேர்வுகள் (Active Target Exams)</span>
            </h2>
            <Link href="/admin/exams" className="text-xs text-amber-400 hover:underline shrink-0">
              தேர்வு அமைப்புகள் ➔
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-white truncate">TNPSC Group 4 (VAO & JA)</p>
                <p className="text-slate-400 text-[11px] truncate">200 வினாக்கள் • 300 மதிப்பெண்கள் • 180 நிமிடங்கள்</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                செயலில்
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-white truncate">TNPSC Group 2 & 2A</p>
                <p className="text-slate-400 text-[11px] truncate">ஒருங்கிணைந்த குடிமைப் பணிகள் தேர்வு-II / IIA</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                செயலில்
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
