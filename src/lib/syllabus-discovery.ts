import { SupabaseClient } from '@supabase/supabase-js';

export interface NodeAncestry {
  targetNodeId: string;
  targetLevel: 'class' | 'subject' | 'term' | 'unit' | 'lesson' | 'chapter' | 'topic' | 'unknown';
  lessonId?: string | null;
  unitId?: string | null;
  termId?: string | null;
  classId?: string | null;
}

/**
 * Resolves the hierarchical ancestry of any syllabus node by climbing parent_id relationships.
 */
export async function resolveSyllabusAncestry(
  supabase: SupabaseClient,
  nodeId: string
): Promise<NodeAncestry> {
  const ancestry: NodeAncestry = {
    targetNodeId: nodeId,
    targetLevel: 'unknown',
  };

  if (!nodeId) return ancestry;

  try {
    const { data: node } = await supabase
      .from('syllabus_nodes')
      .select('id, level, parent_id')
      .eq('id', nodeId)
      .single();

    if (!node) {
      // Fallback for short-codes or pattern matches (e.g. std-6-t1-i1-l1)
      ancestry.targetLevel = 'lesson';
      ancestry.lessonId = nodeId;
      return ancestry;
    }

    ancestry.targetLevel = node.level as any;

    if (node.level === 'lesson') {
      ancestry.lessonId = node.id;
      if (node.parent_id) {
        ancestry.unitId = node.parent_id;
        const { data: parentUnit } = await supabase
          .from('syllabus_nodes')
          .select('id, level, parent_id')
          .eq('id', node.parent_id)
          .single();
        if (parentUnit?.parent_id) {
          ancestry.termId = parentUnit.parent_id;
          const { data: parentTerm } = await supabase
            .from('syllabus_nodes')
            .select('id, level, parent_id')
            .eq('id', parentUnit.parent_id)
            .single();
          if (parentTerm?.parent_id) {
            ancestry.classId = parentTerm.parent_id;
          }
        }
      }
    } else if (node.level === 'unit') {
      ancestry.unitId = node.id;
      if (node.parent_id) {
        ancestry.termId = node.parent_id;
        const { data: parentTerm } = await supabase
          .from('syllabus_nodes')
          .select('id, level, parent_id')
          .eq('id', node.parent_id)
          .single();
        if (parentTerm?.parent_id) {
          ancestry.classId = parentTerm.parent_id;
        }
      }
    } else if (node.level === 'term') {
      ancestry.termId = node.id;
      if (node.parent_id) {
        ancestry.classId = node.parent_id;
      }
    } else if (node.level === 'class') {
      ancestry.classId = node.id;
    }
  } catch (err) {
    console.error('Error resolving syllabus ancestry for:', nodeId, err);
  }

  return ancestry;
}

/**
 * Builds an OR clause for Supabase queries to discover questions mapped directly
 * or via broad scope (all_lessons, all_iyals, all_terms).
 */
export function buildSyllabusDiscoveryFilter(ancestry: NodeAncestry): string {
  const clauses: string[] = [];
  const { targetNodeId, lessonId, unitId, termId, classId } = ancestry;

  // 1. Direct match on any standard syllabus ID slot
  clauses.push(`syllabus->>lesson_id.eq.${targetNodeId}`);
  clauses.push(`syllabus->>unit_id.eq.${targetNodeId}`);
  clauses.push(`syllabus->>term_id.eq.${targetNodeId}`);
  clauses.push(`syllabus->>class_id.eq.${targetNodeId}`);

  // 2. If target is a lesson: include questions with lesson_scope='all' in the same unit
  if (unitId) {
    clauses.push(`and(syllabus->>unit_id.eq.${unitId},syllabus->>lesson_scope.eq.all)`);
  }

  // 3. If target is a unit or lesson: include questions with unit_scope='all' in the same term
  if (termId) {
    clauses.push(`and(syllabus->>term_id.eq.${termId},syllabus->>unit_scope.eq.all)`);
  }

  // 4. If target is a term, unit, or lesson: include questions with term_scope='all' in the same class
  if (classId) {
    clauses.push(`and(syllabus->>class_id.eq.${classId},syllabus->>term_scope.eq.all)`);
  }

  return clauses.join(',');
}

