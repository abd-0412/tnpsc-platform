import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const { data: tests, error } = await supabase
      .from('test_templates')
      .select(`
        *,
        exams (
          id,
          title_en,
          title_ta
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tests: tests || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      title_en,
      title_ta,
      category,
      exam_id,
      exam_scope = 'selected',
      exam_ids = [],
      duration_minutes,
      total_marks,
      negative_marking_rate,
      question_ids,
      rules,
      is_published,
    } = body;

    if (!title_en || !title_ta || !category) {
      return NextResponse.json(
        { error: 'title_en, title_ta, and category are required' },
        { status: 400 }
      );
    }

    // Resolve multi-exam mapping
    let resolvedExamScope = exam_scope === 'all_groups' ? 'all_groups' : 'selected';
    let resolvedExamIds = Array.isArray(exam_ids) && exam_ids.length > 0 ? exam_ids : (exam_id ? [exam_id] : ['group_4']);
    
    // If all_groups, fetch all active exam IDs from DB
    if (resolvedExamScope === 'all_groups') {
      const { data: dbExams } = await supabase.from('exams').select('id').eq('is_active', true);
      if (dbExams && dbExams.length > 0) {
        resolvedExamIds = dbExams.map((e) => e.id);
      }
    }

    const primaryExamId = resolvedExamIds[0] || exam_id || 'group_4';
    const templateId = id || `TEST-${Date.now().toString(36).toUpperCase()}`;

    const { data: newTemplate, error } = await supabase
      .from('test_templates')
      .insert({
        id: templateId,
        title_en,
        title_ta,
        category,
        exam_id: primaryExamId,
        exam_scope: resolvedExamScope,
        exam_ids: resolvedExamIds,
        duration_minutes: duration_minutes || 60,
        total_marks: total_marks || (question_ids?.length ? question_ids.length * 1.5 : 100),
        negative_marking_rate: negative_marking_rate ?? 0.0,
        question_count: question_ids?.length || 0,
        question_ids: question_ids || [],
        rules: {
          ...(rules || {}),
          exam_scope: resolvedExamScope,
          exam_ids: resolvedExamIds,
          randomize_questions: rules?.randomize_questions ?? false,
          randomize_options: rules?.randomize_options ?? false,
          allow_language_toggle: rules?.allow_language_toggle ?? true,
        },
        is_published: is_published ?? false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, test: newTemplate });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

