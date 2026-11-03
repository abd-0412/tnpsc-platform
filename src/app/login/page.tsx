'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lang, setLang] = useState<'ta' | 'en'>('ta');

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile) {
          setErrorMsg(
            lang === 'ta'
              ? 'பயனர் விவரக்குறிப்பு கண்டறியப்படவில்லை. நிர்வாகியை தொடர்பு கொள்ளவும்.'
              : 'User profile not found. Please contact the administrator.'
          );
          setLoading(false);
          return;
        }

        if (!profile.is_active) {
          setErrorMsg(
            lang === 'ta'
              ? 'உங்கள் கணக்கு முடக்கப்பட்டுள்ளது. நிர்வாகியை தொடர்பு கொள்ளவும்.'
              : 'Your account is deactivated. Please contact the administrator.'
          );
          setLoading(false);
          return;
        }

        // Strict Role Routing with hard navigation so cookies synchronize with Next.js SSR
        const target =
          profile.role === 'admin'
            ? redirectTo && redirectTo.startsWith('/admin')
              ? redirectTo
              : '/admin'
            : redirectTo && redirectTo.startsWith('/learner')
            ? redirectTo
            : '/learner';

        window.location.href = target;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(
        err.message ||
          (lang === 'ta'
            ? 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.'
            : 'Invalid email or password.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100">
      {/* Top Bar Language Selector */}
      <div className="absolute top-6 right-6 flex items-center space-x-2 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700 text-sm">
        <button
          type="button"
          onClick={() => setLang('ta')}
          className={`px-2 py-0.5 rounded-full transition-all ${
            lang === 'ta'
              ? 'bg-indigo-600 text-white font-medium'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          தமிழ்
        </button>
        <span className="text-slate-600">|</span>
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-2 py-0.5 rounded-full transition-all ${
            lang === 'en'
              ? 'bg-indigo-600 text-white font-medium'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          English
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-xl mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {lang === 'ta' ? 'டி.என்.பி.எஸ்.சி பயிற்சி தளம்' : 'TNPSC Practice Platform'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {lang === 'ta'
            ? 'குரூப் 4, குரூப் 2 & 2A தனிப்பட்ட தேர்வு தயாரிப்பு மையம்'
            : 'Private Examination Preparation System for Group 4, 2 & 2A'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                {lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                {lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm cursor-pointer"
            >
              <span>
                {loading
                  ? lang === 'ta'
                    ? 'உள்நுழைகிறது...'
                    : 'Signing in...'
                  : lang === 'ta'
                  ? 'உள்நுழைக'
                  : 'Sign In'}
              </span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-5 border-t border-slate-700/50 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === 'ta'
                ? 'தனிப்பட்ட & பாதுகாக்கப்பட்ட தளம் (3 பயனர் அனுமதி மட்டும்)'
                : 'Private & Secure Platform (Authorized Users Only)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <LoginForm />
    </Suspense>
  );
}
