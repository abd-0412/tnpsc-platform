import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
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
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { action = 'publish' } = body; // 'validate_only' | 'publish' | 'unpublish'

    // 1. Fetch paper details
    const { data: paper, error: paperErr } = await supabase
      .from('pyq_papers')
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

    if (paperErr || !paper) {
      return NextResponse.json({ error: 'PYQ Paper not found' }, { status: 404 });
    }

    // 2. Fetch all assigned questions in order
    const { data: paperQuestions, error: pqErr } = await supabase
      .from('pyq_paper_questions')
      .select(`
        question_id,
        sequence_order,
        questions (
          id,
          texts,
          answer,
          workflow,
          is_archived
        )
      `)
      .eq('paper_id', id)
      .order('sequence_order', { ascending: true });

    if (pqErr) {
      return NextResponse.json({ error: pqErr.message }, { status: 500 });
    }

    const questions = (paperQuestions || []).map((pq: any) => ({
      ...pq.questions,
      sequence_order: pq.sequence_order,
    }));

    // 3. Perform Validation Checklist
    const errors: string[] = [];
    const warnings: string[] = [];

    const assignedCount = questions.length;
    const expectedCount = paper.expected_question_count || 200;

    if (assignedCount === 0) {
      errors.push('No questions have been assigned to this paper yet.');
    } else if (assignedCount < expectedCount) {
      warnings.push(`Assigned questions count (${assignedCount}) is less than expected count (${expectedCount}).`);
    }

    let missingAnswers = 0;
    let missingTamil = 0;
    let missingEnglish = 0;
    let unverifiedQuestions = 0;
    let rejectedQuestions = 0;
    const seenIds = new Set<string>();
    let duplicates = 0;

    questions.forEach((q) => {
      if (!q.texts?.ta?.question) {
        missingTamil++;
      }
      if (!q.texts?.en?.question) {
        missingEnglish++;
      }
      if (!q.answer?.correct_option_id && !q.answer?.correct_key) {
        missingAnswers++;
      }

      const status = q.workflow?.status || 'draft';
      if (status === 'rejected') {
        rejectedQuestions++;
      } else if (status !== 'published' && status !== 'verified') {
        unverifiedQuestions++;
      }

      if (seenIds.has(q.id)) {
        duplicates++;
      } else {
        seenIds.add(q.id);
      }
    });

    if (missingAnswers > 0) {
      errors.push(`${missingAnswers} question(s) are missing valid correct answers.`);
    }
    if (missingTamil > 0) {
      errors.push(`${missingTamil} question(s) are missing Tamil question content.`);
    }
    if (duplicates > 0) {
      errors.push(`${duplicates} duplicate question assignment(s) detected.`);
    }
    if (rejectedQuestions > 0) {
      errors.push(`${rejectedQuestions} question(s) in this paper are in Rejected status.`);
    }
    if (unverifiedQuestions > 0) {
      warnings.push(`${unverifiedQuestions} question(s) are still in Draft / Pending Review.`);
    }
    if (missingEnglish > 0) {
      warnings.push(`${missingEnglish} question(s) have no English translation (will display in Tamil only).`);
    }

    const isEligible = errors.length === 0;

    // If 'validate_only', return status report
    if (action === 'validate_only') {
      return NextResponse.json({
        isEligible,
        assignedCount,
        expectedCount,
        missingQuestions: Math.max(0, expectedCount - assignedCount),
        unverifiedCount: unverifiedQuestions,
        missingAnswersCount: missingAnswers,
        missingTranslationsCount: missingEnglish,
        errors,
        warnings,
      });
    }

    // 4. ACTION: UNPUBLISH
    if (action === 'unpublish') {
      await supabase
        .from('pyq_papers')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (paper.test_template_id) {
        await supabase
          .from('test_templates')
          .update({
            is_published: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paper.test_template_id);
      }

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'pyq_paper_unpublish',
        entityType: 'pyq_paper',
        entityId: id,
        details: { title_en: paper.title_en },
      });

      return NextResponse.json({
        success: true,
        message: `Paper "${paper.title_en}" unpublished successfully.`,
        status: 'draft',
      });
    }

    // 5. ACTION: PUBLISH
    if (action === 'publish') {
      if (!isEligible) {
        return NextResponse.json(
          {
            error: 'Paper cannot be published due to validation errors.',
            errors,
            warnings,
          },
          { status: 400 }
        );
      }

      const now = new Date().toISOString();
      const testTemplateId = paper.test_template_id || `TEST-${paper.id}`;
      const questionIdsInOrder = questions.map((q) => q.id);

      // Create or update corresponding Test Template in Test Manager
      const { error: testUpsertErr } = await supabase
        .from('test_templates')
        .upsert(
          {
            id: testTemplateId,
            title_en: paper.title_en,
            title_ta: paper.title_ta,
            category: 'previous_year',
            exam_id: paper.exam_id,
            duration_minutes: paper.duration_minutes,
            total_marks: paper.total_marks,
            negative_marking_rate: 0.0,
            question_count: assignedCount,
            question_ids: questionIdsInOrder,
            rules: {
              randomize_questions: false, // PYQ papers must preserve official sequence!
              randomize_options: false,
              allow_language_toggle: true,
            },
            is_published: true,
            updated_at: now,
          },
          { onConflict: 'id' }
        );

      if (testUpsertErr) {
        console.error('Error syncing test template for PYQ paper:', testUpsertErr);
        return NextResponse.json({ error: testUpsertErr.message }, { status: 500 });
      }

      // Update pyq_papers record
      const { error: updateErr } = await supabase
        .from('pyq_papers')
        .update({
          status: 'published',
          test_template_id: testTemplateId,
          updated_at: now,
        })
        .eq('id', id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'pyq_paper_publish',
        entityType: 'pyq_paper',
        entityId: id,
        details: {
          title_en: paper.title_en,
          testTemplateId,
          questionCount: assignedCount,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Paper "${paper.title_en}" published successfully and integrated with Test Manager!`,
        testTemplateId,
        questionCount: assignedCount,
      });
    }

    return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
  } catch (err: any) {
    console.error('Error in POST /api/admin/pyq/[id]/publish:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
