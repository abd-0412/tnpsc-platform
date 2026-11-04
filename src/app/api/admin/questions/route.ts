import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuestionSchema } from '@/lib/schemas/question';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify Admin authentication
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
    const search = searchParams.get('q') || '';
    const exam = searchParams.get('exam') || '';
    const subject = searchParams.get('subject') || '';
    const term = searchParams.get('term') || '';
    const unit = searchParams.get('unit') || '';
    const lesson = searchParams.get('lesson') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const kind = searchParams.get('kind') || '';
    const status = searchParams.get('status') || '';
    const tab = searchParams.get('tab') || 'active'; // 'active' | 'archived' | 'deleted'
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply tab constraint
    if (tab === 'archived') {
      query = query.eq('is_archived', true).is('deleted_at', null);
    } else if (tab === 'deleted') {
      query = query.not('deleted_at', 'is', null);
    } else {
      // Default: active questions
      query = query.eq('is_archived', false).is('deleted_at', null);
    }

    // Filters
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (kind) {
      query = query.eq('kind', kind);
    }
    if (status && status !== 'all') {
      if (status === 'under_revision' || status === 'under_review') {
        query = query.or('workflow->>status.eq.under_revision,workflow->>status.eq.under_review');
      } else {
        query = query.eq('workflow->>status', status);
      }
    }
    if (exam) {
      if (exam === 'all_groups') {
        query = query.or('syllabus->>exam_scope.eq.all_groups');
      } else {
        query = query.or(`syllabus->>exam_scope.eq.all_groups,exam_mappings.cs.[{"exam_id":"${exam}"}]`);
      }
    }
    if (subject) {
      query = query.eq('syllabus->>subject_id', subject);
    }
    if (term) {
      if (term === 'all') {
        query = query.or('syllabus->>term_scope.eq.all');
      } else {
        query = query.or(`syllabus->>term_id.eq.${term},syllabus->>term_scope.eq.all`);
      }
    }
    if (unit) {
      if (unit === 'all') {
        query = query.or('syllabus->>unit_scope.eq.all,syllabus->>term_scope.eq.all');
      } else {
        query = query.or(`syllabus->>unit_id.eq.${unit},syllabus->>unit_scope.eq.all,syllabus->>term_scope.eq.all`);
      }
    }
    if (lesson) {
      if (lesson === 'all') {
        query = query.or('syllabus->>lesson_scope.eq.all,syllabus->>unit_scope.eq.all,syllabus->>term_scope.eq.all');
      } else {
        query = query.or(`syllabus->>lesson_id.eq.${lesson},syllabus->>lesson_scope.eq.all,syllabus->>unit_scope.eq.all,syllabus->>term_scope.eq.all`);
      }
    }

    // Text search in Tamil, English, and Question ID
    if (search) {
      query = query.or(
        `texts->ta->>question.ilike.%${search}%,texts->en->>question.ilike.%${search}%,id.ilike.%${search}%`
      );
    }

    const { data: questions, count, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate counts for tabs
    const [
      { count: activeCount },
      { count: archivedCount },
      { count: deletedCount },
      { count: draftCount },
      { count: revisionCount },
      { count: publishedCount },
      { count: rejectedCount },
    ] = await Promise.all([
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_archived', false).is('deleted_at', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_archived', true).is('deleted_at', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).not('deleted_at', 'is', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('workflow->>status', 'draft').eq('is_archived', false).is('deleted_at', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).or('workflow->>status.eq.under_revision,workflow->>status.eq.under_review').eq('is_archived', false).is('deleted_at', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('workflow->>status', 'published').eq('is_archived', false).is('deleted_at', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('workflow->>status', 'rejected').eq('is_archived', false).is('deleted_at', null),
    ]);

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      counts: {
        active: activeCount || 0,
        archived: archivedCount || 0,
        deleted: deletedCount || 0,
        drafts: draftCount || 0,
        under_revision: revisionCount || 0,
        published: publishedCount || 0,
        rejected: rejectedCount || 0,
      },
    });
  } catch (err: any) {
    console.error('Unexpected error in GET /api/admin/questions:', err);
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
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();

    // Auto-generate question ID if not provided
    if (!body.id) {
      const prefix = body.syllabus?.subject_id ? body.syllabus.subject_id.replace('sub-', '') : 'gen';
      const timestamp = Date.now().toString(36).toUpperCase();
      body.id = `TNPSC-${prefix.toUpperCase()}-${timestamp}`;
    }

    const now = new Date().toISOString();
    const adminName = profile.full_name || 'Admin';

    // Critical: New questions MUST always enter Draft / Pending Review
    const initialWorkflow = {
      status: 'draft',
      verification_status: 'pending',
      verified_by: null,
      verified_at: null,
      verification_comments: [],
      history: [
        {
          from_status: '',
          to_status: 'draft',
          action: 'create',
          by_id: user.id,
          by_name: adminName,
          timestamp: now,
        },
      ],
    };

    // Validate with Zod
    const validatedData = QuestionSchema.parse({
      ...body,
      workflow: initialWorkflow,
      is_archived: false,
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
      created_by: user.id,
      created_at: now,
      updated_at: now,
    });

    const { data, error } = await supabase
      .from('questions')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting question:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'question_create',
      entityType: 'question',
      entityId: data.id,
      details: {
        kind: data.kind,
        difficulty: data.difficulty,
        syllabus: data.syllabus,
      },
    });

    return NextResponse.json(
      { question: data, message: 'Question created successfully in Draft status.' },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating question:', err);
    if (err.errors) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 422 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
