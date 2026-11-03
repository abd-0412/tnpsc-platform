import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuestionEditor from '@/components/admin/QuestionEditor';

export const dynamic = 'force-dynamic';

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !question) {
    notFound();
  }

  return <QuestionEditor initialData={question} isEditMode={true} />;
}

