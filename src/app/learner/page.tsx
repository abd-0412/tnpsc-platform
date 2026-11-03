import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LearnerDashboardClient from '@/components/learner/LearnerDashboardClient';

export const dynamic = 'force-dynamic';

export default async function LearnerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    redirect('/admin');
  }

  // Parallel fetch of personal learner metrics strictly isolated by RLS (auth.uid() = user_id)
  const [
    { data: activeExams },
    { data: completedAttempts },
    { count: dueRevisionsCount },
  ] = await Promise.all([
    supabase.from('exams').select('*').eq('is_active', true),
    supabase
      .from('test_attempts')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5),
    supabase
      .from('mistake_vault')
      .select('*', { count: 'exact', head: true })
      .eq('is_resolved', false)
      .lte('next_review_at', new Date().toISOString()),
  ]);

  // Aggregate stats
  const totalAttempts = completedAttempts?.length || 0;
  const totalScore = completedAttempts?.reduce((acc, curr) => acc + Number(curr.score || 0), 0) || 0;
  const avgScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : '0.0';
  const avgAccuracy =
    totalAttempts > 0
      ? (
          completedAttempts!.reduce((acc, curr) => acc + Number(curr.accuracy_percentage || 0), 0) /
          totalAttempts
        ).toFixed(1)
      : '0.0';

  return (
    <LearnerDashboardClient
      profile={profile}
      totalAttempts={totalAttempts}
      avgAccuracy={avgAccuracy}
      avgScore={avgScore}
      dueRevisionsCount={dueRevisionsCount || 0}
      activeExams={activeExams || []}
    />
  );
}
