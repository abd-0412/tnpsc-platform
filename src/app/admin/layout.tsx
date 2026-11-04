'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Users,
  Award,
  Layers,
  Database,
  PlusCircle,
  UploadCloud,
  CheckCircle2,
  FileText,
  Clock,
  History,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', labelEn: 'Dashboard', labelTa: 'முகப்பு', icon: LayoutDashboard },
  { href: '/admin/users', labelEn: 'User Management', labelTa: 'பயனர்கள்', icon: Users },
  { href: '/admin/exams', labelEn: 'Examinations', labelTa: 'தேர்வுகள்', icon: Award },
  { href: '/admin/syllabus', labelEn: 'Syllabus', labelTa: 'பாடத்திட்டம்', icon: Layers },
  { href: '/admin/questions', labelEn: 'Question Bank', labelTa: 'வினா வங்கி', icon: Database },
  { href: '/admin/questions/new', labelEn: 'Add Question', labelTa: 'வினா சேர்த்தல்', icon: PlusCircle },
  { href: '/admin/import', labelEn: 'Import Centre', labelTa: 'பதிவேற்ற மையம்', icon: UploadCloud },
  { href: '/admin/verification', labelEn: 'Verification', labelTa: 'சரிபார்ப்பு', icon: CheckCircle2 },
  { href: '/admin/tests', labelEn: 'Test Management', labelTa: 'தேர்வு மேலாண்மை', icon: FileText },
  { href: '/admin/pyq', labelEn: 'PYQ Papers', labelTa: 'முந்தைய வினாத்தாள்கள்', icon: Clock },
  { href: '/admin/audit', labelEn: 'Audit & History', labelTa: 'செயல் வரலாறு', icon: History },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'ta' | 'en'>('ta');
  const [roleChecking, setRoleChecking] = useState(true);
  const supabase = createClient();
  const mainContentRef = useRef<HTMLElement>(null);

  // Auto-scroll main content area to top on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [pathname]);

  useEffect(() => {
    async function checkRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          // Learners cannot access admin portal
          router.replace('/learner');
          return;
        }
      } catch (err) {
        console.error('Role verification failed:', err);
      } finally {
        setRoleChecking(false);
      }
    }

    checkRole();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (roleChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 shrink-0 z-30">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          <span className="font-bold text-sm tracking-wide">
            {lang === 'ta' ? 'நிர்வாகி தளம்' : 'Admin Portal'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLang(l => (l === 'ta' ? 'en' : 'ta'))}
            className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            {lang === 'ta' ? 'English' : 'தமிழ்'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar for Desktop & Mobile drawer - 100% Fixed to Left */}
      <aside
        className={`fixed top-0 left-0 bottom-0 h-screen h-[100dvh] w-64 bg-slate-800/95 backdrop-blur border-r border-slate-700 flex flex-col justify-between z-40 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header - Fixed at top */}
        <div className="p-5 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">TNPSC Admin</h1>
              <p className="text-xs text-slate-400">
                {lang === 'ta' ? 'மேலாண்மை தளம்' : 'Control Center'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLang(l => (l === 'ta' ? 'en' : 'ta'))}
            className="hidden md:inline-flex text-xs px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            {lang === 'ta' ? 'EN' : 'தமிழ்'}
          </button>
        </div>

        {/* Navigation Links - Scrollable middle section */}
        <nav className="p-3 space-y-1 flex-1 min-h-0 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{lang === 'ta' ? item.labelTa : item.labelEn}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions - Fixed at bottom */}
        <div className="shrink-0">
          {/* Switch to Learner view (Admin can attend tests too) */}
          <div className="p-3 border-t border-slate-700/80">
            <Link
              href="/learner"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{lang === 'ta' ? 'மாணவர் பார்வை' : 'Switch to Learner View'}</span>
            </Link>
          </div>

          {/* Footer with logout */}
          <div className="p-3 border-t border-slate-700/80">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{lang === 'ta' ? 'வெளியேறு' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Independently scrollable */}
      <main
        ref={mainContentRef}
        className="flex-1 min-w-0 min-h-0 md:ml-64 h-full overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-8 space-y-4"
      >
        {children}
      </main>
    </div>
  );
}

