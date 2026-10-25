/**
 * Design Tokens for TNPSC Practice Platform (Section 11.2)
 * Pure definitions for fonts, sizes, touch targets, and status indicator semantics.
 */

export const tokens = {
  typography: {
    fontFamilies: {
      sans: 'var(--font-noto-sans), system-ui, -apple-system, sans-serif',
      tamil: 'var(--font-noto-sans-tamil), system-ui, -apple-system, sans-serif',
    },
    bodySize: '1rem', // 16px minimum
    lineHeight: 1.6, // 1.6 minimum for Tamil readability
  },
  touchTargets: {
    minSize: '44px',
    optionMinHeight: '48px',
  },
  spacingScale: {
    unit: 4, // 4px scale
  },
  statusTokens: {
    correct: {
      id: 'correct',
      labelEn: 'Correct',
      labelTa: 'சரி',
      icon: 'CheckCircle',
      lightColor: '#059669', // emerald-600 (contrast >= 4.5:1 on light)
      darkColor: '#34d399',  // emerald-400 (contrast >= 4.5:1 on dark)
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
    },
    wrong: {
      id: 'wrong',
      labelEn: 'Wrong',
      labelTa: 'தவறு',
      icon: 'XCircle',
      lightColor: '#dc2626', // rose-600
      darkColor: '#f87171',  // rose-400
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
    },
    notVisited: {
      id: 'not_visited',
      labelEn: 'Not Visited',
      labelTa: 'பார்க்காதது',
      icon: 'Circle',
      lightColor: '#64748b', // slate-500
      darkColor: '#94a3b8',  // slate-400
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
    },
    markedForReview: {
      id: 'marked',
      labelEn: 'Marked for Review',
      labelTa: 'மறுபரிசீலனைக்கு',
      icon: 'Flag',
      lightColor: '#d97706', // amber-600
      darkColor: '#fbbf24',  // amber-400
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
    },
    answered: {
      id: 'answered',
      labelEn: 'Answered',
      labelTa: 'விடையளிக்கப்பட்டது',
      icon: 'Check',
      lightColor: '#4f46e5', // indigo-600
      darkColor: '#818cf8',  // indigo-400
      badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800',
    },
    notKnown: {
      id: 'not_known',
      labelEn: 'Answer Not Known',
      labelTa: 'விடை தெரியவில்லை',
      icon: 'HelpCircle',
      lightColor: '#475569', // slate-600
      darkColor: '#cbd5e1',  // slate-300
      badgeClass: 'bg-slate-200 text-slate-800 border-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
    },
    paused: {
      id: 'paused',
      labelEn: 'Paused',
      labelTa: 'இடைநிறுத்தப்பட்டது',
      icon: 'Pause',
      lightColor: '#475569',
      darkColor: '#94a3b8',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    },
  },
} as const;

export type StatusKey = keyof typeof tokens.statusTokens;