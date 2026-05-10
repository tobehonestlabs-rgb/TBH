import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

const TABLE = process.env.NEXT_PUBLIC_SUPABASE_MESSAGE_TABLE || 'messages'

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message_id } = await req.json()
    if (!message_id) return NextResponse.json({ error: 'Missing message_id' }, { status: 400 })

    // Use admin client to bypass RLS
    await supabaseAdmin.from(TABLE).update({ isOpened: true }).eq('message_id', message_id).eq('to_user', user.id)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
