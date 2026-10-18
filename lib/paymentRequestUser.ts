import { createClient, User } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export async function getPaymentRequestUser(request: NextRequest): Promise<User | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!token || !supabaseUrl || !anonKey) return null

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await supabase.auth.getUser(token)
  return error ? null : data.user
}