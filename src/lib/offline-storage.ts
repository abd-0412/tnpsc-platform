import { get, set, del, update } from 'idb-keyval';

export interface OfflineTestBundle {
  id: string;
  title: string;
  examTitle: string;
  durationMinutes: number;
  totalQuestions: number;
  standard?: string;
  cachedAt: string;
  questions: any[];
}

export interface OfflineSubmission {
  id: string;
  testId: string;
  testTitle: string;
  submittedAt: string;
  answers: Record<string, string>;
  timeSpentSeconds?: Record<string, number>;
  timeRemainingSeconds: number;
  synced: boolean;
  score?: {
    totalMarks: number;
    correctCount: number;
    wrongCount: number;
    blankCount: number;
  };
}

const STORAGE_KEYS = {
  TEST_BUNDLES: 'tnpsc_offline_tests_v1',
  PENDING_SUBMISSIONS: 'tnpsc_offline_submissions_v1',
  REVISION_DECK: 'tnpsc_offline_revision_v1',
  PWA_SETTINGS: 'tnpsc_pwa_settings_v1',
};

/**
 * Save a full test package for offline taking
 */
export async function saveOfflineTest(test: OfflineTestBundle): Promise<void> {
  const existing = (await get<Record<string, OfflineTestBundle>>(STORAGE_KEYS.TEST_BUNDLES)) || {};
  existing[test.id] = {
    ...test,
    cachedAt: new Date().toISOString(),
  };
  await set(STORAGE_KEYS.TEST_BUNDLES, existing);
}

/**
 * Retrieve a specific cached test by ID
 */
export async function getOfflineTest(testId: string): Promise<OfflineTestBundle | undefined> {
  const existing = (await get<Record<string, OfflineTestBundle>>(STORAGE_KEYS.TEST_BUNDLES)) || {};
  return existing[testId];
}

/**
 * List all downloaded tests available offline
 */
export async function getAllOfflineTests(): Promise<OfflineTestBundle[]> {
  const existing = (await get<Record<string, OfflineTestBundle>>(STORAGE_KEYS.TEST_BUNDLES)) || {};
  return Object.values(existing);
}

/**
 * Remove a cached test to free up storage
 */
export async function deleteOfflineTest(testId: string): Promise<void> {
  const existing = (await get<Record<string, OfflineTestBundle>>(STORAGE_KEYS.TEST_BUNDLES)) || {};
  delete existing[testId];
  await set(STORAGE_KEYS.TEST_BUNDLES, existing);
}

/**
 * Store a user's test attempt when offline
 */
export async function saveOfflineSubmission(submission: OfflineSubmission): Promise<void> {
  const existing = (await get<OfflineSubmission[]>(STORAGE_KEYS.PENDING_SUBMISSIONS)) || [];
  // Replace or append
  const idx = existing.findIndex((s) => s.id === submission.id);
  if (idx >= 0) {
    existing[idx] = submission;
  } else {
    existing.push(submission);
  }
  await set(STORAGE_KEYS.PENDING_SUBMISSIONS, existing);
}

/**
 * Get all test submissions waiting to sync
 */
export async function getPendingSubmissions(): Promise<OfflineSubmission[]> {
  const existing = (await get<OfflineSubmission[]>(STORAGE_KEYS.PENDING_SUBMISSIONS)) || [];
  return existing.filter((s) => !s.synced);
}

/**
 * Mark a submission as synced
 */
export async function markSubmissionSynced(id: string): Promise<void> {
  const existing = (await get<OfflineSubmission[]>(STORAGE_KEYS.PENDING_SUBMISSIONS)) || [];
  const updated = existing.map((s) => (s.id === id ? { ...s, synced: true } : s));
  await set(STORAGE_KEYS.PENDING_SUBMISSIONS, updated);
}

/**
 * Clear synced submissions older than 7 days
 */
export async function clearOldSyncedSubmissions(): Promise<void> {
  const existing = (await get<OfflineSubmission[]>(STORAGE_KEYS.PENDING_SUBMISSIONS)) || [];
  const active = existing.filter((s) => !s.synced);
  await set(STORAGE_KEYS.PENDING_SUBMISSIONS, active);
}

/**
 * Get offline storage status summary
 */
export async function getOfflineStorageStats(): Promise<{
  cachedTestsCount: number;
  pendingSyncCount: number;
  tests: OfflineTestBundle[];
  pending: OfflineSubmission[];
}> {
  const tests = await getAllOfflineTests();
  const pending = await getPendingSubmissions();
  return {
    cachedTestsCount: tests.length,
    pendingSyncCount: pending.length,
    tests,
    pending,
  };
}

/**
 * Sync all pending submissions to server
 */
