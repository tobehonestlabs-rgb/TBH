import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'


export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { original_message_id, sender_ip } = await req.json()
    if (!original_message_id) return NextResponse.json({ error: 'Missing original_message_id' }, { status: 400 })

    // Look up sender's user_id via IP mapping
    let participant_2: string | null = null
    if (sender_ip) {
      const { data: mapping } = await supabaseAdmin
        .from('user_ip_mapping')
        .select('user_id')
        .eq('ip_address', sender_ip)
        .single()
      if (mapping?.user_id) participant_2 = mapping.user_id
    }

    // Return existing conversation or create
    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('original_message_id', original_message_id)
      .eq('participant_1', user.id)
      .single()

    if (existing) return NextResponse.json({ conversation: existing })

    const { data: created, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        participant_1: user.id,
        participant_2,
        original_message_id,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ conversation: created })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch conversations where user is participant_1 OR participant_2
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If any conversation has original_message_id, fetch those messages' content
    const convs = data ?? []
    const origIds = Array.from(new Set(convs.map((c: any) => c.original_message_id).filter(Boolean)))
    let origMap: Record<string, string> = {}
    if (origIds.length > 0) {
      const { data: msgs } = await supabaseAdmin
        .from('messages')
        .select('message_id, content')
        .in('message_id', origIds)
      if (msgs) {
        for (const m of msgs) origMap[m.message_id] = m.content ?? ''
      }
    }

    // attach original_message_content to each conversation
    const enriched = convs.map((c: any) => ({ ...c, original_message_content: origMap[c.original_message_id] ?? null }))

    return NextResponse.json({ conversations: enriched, userId: user.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
