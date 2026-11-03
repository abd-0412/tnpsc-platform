import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  BookOpen,
  CheckCircle2,
  Flame,
  Target,
  Brain,
  ArrowRight,
  ShieldCheck,
  FileText,
  Sparkles,
  BarChart3,
  Clock,
  Layers,
  Compass,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, redirect directly to their respective portal
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      redirect('/admin');
    } else {
      redirect('/learner');
    }
  }

  // If not logged in, showcase the public TNPSC Practice Platform landing page
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-900/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">TNPSC Portal</span>
              <span className="text-[10px] text-indigo-400 font-medium block">தேர்வு பயிற்சி மையம்</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>உள்நுழைக / Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>TNPSC Group 4, Group 2 & 2A தேர்வுத் தளம்</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            அரசுத் தேர்வில் வெற்றி பெற <br />
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              முழுமையான மாதிரித் தேர்வு தளம்
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            அதிகாரப்பூர்வ TNPSC OMR தேர்வு முறை, தவறுகளைத் திருத்தும் Spaced Repetition பெட்டகம் மற்றும் தினசரி இலக்குகளுடன் கூடிய ஸ்மார்ட் பயிற்சி மையம்.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>தேர்வு எழுதத் தொடங்குங்கள் (Start Practice)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-all"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>அம்சங்களைப் பார்க்க (Features)</span>
            </a>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 block">5 OMR</span>
              <span className="text-xs text-slate-400 mt-1 block">A, B, C, D, E வட்டங்கள்</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">100%</span>
              <span className="text-xs text-slate-400 mt-1 block">இருமொழி வினாக்கள்</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 block">SRS</span>
              <span className="text-xs text-slate-400 mt-1 block">தவறுகளின் பெட்டகம்</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 block">Offline</span>
              <span className="text-xs text-slate-400 mt-1 block">PWA ஆஃப்லைன் ஆதரவு</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Features & Highlights</h2>
            <p className="mt-2 text-2xl sm:text-4xl font-bold text-white tracking-tight">
              TNPSC தரத்திற்கு ஏற்ப வடிவமைக்கப்பட்ட அம்சங்கள்
            </p>
            <p className="mt-3 text-sm text-slate-400">
              வெறும் பயிற்சி மட்டுமல்லாமல் உங்கள் பலவீனங்களை துல்லியமாக கண்டறிந்து திருத்தும் ஸ்மார்ட் தொழில்நுட்பம்.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">உண்மையான TNPSC OMR மாதிரி</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                அதிகாரப்பூர்வ TNPSC விடைத்தாளைப் போலவே A, B, C, D மற்றும் விடை தெரியாதவற்றுக்கான கட்டாய &apos;E&apos; வட்ட அமைப்புடன் கூடிய நேரடி OMR தேர்வு.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">தவறுகளின் பெட்டகம் (Mistake Vault)</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                நீங்கள் தவறாக விடையளித்த அல்லது கைவிட்ட வினாக்களை Spaced Repetition (1, 3, 7, 14, 30 நாட்கள்) முறையில் மீண்டும் நினைவூட்டும் மீள்பார்வை அமைப்பு.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">தினசரி இலக்குகள் & Streaks</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                நாள்தோறும் வினாக்களை பயிற்சி செய்ய Streak Counter, Study Activity Heatmap மற்றும் சாதனை மைல்கற்கள் (Milestone Badges).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">பாடத்திட்ட கண்காணிப்பாளர்</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                பொதுத்தமிழ் (இலக்கணம், இலக்கியம், தமிழ் அறிஞர்கள்) மற்றும் பொது அறிவு பாடப்பிரிவுகளின் முன்னேற்றத்தை முழுமையாக பதிவு செய்யும் டிராக்கர்.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">ஆழமான செயல்திறன் பகுப்பாய்வு</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                துல்லிய விகிதம் (Accuracy), நேர மேலாண்மை (Time per Question) மற்றும் பாடவாரியான பலவீனங்களை வரைபடங்களுடன் விளக்கும் அனலிடிக்ஸ்.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">அதிகாரப்பூர்வ மாதிரி வினாக்கள்</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                SCERT சமச்சீர் பாடநூல்கள் மற்றும் முந்தைய ஆண்டுகளின் அசல் TNPSC வினாத்தாள்களைக் கொண்ட விரிவான இருமொழி வினா வங்கி.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 sm:py-20 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              உங்கள் TNPSC கனவை நனவாக்குங்கள்
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              முறையான மாதிரித் தேர்வுகள், உடனடி முடிவுகள் மற்றும் துல்லியமான வழிகாட்டுதலுடன் இன்றே பயிற்சியைத் தொடங்குங்கள்.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/40 transition-all hover:scale-105"
              >
                <span>உள்நுழைக / Sign In to Practice</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">TNPSC Examination Platform</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம் குரூப் 4, 2, 2A பிரத்யேக தேர்வு மாதிரி தளம்.
          </p>
        </div>
      </footer>
    </div>
  );
}
