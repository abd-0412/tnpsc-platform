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

    // Fetch all syllabus nodes
    const { data: nodes, error: nError } = await supabase
      .from('syllabus_nodes')
      .select('id, parent_id, level, title_en, title_ta, order_index')
      .order('order_index', { ascending: true });

    if (nError) {
      return NextResponse.json({ error: nError.message }, { status: 500 });
    }

    // Fetch user's progress records
    const { data: progressList, error: pError } = await supabase
      .from('learner_syllabus_progress')
      .select('*')
      .eq('user_id', user.id);

    if (pError) {
      return NextResponse.json({ error: pError.message }, { status: 500 });
    }

    const progressMap = new Map<string, any>();
    progressList?.forEach((p) => {
      progressMap.set(p.syllabus_node_id, p);
    });

    const enrichedNodes = nodes?.map((n) => {
      const prog = progressMap.get(n.id);
      return {
        ...n,
        status: prog?.status || 'not_started',
        questions_practiced: prog?.questions_practiced || 0,
        notes: prog?.notes || '',
      };
    });

    return NextResponse.json({ nodes: enrichedNodes || [] });
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

    const body = await request.json();
    const { syllabus_node_id, status, notes } = body;

    if (!syllabus_node_id || !status) {
      return NextResponse.json({ error: 'syllabus_node_id and status are required' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('learner_syllabus_progress')
      .upsert(
        {
          user_id: user.id,
          syllabus_node_id,
          status,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,syllabus_node_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

