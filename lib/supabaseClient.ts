import { createBrowserClient } from '@supabase/ssr'

export const supabaseClient = createBrowserClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim(),
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim(),
  {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)
