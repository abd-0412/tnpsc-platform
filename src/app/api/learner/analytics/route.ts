import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function categorizeSubject(snapshot: any): { id: string; nameEn: string; nameTa: string; domain: string } {
  const subj = (snapshot?.syllabus?.subject_id || snapshot?.subject || '').toLowerCase();
  const book = (snapshot?.source?.book || '').toLowerCase();
  const title = (snapshot?.syllabus?.node_title || '').toLowerCase();
  const tags = (snapshot?.tags || []).map((t: string) => String(t).toLowerCase());

  // General Tamil
  if (
    subj.includes('tamil') ||
    subj === 'general_tamil' ||
    book.includes('தமிழ்') ||
    book.includes('tamil') ||
    title.includes('தமிழ்') ||
    title.includes('இலக்கியம்') ||
    title.includes('இலக்கணம்') ||
    tags.some((t: string) => t.includes('tamil'))
  ) {
    return { id: 'general_tamil', nameEn: 'General Tamil', nameTa: 'பொதுத்தமிழ்', domain: 'language' };
  }

  // Aptitude & Mental Ability
  if (
    subj.includes('aptitude') ||
    subj.includes('math') ||
    title.includes('கணிதம்') ||
    title.includes('திறனறிவு') ||
    tags.some((t: string) => t.includes('aptitude') || t.includes('math'))
  ) {
    return { id: 'aptitude', nameEn: 'Aptitude & Mental Ability', nameTa: 'கணிதம் & திறனறிவு', domain: 'aptitude' };
  }

  // Indian Polity
  if (subj.includes('polity') || title.includes('அரசியலமைப்பு') || tags.some((t: string) => t.includes('polity'))) {
    return { id: 'polity', nameEn: 'Indian Polity', nameTa: 'இந்திய ஆட்சியியல்', domain: 'gs' };
  }

  // History & INM
  if (subj.includes('history') || subj.includes('inm') || title.includes('வரலாறு') || tags.some((t: string) => t.includes('history') || t.includes('inm'))) {
    return { id: 'history', nameEn: 'History & INM', nameTa: 'வரலாறு & தேசிய இயக்கம்', domain: 'gs' };
  }

  // General Science
  if (subj.includes('science') || title.includes('அறிவியல்') || tags.some((t: string) => t.includes('science'))) {
    return { id: 'science', nameEn: 'General Science', nameTa: 'பொது அறிவியல்', domain: 'gs' };
  }

  // Geography
  if (subj.includes('geo') || title.includes('புவியியல்') || tags.some((t: string) => t.includes('geography'))) {
    return { id: 'geography', nameEn: 'Geography', nameTa: 'புவியியல்', domain: 'gs' };
  }

  // Economics
  if (subj.includes('eco') || title.includes('பொருளாதாரம்') || tags.some((t: string) => t.includes('economics'))) {
    return { id: 'economics', nameEn: 'Indian Economy', nameTa: 'இந்தியப் பொருளாதாரம்', domain: 'gs' };
  }

  // Default fallback: General Studies
  return { id: 'general_studies', nameEn: 'General Studies (GS)', nameTa: 'பொது அறிவு (GS)', domain: 'gs' };
}

function extractTopicInfo(snapshot: any): { topicId: string; topicNameEn: string; topicNameTa: string } {
  const nodeTitle = snapshot?.syllabus?.node_title;
  const book = snapshot?.source?.book;
  const standard = snapshot?.source?.standard || snapshot?.syllabus?.standard;
  const term = snapshot?.source?.term || snapshot?.syllabus?.term;

  if (nodeTitle) {
    return { topicId: snapshot?.syllabus?.node_id || nodeTitle, topicNameEn: nodeTitle, topicNameTa: nodeTitle };
  }

  if (book && standard) {
    const nameEn = `${standard}th Std - ${book}${term ? ` (Term ${term})` : ''}`;
    const nameTa = `${standard}-ஆம் வகுப்பு - ${book}${term ? ` (பருவம் ${term})` : ''}`;
    return { topicId: `std-${standard}-${book}`, topicNameEn: nameEn, topicNameTa: nameTa };
  }

  if (book) {
    return { topicId: book, topicNameEn: book, topicNameTa: book };
  }

  const tags = snapshot?.tags || [];
  if (tags.length > 0) {
    return { topicId: tags[0], topicNameEn: tags[0], topicNameTa: tags[0] };
  }

  return { topicId: 'general', topicNameEn: 'General Concepts', topicNameTa: 'பொதுவான பாடப்பகுதிகள்' };
}

