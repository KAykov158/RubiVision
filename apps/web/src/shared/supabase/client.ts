import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database/database.types';

// Unit tests must never inherit a developer's .env.local and contact a hosted project.
const testMode = import.meta.env.MODE === 'test';
const supabaseUrl = testMode ? undefined : import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = testMode ? undefined : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

function isSafePublicConfiguration(url: string | undefined, key: string | undefined) {
  if (!url || !key || key.startsWith('sb_secret_')) return false;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== '127.0.0.1' && parsedUrl.hostname !== 'localhost') return false;
    const jwtPayload = key.split('.')[1];
    if (jwtPayload) {
      const payload = JSON.parse(atob(jwtPayload.replace(/-/g, '+').replace(/_/g, '/'))) as { role?: unknown };
      if (payload.role === 'service_role') return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = isSafePublicConfiguration(supabaseUrl, supabasePublishableKey);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
