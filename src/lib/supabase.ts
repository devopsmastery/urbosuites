/**
 * src/lib/supabase.ts
 * ─────────────────────────────────────────────────────────────
 * Two Supabase clients:
 *
 *  • supabaseAnon   — public-safe client (anon key).
 *    Use in: API routes that read blocked_dates or suite listings.
 *    RLS policies enforced — guests see only what's public.
 *
 *  • supabaseAdmin  — service-role client (bypasses RLS).
 *    Use in: Astro Actions (createInquiry), ICS sync cron,
 *    n8n webhook handler, Beds24 sync.
 *    NEVER expose this client to the browser.
 *
 * Beds24 integration: when BEDS24_API_KEY is added to .env,
 * import the Beds24 client from ./beds24.ts (created in Phase 8).
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

// ── Validate required env vars ────────────────────────────────
const supabaseUrl = import.meta.env.SUPABASE_URL;
const anonKey     = import.meta.env.SUPABASE_ANON_KEY;
const serviceKey  = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl)  throw new Error('[Supabase] SUPABASE_URL is not set in .env');
if (!anonKey)      throw new Error('[Supabase] SUPABASE_ANON_KEY is not set in .env');
if (!serviceKey)   throw new Error('[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set in .env');

// ── Public client (safe for edge functions / browser islands) ─
export const supabaseAnon = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// ── Admin client (server-only — bypasses RLS) ─────────────────
export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// ── Type aliases (will expand once Supabase types are generated) ─
export type SupabaseClient = typeof supabaseAnon;

// ── Convenience: fetch blocked date ranges for a given suite ──
export async function getBlockedDates(suiteSlug: string) {
  const { data, error } = await supabaseAnon
    .from('blocked_dates')
    .select('start_date, end_date, is_soft')
    .eq('suite_id',
      // Sub-select: resolve slug → UUID
      supabaseAnon
        .from('suites')
        .select('id')
        .eq('slug', suiteSlug)
        .single()
    );

  if (error) throw error;
  return data ?? [];
}
