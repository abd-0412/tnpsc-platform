/**
 * Utility to reliably fetch questions by an array of IDs in chunks.
 * PostgREST limits URL query parameter lengths, so querying .in('id', array)
 * with hundreds or thousands of IDs fails with 400 Bad Request / URI Too Long.
 * Chunking in batches of 100 guarantees safety for any test size (e.g. 100 to 2000+ Qs).
 */
export async function fetchQuestionsByIds(
  supabase: any,
  ids: string[],
  selectColumns: string = '*'
): Promise<any[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const CHUNK_SIZE = 100;
  const results: any[] = [];

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const { data, error } = await supabase
      .from('questions')
      .select(selectColumns)
      .in('id', chunk);

    if (error) {
      console.error('Error in fetchQuestionsByIds chunk:', error);
      throw error;
    }

    if (data) {
      results.push(...data);
    }
  }

  // Preserve the caller's requested order
  const qMap = new Map(results.map((q) => [q.id, q]));
  return ids.map((id) => qMap.get(id)).filter(Boolean);
}
