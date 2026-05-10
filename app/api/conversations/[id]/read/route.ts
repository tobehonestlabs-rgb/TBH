import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'


export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false })

    // Mark all messages NOT sent by this user as read
    await supabaseAdmin
      .from('conversation_messages')
      .update({ is_read: true })
      .eq('conversation_id', params.id)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
