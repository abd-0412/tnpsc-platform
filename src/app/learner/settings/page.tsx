'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Settings,
  User,
  Shield,
  KeyRound,
  Award,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  target_exam_id: string | null;
  preferred_language: 'ta' | 'en';
}

export default function LearnerSettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [fullName, setFullName] = useState('');
  const [targetExam, setTargetExam] = useState('group_4');
  const [prefLang, setPrefLang] = useState<'ta' | 'en'>('ta');
  const [newPassword, setNewPassword] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learner/profile');
      const data = await res.json();
      if (res.ok && data.profile) {
        setProfile(data.profile);
        setFullName(data.profile.full_name || '');
        setTargetExam(data.profile.target_exam_id || 'group_4');
        setPrefLang(data.profile.preferred_language || lang);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (lang) {
      setPrefLang(lang);
    }
  }, [lang]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/learner/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          target_exam_id: targetExam,
          preferred_language: prefLang,
          new_password: newPassword.trim() ? newPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setLang(prefLang);
      setStatusMessage({
        type: 'success',
        text: t('அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!', 'Settings updated successfully!'),
      });
      setNewPassword('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">
          {t('அமைப்புகள் ஏற்றப்படுகின்றன...', 'Loading account preferences...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold tracking-wider uppercase mb-1">
          <span>{t('அமைப்புகள்', 'Preferences')}</span>
          <span>•</span>
          <span>{t('தனிப்பட்ட சுயவிவரம்', 'Profile & Security')}</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-400" />
          {t('சுயவிவரம் & கணக்கு அமைப்புகள்', 'Profile & Account Settings')}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t(
            'இலக்கு தேர்வு, இயல்புநிலை மொழி மற்றும் பாதுகாப்பு அமைப்புகளை நிர்வகிக்கவும்.',
            'Manage your personal target examination, default language, and security credentials.'
          )}
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-2.5 text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            {t('பொதுவான விவரங்கள்', 'General Information')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {t('மின்னஞ்சல் முகவரி', 'Email Address')}
              </label>
              <input
                type="text"
                disabled
                value={profile.email}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {t('நிர்வாகியால் நிர்வகிக்கப்படும் கணக்கு', 'Account managed by TNPSC Platform Admin')}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {t('முழு பெயர்', 'Full Name')}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            {t('இலக்கு தேர்வு & மொழி விருப்பம்', 'Target Examination & Preferences')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {t('முதன்மை இலக்கு தேர்வு', 'Primary Goal / Target Exam')}
              </label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="group_4">
                  {t('TNPSC குரூப் 4 (VAO / இளநிலை உதவியாளர் / தட்டச்சர்)', 'TNPSC Group 4 (VAO / Junior Assistant / Typist)')}
                </option>
                <option value="group_2">
                  {t('TNPSC குரூப் 2 (நேர்முகப் பதவிகள்)', 'TNPSC Group 2 (Interview Posts)')}
                </option>
                <option value="group_2a">
                  {t('TNPSC குரூப் 2A (நேர்முகத் தேர்வல்லா பதவிகள்)', 'TNPSC Group 2A (Non-Interview Posts)')}
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {t('இயல்புநிலை மொழி', 'Default Language')}
              </label>
              <select
                value={prefLang}
                onChange={(e) => {
                  const val = e.target.value as 'ta' | 'en';
                  setPrefLang(val);
                  setLang(val);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ta">தமிழ் (Tamil - Recommended)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-rose-400" />
            {t('கடவுச்சொல் மாற்றம்', 'Security & Password')}
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              {t('புதிய கடவுச்சொல் (மாற்ற விரும்பவில்லை எனில் காலியாக விடவும்)', 'Change Password (leave blank to keep current)')}
            </label>
            <input
              type="password"
              placeholder={t('புதிய கடவுச்சொல்லை உள்ளிடவும்', 'Enter new strong password')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full sm:w-1/2 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('சேமிக்கப்படுகிறது...', 'Saving Changes...')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('அமைப்புகளை சேமி', 'Save Preferences')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
