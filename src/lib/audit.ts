import { SupabaseClient } from '@supabase/supabase-js';

export interface AuditLogEntry {
  userId?: string | null;
  action: string;
  entityType: 'question' | 'test_template' | 'syllabus' | 'user' | 'import_batch';
  entityId: string;
  details?: Record<string, any>;
}

export async function logAuditEvent(
  supabase: SupabaseClient,
  entry: AuditLogEntry
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert([
      {
        user_id: entry.userId || null,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        details: entry.details || {},
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error('Failed to log audit event:', err);
    // Don't crash main operation if audit logging has an issue
  }
}

export async function logBulkAuditEvents(
  supabase: SupabaseClient,
  entries: AuditLogEntry[]
): Promise<void> {
  if (!entries || entries.length === 0) return;
  try {
    const payload = entries.map((entry) => ({
      user_id: entry.userId || null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      details: entry.details || {},
      created_at: new Date().toISOString(),
    }));
    await supabase.from('audit_logs').insert(payload);
  } catch (err) {
    console.error('Failed to log bulk audit events:', err);
  }
}
