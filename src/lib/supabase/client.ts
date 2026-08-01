import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

let browserClient: SupabaseClient<Database> | undefined;
const REQUEST_TIMEOUT_MS = 20_000;

const fetchWithTimeout: typeof fetch = (input, init) => {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;
  return fetch(input, { ...init, signal });
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getSupabase(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const publishableKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error('Supabase não configurado. Verifique as variáveis públicas do ambiente.');
  }

  browserClient = createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: { 'x-application-name': 'personalops-web' },
      fetch: fetchWithTimeout,
    },
  });

  return browserClient;
}
