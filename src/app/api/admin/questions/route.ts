import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuestionSchema } from '@/lib/schemas/question';

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
    const difficulty = searchParams.get('difficulty') || '';
    const kind = searchParams.get('kind') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (kind) {
      query = query.eq('kind', kind);
    }
    if (status) {
      query = query.eq('workflow->>status', status);
    }
    if (subject) {
      query = query.eq('syllabus->>subject_id', subject);
    }

    // Text search in Tamil and English texts
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
      .select('role')
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

    // Validate with Zod
    const validatedData = QuestionSchema.parse({
      ...body,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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

    return NextResponse.json({ question: data, message: 'Question created successfully' }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating question:', err);
    if (err.errors) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 422 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

