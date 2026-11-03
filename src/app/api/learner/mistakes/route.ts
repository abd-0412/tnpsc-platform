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

    const { data: mistakes, error } = await supabase
      .from('mistake_vault')
      .select(`
        *,
        questions (
          id,
          kind,
          level,
          difficulty,
          texts,
          answer,
          source,
          syllabus,
          tags
        )
      `)
      .eq('user_id', user.id)
      .order('next_review_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const mistakesWithDueStatus = mistakes?.map((m) => {
      const reviewDate = new Date(m.next_review_at);
      const isDue = reviewDate <= now && !m.is_resolved;
      const isOverdue = reviewDate < new Date(now.getTime() - 24 * 60 * 60 * 1000) && !m.is_resolved;
      const isUpcoming = reviewDate > now && !m.is_resolved;
      return {
        ...m,
        is_due: isDue,
        is_overdue: isOverdue,
        is_upcoming: isUpcoming,
      };
    });

    return NextResponse.json({ mistakes: mistakesWithDueStatus || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, notes } = body; // action: 'level_up' | 'level_down' | 'resolve' | 'update_notes'

    if (!id) {
      return NextResponse.json({ error: 'Mistake record id is required' }, { status: 400 });
    }

    const { data: current } = await supabase
      .from('mistake_vault')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    let nextLevel = current.repetition_level;
    let isResolved = current.is_resolved;
    let daysToAdd = 1;

    // Spaced repetition interval mapping: 1d, 3d, 7d, 14d, 30d
    const intervals = [1, 3, 7, 14, 30];

    if (action === 'level_up') {
      nextLevel = Math.min(5, current.repetition_level + 1);
      if (nextLevel >= 5) {
        isResolved = true;
      } else {
        daysToAdd = intervals[nextLevel] || 30;
      }
    } else if (action === 'level_down') {
      nextLevel = Math.max(0, current.repetition_level - 1);
      daysToAdd = intervals[nextLevel] || 1;
    } else if (action === 'resolve') {
      isResolved = !current.is_resolved;
    } else if (action === 'reopen') {
      isResolved = false;
      nextLevel = 0;
      daysToAdd = 1;
    }

    const nextReviewAt = isResolved
      ? current.next_review_at
      : new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

    const updatePayload: Record<string, any> = {
      repetition_level: nextLevel,
      is_resolved: isResolved,
      next_review_at: nextReviewAt,
      review_count: current.review_count + 1,
      last_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (notes !== undefined) {
      updatePayload.notes = notes;
    }

    const { data: updated, error } = await supabase
      .from('mistake_vault')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, mistake: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const PATCH = PUT;

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
    const { question_id, reason = 'manual_add', notes } = body;

    if (!question_id) {
      return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
    }

    // Check if question exists
    const { data: q, error: qErr } = await supabase
      .from('questions')
      .select('id')
      .eq('id', question_id)
      .single();

    if (qErr || !q) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Upsert into mistake_vault
    const { data: mistake, error: mErr } = await supabase
      .from('mistake_vault')
      .upsert(
        {
          user_id: user.id,
          question_id,
          reason,
          notes: notes || null,
          repetition_level: 0,
          next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_resolved: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,question_id' }
      )
      .select()
      .single();

    if (mErr) {
      return NextResponse.json({ error: mErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, mistake, is_saved: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const question_id = searchParams.get('question_id');
    const id = searchParams.get('id');

    let query = supabase.from('mistake_vault').delete().eq('user_id', user.id);

    if (id) {
      query = query.eq('id', id);
    } else if (question_id) {
      query = query.eq('question_id', question_id);
    } else {
      return NextResponse.json({ error: 'id or question_id required' }, { status: 400 });
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, is_saved: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


