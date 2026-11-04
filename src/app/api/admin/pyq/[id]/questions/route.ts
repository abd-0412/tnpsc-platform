import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuestionSchema } from '@/lib/schemas/question';
import { normalizeQuestionRecord } from '@/app/api/admin/questions/import/route';
import { logAuditEvent } from '@/lib/audit';

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    // Fetch assigned questions with full question details
    const { data: paperQuestions, error } = await supabase
      .from('pyq_paper_questions')
      .select(`
        id,
        paper_id,
        question_id,
        sequence_order,
        section_name,
        marks,
        negative_marks,
        created_at,
        questions (
          id,
          schema_version,
          kind,
          level,
          difficulty,
          exam_mappings,
          syllabus,
          texts,
          question_data,
          answer,
          question_settings,
          source,
          previous_year,
          workflow,
          language_status,
          is_archived
        )
      `)
      .eq('paper_id', id)
      .order('sequence_order', { ascending: true });

    if (error) {
      console.error('Error fetching paper questions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const questions = (paperQuestions || []).map((pq: any) => ({
      ...pq.questions,
      mapping_id: pq.id,
      paper_id: pq.paper_id,
      sequence_order: pq.sequence_order,
      section_name: pq.section_name,
      paper_marks: pq.marks,
      paper_negative_marks: pq.negative_marks,
    }));

    return NextResponse.json({
      questions,
      totalCount: questions.length,
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/pyq/[id]/questions:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    // Verify paper exists
    const { data: paper, error: paperErr } = await supabase
      .from('pyq_papers')
      .select('id, title_en, exam_id, year')
      .eq('id', id)
      .single();

    if (paperErr || !paper) {
      return NextResponse.json({ error: 'PYQ Paper not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action = 'add_existing' } = body;

    // Get current max sequence_order for this paper
    const { data: maxOrderRow } = await supabase
      .from('pyq_paper_questions')
      .select('sequence_order')
      .eq('paper_id', id)
      .order('sequence_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    let currentOrder = maxOrderRow?.sequence_order || 0;

    // ------------------------------------------------------------------------
    // METHOD A: Add Existing Questions from Question Bank
    // ------------------------------------------------------------------------
    if (action === 'add_existing') {
      const { question_ids, section_name = 'General' } = body;

      if (!Array.isArray(question_ids) || question_ids.length === 0) {
        return NextResponse.json({ error: 'No question IDs provided.' }, { status: 400 });
      }

      // Filter out questions already in this paper to prevent duplicate assignments
      const { data: existingInPaper } = await supabase
        .from('pyq_paper_questions')
        .select('question_id')
        .eq('paper_id', id)
        .in('question_id', question_ids);

      const existingIdSet = new Set((existingInPaper || []).map((r) => r.question_id));
      const newQuestionIds = question_ids.filter((qId) => !existingIdSet.has(qId));

      if (newQuestionIds.length === 0) {
        return NextResponse.json(
          { message: 'All selected questions are already assigned to this paper.', addedCount: 0 },
          { status: 200 }
        );
      }

      const rowsToInsert = newQuestionIds.map((qId, idx) => ({
        paper_id: id,
        question_id: qId,
        sequence_order: currentOrder + idx + 1,
        section_name,
      }));

      const { error: insertErr } = await supabase
        .from('pyq_paper_questions')
        .insert(rowsToInsert);

      if (insertErr) {
        console.error('Error adding questions to paper:', insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 400 });
      }

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'pyq_paper_add_questions',
        entityType: 'pyq_paper',
        entityId: id,
        details: {
          addedCount: newQuestionIds.length,
          questionIds: newQuestionIds,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${newQuestionIds.length} question(s) successfully added to ${paper.title_en}.`,
        addedCount: newQuestionIds.length,
        skippedCount: question_ids.length - newQuestionIds.length,
      });
    }

    // ------------------------------------------------------------------------
    // METHOD B: Create a New Question & Associate with this Paper
    // ------------------------------------------------------------------------
    if (action === 'create_new') {
      const { question: rawQ, section_name = 'General' } = body;

      if (!rawQ || !rawQ.texts?.ta?.question) {
        return NextResponse.json({ error: 'Tamil question text is required.' }, { status: 400 });
      }

      const timestamp = Date.now().toString(36).toUpperCase();
      const questionId = rawQ.id || `TNPSC-PYQ-${paper.year}-${timestamp}`;
      const now = new Date().toISOString();

      // Ensure previous_year metadata is populated with paper info
      const previousYearMeta = {
        is_pyq: true,
        exam_name: paper.title_en,
        year: paper.year,
        ...(rawQ.previous_year || {}),
      };

      // Critical: New questions MUST enter Draft status
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
            action: 'pyq_paper_create',
            by_id: user.id,
            by_name: profile.full_name || 'Admin',
            timestamp: now,
          },
        ],
      };

      // Zod Validation
      const validatedData = QuestionSchema.parse({
        ...rawQ,
        id: questionId,
        previous_year: previousYearMeta,
        workflow: initialWorkflow,
        is_archived: false,
        created_by: user.id,
        created_at: now,
        updated_at: now,
      });

      // 1. Insert into Central Question Bank
      const { data: insertedQ, error: qErr } = await supabase
        .from('questions')
        .insert([validatedData])
        .select()
        .single();

      if (qErr) {
        console.error('Error inserting new question:', qErr);
        return NextResponse.json({ error: qErr.message }, { status: 400 });
      }

      // 2. Link into pyq_paper_questions
      const { error: linkErr } = await supabase
        .from('pyq_paper_questions')
        .insert([
          {
            paper_id: id,
            question_id: questionId,
            sequence_order: currentOrder + 1,
            section_name,
          },
        ]);

      if (linkErr) {
        console.error('Error linking question to paper:', linkErr);
        return NextResponse.json({ error: linkErr.message }, { status: 400 });
      }

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'pyq_paper_create_question',
        entityType: 'pyq_paper',
        entityId: id,
        details: { questionId, paperId: id },
      });

      return NextResponse.json({
        success: true,
        message: 'Question created in Draft status and linked to paper.',
        question: insertedQ,
        sequence_order: currentOrder + 1,
      });
    }

    // ------------------------------------------------------------------------
    // METHOD C: Bulk JSON / JSONL Import directly into this Paper
    // ------------------------------------------------------------------------
    if (action === 'import_json') {
      const { records, commonMapping = {}, mappingStrategy = 'fill_missing_with_common', section_name = 'General' } = body;

      if (!Array.isArray(records) || records.length === 0) {
        return NextResponse.json({ error: 'No records provided for import.' }, { status: 400 });
      }

      // Pre-fetch active exams
      const { data: dbExams } = await supabase
        .from('exams')
        .select('id')
        .eq('is_active', true);
      const availableExamIds = (dbExams || []).map((e) => e.id);

      // Force exam and previous year onto common mapping
      const enrichedCommonMapping = {
        exam_id: paper.exam_id,
        ...commonMapping,
      };

      const now = new Date().toISOString();
      const validQuestions: any[] = [];
      const invalidRecords: any[] = [];

      records.forEach((raw, idx) => {
        try {
          const normalized = normalizeQuestionRecord(
            raw,
            enrichedCommonMapping,
            mappingStrategy,
            availableExamIds
          );

          normalized.id = normalized.id || `TNPSC-PYQ-${paper.year}-${Date.now().toString(36)}-${idx + 1}`;
          normalized.previous_year = {
            is_pyq: true,
            exam_name: paper.title_en,
            year: paper.year,
            ...(normalized.previous_year || {}),
          };

          // Critical Status Rule: All imported questions enter Draft
          normalized.workflow = {
            status: 'draft',
            verification_status: 'pending',
            verified_by: null,
            verified_at: null,
            verification_comments: [],
            history: [
              {
                from_status: '',
                to_status: 'draft',
                action: 'pyq_import',
                by_id: user.id,
                by_name: profile.full_name || 'Admin',
                timestamp: now,
              },
            ],
          };

          normalized.is_archived = false;
          normalized.schema_version = '1.0.0';
          normalized.version = 1;

          const parsed = QuestionSchema.safeParse({
            ...normalized,
            created_by: user.id,
            created_at: now,
            updated_at: now,
          });

          if (parsed.success) {
            validQuestions.push(parsed.data);
          } else {
            invalidRecords.push({
              index: idx + 1,
              id: normalized.id,
              errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
            });
          }
        } catch (err: any) {
          invalidRecords.push({
            index: idx + 1,
            errors: [err.message],
          });
        }
      });

      if (validQuestions.length === 0) {
        return NextResponse.json(
          { error: 'No valid questions found to import.', invalidRecords },
          { status: 400 }
        );
      }

      // Upsert valid questions to Question Bank in chunks
      const chunkSize = 100;
      for (let i = 0; i < validQuestions.length; i += chunkSize) {
        const chunk = validQuestions.slice(i, i + chunkSize);
        const { error: upsertErr } = await supabase
          .from('questions')
          .upsert(chunk, { onConflict: 'id' });

        if (upsertErr) {
          return NextResponse.json(
            { error: `Database insert failed: ${upsertErr.message}` },
            { status: 500 }
          );
        }
      }

      // Associate with this paper
      const paperQuestionLinks = validQuestions.map((q, idx) => ({
        paper_id: id,
        question_id: q.id,
        sequence_order: currentOrder + idx + 1,
        section_name,
      }));

      const { error: linkErr } = await supabase
        .from('pyq_paper_questions')
        .upsert(paperQuestionLinks, { onConflict: 'paper_id,question_id' });

      if (linkErr) {
        console.error('Error linking imported questions to paper:', linkErr);
      }

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'pyq_paper_import_questions',
        entityType: 'pyq_paper',
        entityId: id,
        details: {
          importedCount: validQuestions.length,
          invalidCount: invalidRecords.length,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${validQuestions.length} question(s) successfully imported into Draft status and assigned to paper.`,
        importedCount: validQuestions.length,
        invalidCount: invalidRecords.length,
        invalidRecords: invalidRecords.slice(0, 50),
      });
    }

    return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
  } catch (err: any) {
    console.error('Error in POST /api/admin/pyq/[id]/questions:', err);
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
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { questionIds } = body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'No question IDs provided to remove.' }, { status: 400 });
    }

    // REMOVE ASSOCIATION ONLY:
    // Delete from pyq_paper_questions for this paper.
    // The underlying questions in public.questions remain 100% UNTOUCHED!
    const { error: delErr } = await supabase
      .from('pyq_paper_questions')
      .delete()
      .eq('paper_id', id)
      .in('question_id', questionIds);

    if (delErr) {
      console.error('Error removing questions from paper:', delErr);
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }

    // Re-index remaining questions sequence_order sequentially
    const { data: remaining } = await supabase
      .from('pyq_paper_questions')
      .select('id, sequence_order')
      .eq('paper_id', id)
      .order('sequence_order', { ascending: true });

    if (remaining && remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].sequence_order !== i + 1) {
          await supabase
            .from('pyq_paper_questions')
            .update({ sequence_order: i + 1 })
            .eq('id', remaining[i].id);
        }
      }
    }

    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'pyq_paper_remove_questions',
      entityType: 'pyq_paper',
      entityId: id,
      details: {
        removedQuestionIds: questionIds,
        count: questionIds.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${questionIds.length} question(s) removed from paper association. Original questions in Question Bank remain intact.`,
      removedCount: questionIds.length,
    });
  } catch (err: any) {
    console.error('Error removing question from paper:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
