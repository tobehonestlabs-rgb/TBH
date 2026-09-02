import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'

const SHARE_LINKS_TABLE = process.env.NEXT_PUBLIC_SUPABASE_SHARE_LINKS_TABLE || 'share_links'

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { username, birthdate, pfp, slug } = await req.json()

    if (!username?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if profile already exists — idempotent
    const { data: existing } = await supabaseAdmin
      .from('users_table')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, existing: true })
    }

    const now = new Date().toISOString()

    const { error: insertError } = await supabaseAdmin.from('users_table').insert({
      user_id: user.id,
      username: username.trim(),
      email: user.email,
      slug: slug.trim(),
      birthdate,
      pfp: pfp || null,
      created_at: now,
      active_subscription: false,
    })

    if (insertError) {
      console.error('[create-profile] insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    await supabaseAdmin.from(SHARE_LINKS_TABLE).insert({
      user_id: user.id,
      dynamic_link: `tbhonest.net/send/${slug.trim()}`,
      created_at: now,
    }).then(({ error }) => {
      if (error) console.error('[create-profile] share_links insert error:', error)
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[create-profile] unexpected:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