function normalizeDifficulty(diff: string | undefined): 'easy' | 'medium' | 'hard' {
  const d = (diff || '').toLowerCase();
  if (d === 'easy' || d === 'foundation') return 'easy';
  if (d === 'hard' || d === 'mains') return 'hard';
  return 'medium';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examFilter = searchParams.get('exam_id') || 'all';
    const dateRangeFilter = searchParams.get('date_range') || 'all';

    // 1. Fetch available exams for the filter dropdown
    const { data: examsData } = await supabase
      .from('exams')
      .select('id, title_en, title_ta')
      .eq('is_active', true);

    const availableExams = [
      { id: 'all', title_en: 'All Examinations', title_ta: 'அனைத்து தேர்வுகள்' },
      ...(examsData || []),
    ];

    // 2. Fetch completed test attempts with filters
    let query = supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', user.id);

    if (examFilter !== 'all') {
      query = query.eq('exam_id', examFilter);
    }

    if (dateRangeFilter === '7d') {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      query = query.gte('completed_at', since);
    } else if (dateRangeFilter === '30d') {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      query = query.gte('completed_at', since);
    } else if (dateRangeFilter === '90d') {
      const since = new Date(Date.now() - 90 * 86400000).toISOString();
      query = query.gte('completed_at', since);
    }

    const { data: allUserAttempts, error: attemptsError } = await query.order('completed_at', { ascending: true });

    if (attemptsError) {
      return NextResponse.json({ error: attemptsError.message }, { status: 500 });
    }

    const totalAttemptsCount = allUserAttempts?.length || 0;
    const completedAttempts = (allUserAttempts || []).filter((a) => a.status === 'completed');
    const inProgressCount = (allUserAttempts || []).filter((a) => a.status === 'in_progress').length;
    const abandonedCount = (allUserAttempts || []).filter((a) => a.status === 'abandoned').length;

    // 3. Compute High-Level Metrics
    const totalTests = completedAttempts.length;
    const totalQuestionsAttempted = completedAttempts.reduce((acc, a) => acc + (a.total_questions || 0), 0);
    const totalCorrect = completedAttempts.reduce((acc, a) => acc + (a.correct_count || 0), 0);
    const totalWrong = completedAttempts.reduce((acc, a) => acc + (a.wrong_count || 0), 0);
    const totalUnanswered = completedAttempts.reduce((acc, a) => acc + (a.unanswered_count || 0), 0);
    const totalTimeSeconds = completedAttempts.reduce((acc, a) => acc + (a.total_time_seconds || 0), 0);
    const totalScore = completedAttempts.reduce((acc, a) => acc + Number(a.score || 0), 0);

    const overallAccuracy =
      totalQuestionsAttempted > 0 ? parseFloat(((totalCorrect / totalQuestionsAttempted) * 100).toFixed(1)) : 0;

    const avgScore = totalTests > 0 ? parseFloat((totalScore / totalTests).toFixed(1)) : 0;
    const highestScore = completedAttempts.length > 0 ? Math.max(...completedAttempts.map((a) => Number(a.score || 0))) : 0;

    const avgSecondsPerQuestion =
      totalQuestionsAttempted > 0 ? Math.round(totalTimeSeconds / totalQuestionsAttempted) : 0;

    const completionRate =
      totalAttemptsCount > 0 ? Math.round((totalTests / totalAttemptsCount) * 100) : 0;

    // 4. Trend Progression (Chronological order)
    const trends = completedAttempts.map((a, idx) => ({
      attemptId: a.id,
      index: idx + 1,
      title: a.title_ta || a.title_en || `Test #${idx + 1}`,
      titleEn: a.title_en || a.title_ta || `Test #${idx + 1}`,
      score: Number(a.score || 0),
      accuracy: Number(a.accuracy_percentage || 0),
      totalQuestions: a.total_questions,
      correctCount: a.correct_count,
      wrongCount: a.wrong_count,
      timeSeconds: a.total_time_seconds,
      date: a.completed_at
        ? new Date(a.completed_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        : '',
      fullDate: a.completed_at
        ? new Date(a.completed_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : '',
    }));

    // Calculate improvement trajectory (First 3 vs Last 3)
    let trajectoryChange = 0;
    if (trends.length >= 2) {
      const firstChunk = trends.slice(0, Math.min(3, Math.ceil(trends.length / 2)));
      const lastChunk = trends.slice(-Math.min(3, Math.ceil(trends.length / 2)));
      const firstAvg = firstChunk.reduce((s, t) => s + t.accuracy, 0) / firstChunk.length;
      const lastAvg = lastChunk.reduce((s, t) => s + t.accuracy, 0) / lastChunk.length;
      trajectoryChange = parseFloat((lastAvg - firstAvg).toFixed(1));
    }

    // 5. Fetch attempt items to calculate Subject, Topic & Difficulty analytics
    const attemptIds = completedAttempts.slice(-30).map((a) => a.id);
    let items: any[] = [];

    if (attemptIds.length > 0) {
      const { data: itemRows } = await supabase
        .from('test_attempt_items')
        .select('attempt_id, question_id, is_correct, is_answered, marks_obtained, time_spent_seconds, question_snapshot')
        .in('attempt_id', attemptIds);

      items = itemRows || [];
    }

    // Subject Breakdown Map
    const subjectMap: Record<
      string,
      {
        id: string;
        nameEn: string;
        nameTa: string;
        domain: string;
        attempted: number;
        correct: number;
        wrong: number;
        unanswered: number;
        totalTimeSeconds: number;
      }
    > = {};

    // Difficulty Breakdown Map
    const difficultyMap: Record<
      'easy' | 'medium' | 'hard',
      { attempted: number; correct: number; wrong: number; totalTimeSeconds: number }
    > = {
      easy: { attempted: 0, correct: 0, wrong: 0, totalTimeSeconds: 0 },
      medium: { attempted: 0, correct: 0, wrong: 0, totalTimeSeconds: 0 },
      hard: { attempted: 0, correct: 0, wrong: 0, totalTimeSeconds: 0 },
    };

    // Topic Breakdown Map
    const topicMap: Record<
      string,
      {
        id: string;
        nameEn: string;
        nameTa: string;
        subjectId: string;
        subjectNameTa: string;
        attempted: number;
        correct: number;
        wrong: number;
        totalTimeSeconds: number;
      }
    > = {};

    // Process Attempt Items
    for (const item of items) {
      const snapshot = item.question_snapshot || {};
      const subject = categorizeSubject(snapshot);
      const difficulty = normalizeDifficulty(snapshot.difficulty);
      const topic = extractTopicInfo(snapshot);

      const isCorrect = item.is_correct === true;
      const isAnswered = item.is_answered === true;
      const timeSpent = item.time_spent_seconds || 0;

      // Update Subject
      if (!subjectMap[subject.id]) {
        subjectMap[subject.id] = {
          id: subject.id,
          nameEn: subject.nameEn,
          nameTa: subject.nameTa,
          domain: subject.domain,
          attempted: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
          totalTimeSeconds: 0,
        };
      }
      subjectMap[subject.id].attempted += 1;
      if (isCorrect) subjectMap[subject.id].correct += 1;
      else if (isAnswered) subjectMap[subject.id].wrong += 1;
      else subjectMap[subject.id].unanswered += 1;
      subjectMap[subject.id].totalTimeSeconds += timeSpent;

      // Update Difficulty
      difficultyMap[difficulty].attempted += 1;
      if (isCorrect) difficultyMap[difficulty].correct += 1;
      else if (isAnswered) difficultyMap[difficulty].wrong += 1;
      difficultyMap[difficulty].totalTimeSeconds += timeSpent;

      // Update Topic
      if (!topicMap[topic.topicId]) {
        topicMap[topic.topicId] = {
          id: topic.topicId,
          nameEn: topic.topicNameEn,
          nameTa: topic.topicNameTa,
          subjectId: subject.id,
          subjectNameTa: subject.nameTa,
          attempted: 0,
          correct: 0,
          wrong: 0,
          totalTimeSeconds: 0,
        };
      }
      topicMap[topic.topicId].attempted += 1;
      if (isCorrect) topicMap[topic.topicId].correct += 1;
      else if (isAnswered) topicMap[topic.topicId].wrong += 1;
      topicMap[topic.topicId].totalTimeSeconds += timeSpent;
    }

    // Format Subject Performance List
    const subjects = Object.values(subjectMap).map((s) => {
      const accuracy = s.attempted > 0 ? parseFloat(((s.correct / s.attempted) * 100).toFixed(1)) : 0;
      const avgSeconds = s.attempted > 0 ? Math.round(s.totalTimeSeconds / s.attempted) : 0;
      return {
        ...s,
        accuracy,
        avgSeconds,
      };
    }).sort((a, b) => b.attempted - a.attempted);

    // Format Difficulty Performance
    const difficultyAnalysis = (['easy', 'medium', 'hard'] as const).map((level) => {
      const d = difficultyMap[level];
      const accuracy = d.attempted > 0 ? parseFloat(((d.correct / d.attempted) * 100).toFixed(1)) : 0;
      const avgSeconds = d.attempted > 0 ? Math.round(d.totalTimeSeconds / d.attempted) : 0;
      return {
        level,
        labelEn: level === 'easy' ? 'Easy' : level === 'medium' ? 'Medium' : 'Hard',
        labelTa: level === 'easy' ? 'எளிது' : level === 'medium' ? 'நடுத்தரம்' : 'கடினம்',
        attempted: d.attempted,
        correct: d.correct,
        wrong: d.wrong,
        accuracy,
        avgSeconds,
      };
    });

    // Format Topic List
    const topics = Object.values(topicMap).map((t) => {
      const accuracy = t.attempted > 0 ? parseFloat(((t.correct / t.attempted) * 100).toFixed(1)) : 0;
      const avgSeconds = t.attempted > 0 ? Math.round(t.totalTimeSeconds / t.attempted) : 0;
      return {
        ...t,
        accuracy,
        avgSeconds,
      };
    });

    // 6. Strengths and Weaknesses (Only consider topics with at least 2 questions attempted)
    const evaluatedTopics = topics.filter((t) => t.attempted >= 2);

    const strongTopics = evaluatedTopics
      .filter((t) => t.accuracy >= 75)
      .sort((a, b) => b.accuracy - a.accuracy || b.attempted - a.attempted)
      .slice(0, 5);

    const weakTopics = evaluatedTopics
      .filter((t) => t.accuracy < 65)
      .sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong)
      .slice(0, 5);

    // Strong & Weak Subjects
    const evaluatedSubjects = subjects.filter((s) => s.attempted >= 3);
    const strongSubjects = evaluatedSubjects
      .filter((s) => s.accuracy >= 70)
      .sort((a, b) => b.accuracy - a.accuracy);
    const weakSubjects = evaluatedSubjects
      .filter((s) => s.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy);

    // 7. Mistake Vault & Repeated Mistakes Insights
    const { count: activeMistakes } = await supabase
      .from('mistake_vault')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_resolved', false);

    const { count: masteredMistakes } = await supabase
      .from('mistake_vault')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_resolved', true);

    const { data: frequentMistakes } = await supabase
      .from('mistake_vault')
      .select('id, question_id, incorrect_count, review_count, repetition_level, reason, updated_at')
      .eq('user_id', user.id)
      .order('incorrect_count', { ascending: false })
      .limit(6);

    const totalVaultEntries = (activeMistakes || 0) + (masteredMistakes || 0);
    const mistakeMasteryRate =
      totalVaultEntries > 0 ? Math.round(((masteredMistakes || 0) / totalVaultEntries) * 100) : 0;

    return NextResponse.json({
      filters: {
        examId: examFilter,
        dateRange: dateRangeFilter,
        availableExams,
      },
      overview: {
        totalTests,
        totalAttemptsCount,
        inProgressCount,
        abandonedCount,
        totalQuestionsAttempted,
        totalCorrect,
        totalWrong,
        totalUnanswered,
        overallAccuracy,
        totalScore,
        avgScore,
        highestScore,
        totalTimeSeconds,
        avgSecondsPerQuestion,
        completionRate,
        trajectoryChange,
      },
      trends,
      subjects,
      topics,
      difficultyAnalysis,
      strengthsAndWeaknesses: {
        strongTopics,
        weakTopics,
        strongSubjects,
        weakSubjects,
        hasSufficientData: evaluatedTopics.length > 0,
      },
      mistakesInsight: {
        activeMistakes: activeMistakes || 0,
        masteredMistakes: masteredMistakes || 0,
        totalVaultEntries,
        mistakeMasteryRate,
        frequentMistakes: frequentMistakes || [],
      },
    });
  } catch (err: any) {
    console.error('Analytics API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
