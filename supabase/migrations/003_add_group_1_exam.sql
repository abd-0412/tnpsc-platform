-- ========================================================================
-- 003: ADD GROUP 1 TO EXAMINATIONS TABLE
-- ========================================================================

INSERT INTO public.exams (id, title_en, title_ta, description_en, description_ta, is_active, config)
VALUES (
    'group_1',
    'TNPSC Group 1 (Deputy Collector & DSP)',
    'டி.என்.பி.எஸ்.சி குரூப் 1 (துணை ஆட்சியர் & டிஎஸ்பி)',
    'Combined Civil Services Examination-I for top administrative and executive posts in Tamil Nadu.',
    'ஒருங்கிணைந்த குடிமைப் பணிகள் தேர்வு-I (துணை ஆட்சியர் & டிஎஸ்பி பதவிகள்).',
    true,
    '{"total_marks": 300, "duration_minutes": 180, "total_questions": 200, "negative_marking": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET is_active = true;