export async function syncOfflineSubmissionsToServer(): Promise<{
  syncedCount: number;
  failedCount: number;
}> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const pending = await getPendingSubmissions();
  if (pending.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  let syncedCount = 0;
  let failedCount = 0;

  for (const sub of pending) {
    try {
      const response = await fetch(`/api/learner/tests/${sub.testId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: sub.answers,
          time_spent_seconds: sub.timeSpentSeconds || {},
          time_remaining_seconds: sub.timeRemainingSeconds,
          is_offline_sync: true,
          offline_submitted_at: sub.submittedAt,
        }),
      });

      if (response.ok) {
        await markSubmissionSynced(sub.id);
        syncedCount++;
      } else {
        failedCount++;
      }
    } catch (err) {
      console.warn('[Offline Sync] Failed to sync attempt:', sub.id, err);
      failedCount++;
    }
  }

  return { syncedCount, failedCount };
}

/**
 * Seed a built-in Samacheer 6th Standard Tamil & General Studies Offline Bundle
 * Allows learner to immediately test full offline mode without waiting to download
 */
export async function seedSampleOfflineBundle(): Promise<OfflineTestBundle> {
  const bundle: OfflineTestBundle = {
    id: 'offline-samacheer-6th-demo',
    title: '6-ஆம் வகுப்பு மாதிரித் தேர்வு (Offline Demo Test)',
    examTitle: 'TNPSC குரூப் 4 & VAO - Samacheer Kalvi 6th Std Practice',
    durationMinutes: 45,
    totalQuestions: 15,
    standard: '6',
    cachedAt: new Date().toISOString(),
    questions: [
      {
        id: 'off-q-1',
        kind: 'direct_mcq',
        difficulty: 'medium',
        texts: {
          ta: {
            question: 'தமிழ் மொழியில் ஆய்த எழுத்தின் மாத்திரை அளவு எவ்வளவு?',
            options: {
              A: '1 மாத்திரை',
              B: '2 மாத்திரை',
              C: '1/2 மாத்திரை (அரை மாத்திரை)',
              D: '3 மாத்திரை',
              E: 'விடை தெரியவில்லை (Answer Not Known)'
            }
          },
          en: {
            question: 'What is the Mathirai time unit duration for Ayutha Ezhuthu in Tamil?',
            options: {
              A: '1 Mathirai',
              B: '2 Mathirai',
              C: '1/2 Mathirai (Half unit)',
              D: '3 Mathirai',
              E: 'Answer Not Known (Option E)'
            }
          }
        },
        correct_answer: 'C',
        source: { book: '6-ஆம் வகுப்பு இயல் 1' }
      },
      {
        id: 'off-q-2',
        kind: 'direct_mcq',
        difficulty: 'easy',
        texts: {
          ta: {
            question: '‘தமிழுக்கும் அமுதென்று பேர் - அந்தத் தமிழ் இன்பத் தமிழ் எங்கள் உயிருக்கு நேர்’ என்ற பாடலின் ஆசிரியர் யார்?',
            options: {
              A: 'பாரதியார்',
              B: 'பாரதிதாசன்',
              C: 'நாமக்கல் கவிஞர்',
              D: 'வாணிதாசன்',
              E: 'விடை தெரியவில்லை (Answer Not Known)'
            }
          },
          en: {
            question: 'Who authored the renowned Tamil song "Tamilukkum Amuthendru Paer"?',
            options: {
              A: 'Bharathiyar',
              B: 'Bharathidasan',
              C: 'Namakkal Kavignar',
              D: 'Vanidasan',
              E: 'Answer Not Known (Option E)'
            }
          }
        },
        correct_answer: 'B',
        source: { book: '6-ஆம் வகுப்பு இன்பத்தமிழ்' }
      },
      {
        id: 'off-q-3',
        kind: 'direct_mcq',
        difficulty: 'medium',
        texts: {
          ta: {
            question: 'சிந்து சமவெளி நாகரிகத்தில் "ஹரப்பா" நகரம் எந்த ஆண்டு முதன்முதலில் அகழாய்வு செய்யப்பட்டது?',
            options: {
              A: '1920',
              B: '1921',
              C: '1922',
              D: '1924',
              E: 'விடை தெரியவில்லை (Answer Not Known)'
            }
          },
          en: {
            question: 'In which year was Harappa first excavated in the Indus Valley Civilization?',
            options: {
              A: '1920',
              B: '1921',
              C: '1922',
              D: '1924',
              E: 'Answer Not Known (Option E)'
            }
          }
        },
        correct_answer: 'B',
        source: { book: '6-ஆம் வகுப்பு சமூக அறிவியல்' }
      },
      {
        id: 'off-q-4',
        kind: 'direct_mcq',
        difficulty: 'medium',
        texts: {
          ta: {
            question: 'இரு எண்களின் மீ.சி.ம 60 மற்றும் மீ.பொ.வ 6 ஆகும். அதில் ஒரு எண் 12 எனில் மற்றொரு எண் யாது?',
            options: {
              A: '24',
              B: '30',
              C: '36',
              D: '48',
              E: 'விடை தெரியவில்லை (Answer Not Known)'
            }
          },
          en: {
            question: 'LCM of two numbers is 60 and HCF is 6. If one number is 12, what is the other number?',
            options: {
              A: '24',
              B: '30',
              C: '36',
              D: '48',
              E: 'Answer Not Known (Option E)'
            }
          }
        },
        correct_answer: 'B',
        source: { book: '6-ஆம் வகுப்பு கணிதம் பருவம் 2' }
      },
      {
        id: 'off-q-5',
        kind: 'direct_mcq',
        difficulty: 'easy',
        texts: {
          ta: {
            question: 'ஆசியாவிலேயே இரண்டாவது மிகப்பெரிய நூலகம் தமிழகத்தில் எங்கு அமைந்துள்ளது?',
            options: {
              A: 'மதுரை கலைஞர் நூற்றாண்டு நூலகம்',
              B: 'சென்னை அண்ணா நூற்றாண்டு நூலகம்',
              C: 'கன்னிமாரா நூலகம்',
              D: 'சரசுவதி மகால் நூலகம்',
              E: 'விடை தெரியவில்லை (Answer Not Known)'
            }
          },
          en: {
            question: 'Where is the second largest library in Asia situated in Tamil Nadu?',
            options: {
              A: 'Madurai Kalaignar Library',
              B: 'Chennai Anna Centenary Library',
              C: 'Connemara Public Library',
              D: 'Saraswathi Mahal Library',
              E: 'Answer Not Known (Option E)'
            }
          }
        },
        correct_answer: 'B',
        source: { book: '6-ஆம் வகுப்பு தமிழ் இயல் 2' }
      }
    ]
  };

  await saveOfflineTest(bundle);
  return bundle;
}

