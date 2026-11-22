import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user from header or cookies
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    let user: any = null

    if (token) {
      const tokenClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      )
      const { data: userData } = await tokenClient.auth.getUser()
      user = userData?.user
    }

    if (!user) {
      const supabase = getServerSupabase()
      const { data: userData } = await supabase.auth.getUser()
      user = userData?.user
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { target_slug, target_user_id, draft_message } = body

    // 2. Check if user already exists in users_table
    const { data: existingUser } = await supabaseAdmin
      .from('users_table')
      .select('user_id, is_profile_complete, username')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existingUser) {
      const now = new Date().toISOString()
      // Insert Ghost user row
      const { error: insertError } = await supabaseAdmin.from('users_table').insert({
        user_id: user.id,
        email: user.email,
        is_profile_complete: false,
        username: null,
        slug: null,
        pfp: null,
        created_at: now,
        active_subscription: false,
      })

      if (insertError) {
        console.warn('[ghost-api] insert with null values failed, falling back to empty username/slug:', insertError.message)
        await supabaseAdmin.from('users_table').insert({
          user_id: user.id,
          email: user.email,
          is_profile_complete: false,
          username: '',
          slug: `ghost_${user.id.slice(0, 8)}`,
          pfp: null,
          created_at: now,
          active_subscription: false,
        })
      }
    }

    // 3. Resolve target user id
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

    // 4. Create or retrieve conversation
    let conversationId: string | null = null

    if (resolvedTargetId && resolvedTargetId !== user.id) {
      const { data: existingConv } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${resolvedTargetId},participant_2.eq.${user.id}),and(participant_1.eq.${user.id},participant_2.eq.${resolvedTargetId})`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()

      if (existingConv) {
        conversationId = existingConv.id
      } else {
        const { data: newConv } = await supabaseAdmin
          .from('conversations')
          .insert({
            participant_1: resolvedTargetId,
            participant_2: user.id,
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (newConv) {
          conversationId = newConv.id
        }
      }

      // 5. Send draft message if present
      if (conversationId && draft_message?.trim()) {
        const trimmed = draft_message.trim()
        await supabaseAdmin.from('conversation_messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: trimmed,
        })
        await supabaseAdmin.from('conversations').update({
          last_message: trimmed,
          last_message_at: new Date().toISOString(),
        }).eq('id', conversationId)
      }
    }

    return NextResponse.json({ ok: true, conversation_id: conversationId })
  } catch (err: any) {
    console.error('[ghost-api] error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
