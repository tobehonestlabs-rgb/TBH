import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const convId = params.id
    if (!convId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Ensure the user is a participant
    const { data: conv, error: convErr } = await supabaseAdmin
      .from('conversations')
      .select('id, participant_1, participant_2')
      .eq('id', convId)
      .single()

    if (convErr || !conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    if (conv.participant_1 !== user.id && conv.participant_2 !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete messages in conversation_messages
    await supabaseAdmin
      .from('conversation_messages')
      .delete()
      .eq('conversation_id', convId)

    // Delete conversation
    await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', convId)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
