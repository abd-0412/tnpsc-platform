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
    const status = searchParams.get('status') || 'draft';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('workflow->>status', status);
    }

    const { data: questions, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
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
      .select('full_name, role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const { questionIds, action, comment } = await request.json();

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'At least one Question ID is required' }, { status: 400 });
    }

    if (!['approve', 'request_correction', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid verification action' }, { status: 400 });
    }

    const reviewerName = profile.full_name || 'Admin';
    const now = new Date().toISOString();

    const newStatus =
      action === 'approve'
        ? 'published'
        : action === 'request_correction'
        ? 'under_review'
        : 'rejected';

    // Fetch existing questions to update workflow object safely
    const { data: existingQuestions, error: fetchErr } = await supabase
      .from('questions')
      .select('id, workflow')
      .in('id', questionIds);

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    for (const q of existingQuestions || []) {
      const currentComments = q.workflow?.verification_comments || [];
      if (comment) {
        currentComments.push({
          author_id: user.id,
          author_name: reviewerName,
          comment,
          created_at: now,
        });
      }

      const updatedWorkflow = {
        status: newStatus,
        verified_by: action === 'approve' ? reviewerName : q.workflow?.verified_by || null,
        verified_at: action === 'approve' ? now : q.workflow?.verified_at || null,
        verification_comments: currentComments,
      };

      await supabase
        .from('questions')
        .update({
          workflow: updatedWorkflow,
          updated_at: now,
        })
        .eq('id', q.id);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${questionIds.length} question(s) with action: ${action}`,
      newStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

