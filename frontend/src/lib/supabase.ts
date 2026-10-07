import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from client environment or fallback
const getSupabaseConfig = () => {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
  const procEnv = typeof process !== 'undefined' ? process.env || {} : {};

  const url =
    metaEnv.VITE_SUPABASE_URL ||
    procEnv.VITE_SUPABASE_URL ||
    procEnv.SUPABASE_URL ||
    '';

  const anonKey =
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    procEnv.VITE_SUPABASE_ANON_KEY ||
    procEnv.SUPABASE_ANON_KEY ||
    '';

  return { url, anonKey };
};

let supabaseInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('https://'));
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const { url, anonKey } = getSupabaseConfig();
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
};
