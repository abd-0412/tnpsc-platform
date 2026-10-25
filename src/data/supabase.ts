import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Supabase URL or Anon Key is missing. Check your .env.local file.');
  }
}

/**
 * Client-side Supabase client (uses publishable anon key).
 * Protected by Row Level Security (RLS) on all tables.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
