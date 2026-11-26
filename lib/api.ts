import { supabaseClient as supabase } from '@/lib/supabaseClient'

/**
 * Wrapper around fetch that automatically adds the user's JWT token.
 * Use this for all calls to your /api routes.
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('No active session. Please log in.')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${session.access_token}`)

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
