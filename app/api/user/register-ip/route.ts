import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false })

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      null

    if (!ip) return NextResponse.json({ ok: false })

    // Get username for reference
    const { data: profile } = await supabaseAdmin
      .from('users_table').select('username').eq('user_id', user.id).single()

    await supabaseAdmin
      .from('user_ip_mapping')
      .upsert({ user_id: user.id, ip_address: ip, username: profile?.username ?? null }, { onConflict: 'user_id' })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
