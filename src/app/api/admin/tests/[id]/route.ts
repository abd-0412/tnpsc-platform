import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: test, error } = await supabase
      .from('test_templates')
      .select(`
        *,
        exams (
          id,
          title_en,
          title_ta
        )
      `)
      .eq('id', id)
      .single();

    if (error || !test) {
      return NextResponse.json({ error: 'Test template not found' }, { status: 404 });
    }

    // Fetch questions linked to this test template
    let questions: any[] = [];
    if (test.question_ids && test.question_ids.length > 0) {
      const { data: qData } = await supabase
        .from('questions')
        .select('id, kind, level, difficulty, texts, answer, question_settings, source, syllabus, tags, workflow')
        .in('id', test.question_ids);

      // Preserve the specific order in test.question_ids
      if (qData) {
        const qMap = new Map(qData.map(q => [q.id, q]));
        questions = test.question_ids.map((qid: string) => qMap.get(qid)).filter(Boolean);
      }
    }

    return NextResponse.json({ test, questions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      title_en,
      title_ta,
      category,
      exam_id,
      exam_scope,
      exam_ids,
      duration_minutes,
      total_marks,
      negative_marking_rate,
      question_ids,
      rules,
      is_published,
    } = body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title_en !== undefined) updatePayload.title_en = title_en;
    if (title_ta !== undefined) updatePayload.title_ta = title_ta;
    if (category !== undefined) updatePayload.category = category;

    if (exam_scope !== undefined) {
      updatePayload.exam_scope = exam_scope === 'all_groups' ? 'all_groups' : 'selected';
      if (exam_scope === 'all_groups') {
        const { data: dbExams } = await supabase.from('exams').select('id').eq('is_active', true);
        const allExamIds = dbExams && dbExams.length > 0 ? dbExams.map((e) => e.id) : ['group_1', 'group_2', 'group_2a', 'group_4'];
        updatePayload.exam_ids = allExamIds;
        updatePayload.exam_id = exam_id || allExamIds[0] || 'group_4';
      }
    }

    if (exam_ids !== undefined && exam_scope !== 'all_groups') {
      const arr = Array.isArray(exam_ids) ? exam_ids : [];
      updatePayload.exam_ids = arr;
      if (arr.length > 0) {
        updatePayload.exam_id = arr[0];
      }
    } else if (exam_id !== undefined && exam_scope !== 'all_groups') {
      updatePayload.exam_id = exam_id || null;
      if (exam_id && (!exam_ids || exam_ids.length === 0)) {
        updatePayload.exam_ids = [exam_id];
      }
    }

    if (duration_minutes !== undefined) updatePayload.duration_minutes = duration_minutes;
    if (total_marks !== undefined) updatePayload.total_marks = total_marks;
    if (negative_marking_rate !== undefined) updatePayload.negative_marking_rate = negative_marking_rate;
    if (question_ids !== undefined) {
      updatePayload.question_ids = question_ids;
      updatePayload.question_count = question_ids.length;
    }
    if (rules !== undefined) {
      updatePayload.rules = {
        ...(rules || {}),
        exam_scope: updatePayload.exam_scope || rules.exam_scope,
        exam_ids: updatePayload.exam_ids || rules.exam_ids,
      };
    }
    if (is_published !== undefined) updatePayload.is_published = is_published;

    const { data: updated, error } = await supabase
      .from('test_templates')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, test: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await supabase
      .from('test_templates')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

