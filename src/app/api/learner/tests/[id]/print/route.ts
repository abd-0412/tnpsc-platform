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

    // 1. Check if ID is a test attempt
    const { data: attempt } = await supabase
      .from('test_attempts')
      .select('*, exams(id, title_en, title_ta)')
      .eq('id', id)
      .single();

    if (attempt) {
      // Fetch attempt items
      const { data: items } = await supabase
        .from('test_attempt_items')
        .select('*')
        .eq('attempt_id', id)
        .order('question_order', { ascending: true });

      const formattedQuestions = (items || []).map((item) => {
        const snap = item.question_snapshot || {};
        const texts = snap.texts || {};
        const ta = texts.ta || {};
        const en = texts.en || {};

        const optTa = Array.isArray(ta.options)
          ? ta.options
          : Object.entries(ta.options || {}).map(([k, v]) => ({ id: k, text: String(v) }));

        const optEn = Array.isArray(en.options)
          ? en.options
          : Object.entries(en.options || {}).map(([k, v]) => ({ id: k, text: String(v) }));

        return {
          order: item.question_order,
          id: item.question_id,
          question_ta: ta.question || ta.blocks?.[0]?.content || '',
          question_en: en.question || en.blocks?.[0]?.content || '',
          options_ta: optTa,
          options_en: optEn,
          subject: snap.syllabus?.subject_id || 'general',
        };
      });

      return NextResponse.json({
        id: attempt.id,
        attempt_id: attempt.id,
        template_id: attempt.test_template_id,
        title_ta: attempt.title_ta || 'டி.என்.பி.எஸ்.சி மாதிரித் தேர்வு',
        title_en: attempt.title_en || 'TNPSC Mock Examination',
        duration_minutes: attempt.duration_minutes || 180,
        total_questions: attempt.total_questions || formattedQuestions.length,
        total_marks: attempt.total_questions ? attempt.total_questions * 1.5 : 300,
        exam_title_ta: attempt.exams?.title_ta || 'ஒருங்கிணைந்த குடிமைப் பணிகள் தேர்வு (குரூப்-4)',
        exam_title_en: attempt.exams?.title_en || 'Combined Civil Services Examination (Group 4)',
        questions: formattedQuestions,
      });
    }

    // 2. Otherwise, check if ID is a test template
    const { data: template } = await supabase
      .from('test_templates')
      .select('*, exams(id, title_en, title_ta)')
      .eq('id', id)
      .single();

    if (!template) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Fetch questions in template question_ids
    const questionIds: string[] = template.question_ids || [];
    let questionsList: any[] = [];

    if (questionIds.length > 0) {
      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds);

      // Preserve template order
      const qMap = new Map((qData || []).map((q) => [q.id, q]));
      questionsList = questionIds
        .map((qid) => qMap.get(qid))
        .filter(Boolean);
    } else {
      // If template has no explicit question IDs, fallback to published sample questions
      const { data: fallbackQ } = await supabase
        .from('questions')
        .select('*')
        .eq('is_archived', false)
        .limit(template.question_count || 50);
      questionsList = fallbackQ || [];
    }

    const formattedQuestions = questionsList.map((q, idx) => {
      const texts = q.texts || {};
      const ta = texts.ta || {};
      const en = texts.en || {};

      const optTa = Array.isArray(ta.options)
        ? ta.options
        : Object.entries(ta.options || {}).map(([k, v]) => ({ id: k, text: String(v) }));

      const optEn = Array.isArray(en.options)
        ? en.options
        : Object.entries(en.options || {}).map(([k, v]) => ({ id: k, text: String(v) }));

      return {
        order: idx + 1,
        id: q.id,
        question_ta: ta.question || ta.blocks?.[0]?.content || '',
        question_en: en.question || en.blocks?.[0]?.content || '',
        options_ta: optTa,
        options_en: optEn,
        subject: q.syllabus?.subject_id || 'general',
      };
    });

    return NextResponse.json({
      id: template.id,
      template_id: template.id,
      title_ta: template.title_ta,
      title_en: template.title_en,
      duration_minutes: template.duration_minutes || 180,
      total_questions: template.question_count || formattedQuestions.length,
      total_marks: template.total_marks || (formattedQuestions.length * 1.5),
      exam_title_ta: template.exams?.title_ta || 'ஒருங்கிணைந்த குடிமைப் பணிகள் தேர்வு (குரூப்-4)',
      exam_title_en: template.exams?.title_en || 'Combined Civil Services Examination (Group 4)',
      questions: formattedQuestions,
    });
  } catch (err: any) {
    console.error('Print route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

