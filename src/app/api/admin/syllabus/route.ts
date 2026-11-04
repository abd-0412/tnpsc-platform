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

    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level');
    const parentId = searchParams.get('parent_id');
    const examId = searchParams.get('exam_id');
    const asHierarchy = searchParams.get('hierarchy') === 'true';

    let query = supabase
      .from('syllabus_nodes')
      .select('id, parent_id, level, code, title_en, title_ta, order_index, exam_ids, is_active')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (level) {
      query = query.eq('level', level);
    }
    if (parentId !== null && parentId !== undefined && parentId !== '') {
      if (parentId === 'null' || parentId === 'root') {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', parentId);
      }
    }
    if (examId) {
      query = query.contains('exam_ids', [examId]);
    }

    const { data: nodes, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (asHierarchy && (!level && !parentId)) {
      // Group into hierarchical map for instant front-end navigation
      const classes = (nodes || []).filter((n) => n.level === 'class');
      const subjects = (nodes || []).filter((n) => n.level === 'subject');
      const terms = (nodes || []).filter((n) => n.level === 'term');
      const units = (nodes || []).filter((n) => n.level === 'unit');
      const lessons = (nodes || []).filter((n) => n.level === 'lesson');
      const chapters = (nodes || []).filter((n) => n.level === 'chapter');

      return NextResponse.json({
        nodes,
        classes,
        subjects,
        terms,
        units,
        lessons,
        chapters,
      });
    }

    return NextResponse.json({ nodes: nodes || [] });
  } catch (err: any) {
    console.error('Error fetching syllabus nodes:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
