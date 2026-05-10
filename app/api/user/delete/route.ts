import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(_req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })

    // Delete profile row first (before auth user is gone)
    const { error: profileError } = await supabaseAdmin
      .from('users_table')
      .delete()
      .eq('user_id', user.id)
    if (profileError) console.error('[delete-account] users_table delete failed:', profileError)

    // Delete auth user — this is the source of truth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (authError) return NextResponse.json({ ok: false, error: authError.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
