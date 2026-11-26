import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'
import { createClient } from '@supabase/supabase-js'

async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    const tokenClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    const { data: userData } = await tokenClient.auth.getUser()
    if (userData?.user) return userData.user
  }

  const supabase = getServerSupabase()
  const { data: userData } = await supabase.auth.getUser()
  return userData?.user ?? null
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { original_message_id, sender_ip, target_user_id, target_slug } = body

    // 1. Direct conversation initiation via target_user_id or target_slug
    let resolvedTargetId = target_user_id as string | undefined
    if (!resolvedTargetId && target_slug) {
      const { data: targetProfile } = await supabaseAdmin
        .from('users_table')
        .select('user_id')
        .eq('slug', (target_slug as string).trim())
        .maybeSingle()
      if (targetProfile?.user_id) {
        resolvedTargetId = targetProfile.user_id
      }
    }

    if (resolvedTargetId) {
      if (resolvedTargetId === user.id) {
        return NextResponse.json({ error: 'Cannot start conversation with yourself' }, { status: 400 })
      }

      // Check if conversation already exists between the two users
      const { data: existing } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${resolvedTargetId},participant_2.eq.${user.id}),and(participant_1.eq.${user.id},participant_2.eq.${resolvedTargetId})`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ conversation: existing })
      }

      // Create new conversation
      const { data: created, error: createError } = await supabaseAdmin
        .from('conversations')
        .insert({
          participant_1: resolvedTargetId,
          participant_2: user.id,
          original_message_id: original_message_id || null,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
      return NextResponse.json({ conversation: created })
    }

    // 2. Legacy / Anonymous message flow via original_message_id
    if (!original_message_id) return NextResponse.json({ error: 'Missing target_user_id, target_slug, or original_message_id' }, { status: 400 })

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

    // Fetch original message content if available
    let original_message_content: string | null = null
    if (original_message_id) {
      const { data: origMsg } = await supabaseAdmin
        .from('messages')
        .select('content')
        .eq('message_id', original_message_id)
        .single()
      if (origMsg) original_message_content = origMsg.content ?? null
    }

    // Check if conversation already exists
    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('original_message_id', original_message_id)
      .eq('participant_1', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        conversation: {
          ...existing,
          original_message_content: original_message_content || (existing as any).original_message_content || null,
        },
      })
    }

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
    return NextResponse.json({
      conversation: {
        ...created,
        original_message_content,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch conversations where user is participant_1 OR participant_2
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const convs = data ?? []

    // If any conversation has original_message_id, fetch those messages' content
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

    // Fetch the other participant's profile details
    const otherUserIds = Array.from(new Set(
      convs
        .map((c: any) => (c.participant_1 === user.id ? c.participant_2 : c.participant_1))
        .filter(Boolean)
    ))

    let userMap: Record<string, { username: string | null; pfp: string | null; slug: string | null }> = {}
    if (otherUserIds.length > 0) {
      const { data: otherProfiles } = await supabaseAdmin
        .from('users_table')
        .select('user_id, username, pfp, slug')
        .in('user_id', otherUserIds)

      if (otherProfiles) {
        for (const p of otherProfiles) {
          userMap[p.user_id] = {
            username: p.username ?? null,
            pfp: p.pfp ?? null,
            slug: p.slug ?? null,
          }
        }
      }
    }

    // Fetch the last message sender for each conversation to identify who sent the last message
    let lastSenderMap: Record<string, string> = {}
    if (convs.length > 0) {
      const convIds = convs.map((c: any) => c.id)
      const { data: lastMsgs } = await supabaseAdmin
        .from('conversation_messages')
        .select('conversation_id, sender_id, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false })

      if (lastMsgs) {
        for (const m of lastMsgs) {
          if (!lastSenderMap[m.conversation_id]) {
            lastSenderMap[m.conversation_id] = m.sender_id
          }
        }
      }
    }

    // enrich each conversation
    const enriched = convs.map((c: any) => {
      const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1
      return {
        ...c,
        original_message_content: origMap[c.original_message_id] ?? null,
        last_sender_id: lastSenderMap[c.id] ?? null,
        other_user: otherId ? (userMap[otherId] ?? null) : null,
      }
    })

    return NextResponse.json({ conversations: enriched, userId: user.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
