import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or custom runtime storage
export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jdmgedjuphdtsqknlsrr.supabase.co';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_OQvnOv3ELTZVNO2JwLydaw_y-wtg1N9';

  const storedUrl = localStorage.getItem('aegis_supabase_url') || '';
  const storedKey = localStorage.getItem('aegis_supabase_key') || '';

  const url = (storedUrl || envUrl).trim();
  const key = (storedKey || envKey).trim();

  return { url, key };
}

export function saveSupabaseCredentials(url: string, key: string): void {
  localStorage.setItem('aegis_supabase_url', url.trim());
  localStorage.setItem('aegis_supabase_key', key.trim());
  initSupabaseClient();
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return (
    Boolean(url) &&
    Boolean(key) &&
    !url.includes('your-project-ref') &&
    !url.includes('your-supabase-project') &&
    url.startsWith('https://')
  );
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  
  if (!url || !key || url.includes('your-project-ref') || url.includes('your-supabase-project') || !url.startsWith('https://')) {
    supabaseInstance = null;
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.warn('[Supabase] Failed to initialize client:', error);
    supabaseInstance = null;
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    return initSupabaseClient();
  }
  return supabaseInstance;
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials missing or invalid URL format. Please provide a valid https:// project URL and anon key.'
    };
  }

  try {
    const { data, error } = await client.from('nodes').select('id').limit(1);
    if (error) {
      const { error: authError } = await client.auth.getSession();
      if (authError) {
        return { success: false, message: `Auth connection error: ${authError.message}` };
      }
      return {
        success: true,
        message: 'Connected to Supabase Auth! (Note: "nodes" table not found yet. Execute supabase_schema.sql to create tables).'
      };
    }
    return {
      success: true,
      message: `Successfully connected to Supabase Database! Found ${data ? data.length : 0} nodes table sample.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err?.message || 'Unknown network error'}`
    };
  }
}
