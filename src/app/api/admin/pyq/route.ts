import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
    const q = searchParams.get('q') || '';
    const exam = searchParams.get('exam') || 'all';
    const year = searchParams.get('year') || 'all';
    const status = searchParams.get('status') || 'all';
    const completion = searchParams.get('completion') || 'all'; // 'complete' | 'incomplete'
    const isArchived = searchParams.get('is_archived') === 'true';

    // 1. Fetch papers
    let query = supabase
      .from('pyq_papers')
      .select(`
        *,
        exams (
          id,
          title_en,
          title_ta
        )
      `)
      .is('deleted_at', null)
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (isArchived) {
      query = query.eq('is_archived', true);
    } else {
      query = query.eq('is_archived', false);
    }

    if (exam !== 'all') {
      query = query.eq('exam_id', exam);
    }
    if (year !== 'all') {
      const yearNum = parseInt(year, 10);
      if (!isNaN(yearNum)) {
        query = query.eq('year', yearNum);
      }
    }
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: papers, error } = await query;

    if (error) {
      console.error('Error fetching PYQ papers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Fetch assigned question counts for each paper
    const paperIds = (papers || []).map((p) => p.id);
    let questionCountsMap: Record<string, number> = {};

    if (paperIds.length > 0) {
      const { data: qCounts, error: countErr } = await supabase
        .from('pyq_paper_questions')
        .select('paper_id, question_id');

      if (!countErr && qCounts) {
        qCounts.forEach((row) => {
          questionCountsMap[row.paper_id] = (questionCountsMap[row.paper_id] || 0) + 1;
        });
      }
    }

    // 3. Attach actual question counts and compute completion
    let enrichedPapers = (papers || []).map((paper) => {
      const assignedCount = questionCountsMap[paper.id] || 0;
      const isComplete = assignedCount >= paper.expected_question_count;
      return {
        ...paper,
        assigned_questions_count: assignedCount,
        is_complete: isComplete,
      };
    });

    // 4. Apply search filter if provided
    if (q.trim()) {
      const queryLower = q.toLowerCase();
      enrichedPapers = enrichedPapers.filter((p) => {
        const titleTa = (p.title_ta || '').toLowerCase();
        const titleEn = (p.title_en || '').toLowerCase();
        const code = (p.paper_code || '').toLowerCase();
        const examTitle = (p.exams?.title_en || '').toLowerCase();
        const paperYear = String(p.year);
        return (
          titleTa.includes(queryLower) ||
          titleEn.includes(queryLower) ||
          code.includes(queryLower) ||
          examTitle.includes(queryLower) ||
          paperYear.includes(queryLower)
        );
      });
    }

    // 5. Apply completion filter if provided
    if (completion === 'complete') {
      enrichedPapers = enrichedPapers.filter((p) => p.is_complete);
    } else if (completion === 'incomplete') {
      enrichedPapers = enrichedPapers.filter((p) => !p.is_complete);
    }

    // 6. Compute global database statistics across all active papers
    const { data: allActivePapers } = await supabase
      .from('pyq_papers')
      .select('id, status, expected_question_count, is_archived')
      .is('deleted_at', null)
      .eq('is_archived', false);

    const activeList = allActivePapers || [];
    let totalQuestionsAcrossPapers = 0;
    Object.values(questionCountsMap).forEach((cnt) => {
      totalQuestionsAcrossPapers += cnt;
    });

    let publishedCount = 0;
    let draftCount = 0;
    let incompleteCount = 0;

    activeList.forEach((p) => {
      if (p.status === 'published') publishedCount++;
      else draftCount++;

      const assigned = questionCountsMap[p.id] || 0;
      if (assigned < p.expected_question_count) {
        incompleteCount++;
      }
    });

    return NextResponse.json({
      papers: enrichedPapers,
      stats: {
        totalPapers: activeList.length,
        totalQuestionsAcrossPapers,
        publishedPapers: publishedCount,
        draftPapers: draftCount,
        incompletePapers: incompleteCount,
      },
    });
  } catch (err: any) {
    console.error('Unexpected error in GET /api/admin/pyq:', err);
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
    const {
      title_en,
      title_ta,
      exam_id,
      exam_group = 'Group 4',
      year,
      date_held,
      paper_code,
      duration_minutes = 180,
      total_marks = 300,
      expected_question_count = 200,
      instructions_en = '',
      instructions_ta = '',
      high_yield_topics = [],
    } = body;

    if (!title_ta || !title_en) {
      return NextResponse.json({ error: 'Title in Tamil and English is required.' }, { status: 400 });
    }

    if (!exam_id) {
      return NextResponse.json({ error: 'Examination is required.' }, { status: 400 });
    }

    const yearNum = parseInt(String(year), 10);
    if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2100) {
      return NextResponse.json({ error: 'A valid examination year is required.' }, { status: 400 });
    }

    // Auto-generate Paper ID if not provided
    const safeCode = paper_code ? paper_code.toUpperCase().replace(/\s+/g, '-') : `${exam_id.toUpperCase()}-${yearNum}`;
    const id = body.id || `PYQ-${safeCode}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

    const now = new Date().toISOString();

    const { data: newPaper, error: insertError } = await supabase
      .from('pyq_papers')
      .insert([
        {
          id,
          title_en,
          title_ta,
          exam_id,
          exam_group,
          year: yearNum,
          date_held: date_held || null,
          paper_code: safeCode,
          duration_minutes: Number(duration_minutes) || 180,
          total_marks: Number(total_marks) || 300,
          expected_question_count: Number(expected_question_count) || 200,
          instructions_en,
          instructions_ta,
          high_yield_topics: Array.isArray(high_yield_topics) ? high_yield_topics : [],
          status: 'draft',
          is_archived: false,
          created_by: user.id,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating PYQ paper:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'pyq_paper_create',
      entityType: 'pyq_paper',
      entityId: id,
      details: {
        title_en,
        exam_id,
        year: yearNum,
      },
    });

    return NextResponse.json(
      { paper: newPaper, message: 'PYQ Paper created successfully.' },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error in POST /api/admin/pyq:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

