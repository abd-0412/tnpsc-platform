'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import {
  Home,
  Award,
  Layers,
  Sparkles,
  FileCheck2,
  Clock,
  BarChart3,
  Flame,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Languages,
  Zap,
  WifiOff
} from 'lucide-react';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import OfflineSyncBanner from '@/components/learner/OfflineSyncBanner';

const LEARNER_NAV = [
  { href: '/learner', labelEn: 'Dashboard', labelTa: 'முகப்பு', icon: Home },
  { href: '/learner/exams', labelEn: 'Examinations', labelTa: 'தேர்வுகள்', icon: Award },
  { href: '/learner/syllabus', labelEn: 'Syllabus Explorer', labelTa: 'பாடத்திட்டம்', icon: Layers },
  { href: '/learner/practice', labelEn: 'Practice Centre', labelTa: 'பயிற்சி மையம்', icon: Sparkles },
  { href: '/learner/tests', labelEn: 'Test Centre', labelTa: 'மாதிரி தேர்வுகள்', icon: FileCheck2 },
  { href: '/learner/capsules', labelEn: 'Revision Capsules', labelTa: 'விரைவு திருப்புதல்', icon: Zap },
  { href: '/learner/offline', labelEn: 'Offline Centre', labelTa: 'ஆஃப்லைன் மையம்', icon: WifiOff },
  { href: '/learner/history', labelEn: 'Test History', labelTa: 'தேர்வு வரலாறு', icon: Clock },
  { href: '/learner/analytics', labelEn: 'Performance Analytics', labelTa: 'செயல்திறன் ஆய்வு', icon: BarChart3 },
  { href: '/learner/mistake-vault', labelEn: 'Mistake Vault', labelTa: 'தவறு திருத்த பெட்டகம்', icon: Flame },
  { href: '/learner/tracker', labelEn: 'Targets & Streaks', labelTa: 'இலக்கு & Streak', icon: CheckSquare },
  { href: '/learner/settings', labelEn: 'Profile & Settings', labelTa: 'அமைப்புகள்', icon: Settings },
];

function LearnerLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleChecking, setRoleChecking] = useState(true);
  const { lang, toggleLang, t } = useLanguage();
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

        if (profile?.role === 'admin') {
          // Administrators cannot access learner portal
          router.replace('/admin');
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check if current route is an immersive full-screen view (e.g. Live Test Player, Print view, OMR Sheet)
  // These views require distraction-free 100vw x 100vh viewport without sidebar or outer layout padding
  const isImmersiveView =
    (/^\/learner\/tests\/[^\/]+$/.test(pathname) && !pathname.includes('/results')) ||
    pathname.includes('/print') ||
    pathname.includes('/omr-sheet') ||
    pathname.includes('/omr-sync');

  if (isImmersiveView) {
    return (
      <main className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-slate-950 p-0 m-0 z-50">
        {children}
      </main>
    );
  }

  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0 z-30">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-sm tracking-wide">
            {t('மாணவர் தளம்', 'Learner Portal')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleLang}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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

      {/* Fixed Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 bottom-0 h-screen h-[100dvh] w-64 bg-slate-900/95 backdrop-blur border-r border-slate-800 flex flex-col justify-between z-40 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-white">TNPSC Prep</h1>
                <p className="text-xs text-slate-400">
                  {t('தேர்வு தயாரிப்பு', 'Learner Portal')}
                </p>
              </div>
            </div>
            <button
              onClick={toggleLang}
              className="hidden md:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={lang === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1 min-h-0 overflow-y-auto">
            {LEARNER_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/learner' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{lang === 'ta' ? item.labelTa : item.labelEn}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer with logout */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('வெளியேறு', 'Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Independently scrollable */}
      <main
        ref={mainContentRef}
        className="flex-1 min-w-0 min-h-0 md:ml-64 h-full overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-8 space-y-4"
      >
        <OfflineSyncBanner />
        {children}
      </main>
    </div>
  );
}

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PWAProvider>
        <LearnerLayoutContent>{children}</LearnerLayoutContent>
      </PWAProvider>
    </LanguageProvider>
  );
}
