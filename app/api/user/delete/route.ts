import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'

const MESSAGES_TABLE = process.env.NEXT_PUBLIC_SUPABASE_MESSAGE_TABLE || 'messages'
const USERS_TABLE = process.env.NEXT_PUBLIC_SUPABASE_USERS_TABLE || 'users_table'
const MESSAGE_IMAGES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'images'
const AVATARS_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET || 'avatars'

type CleanupError = {
  step: string
  message: string
  code?: string
}

type SupabaseLikeError = {
  message: string
  code?: string
}

function storagePathFromPublicUrl(url: string | null, bucket: string) {
  if (!url) return null

  const marker = `/storage/v1/object/public/${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null

  return decodeURIComponent(url.slice(index + marker.length))
}

async function deleteStep(
  step: string,
  query: PromiseLike<{ error: SupabaseLikeError | null }>,
  errors: CleanupError[],
  options: { optional?: boolean } = {}
) {
  const { error } = await query
  if (error) {
    if (options.optional && (error.code === '42P01' || error.code === '42703')) {
      console.warn('[delete-account] skipped optional cleanup:', { step, error })
      return
    }

    errors.push({ step, message: error.message, code: error.code })
  }
}

async function removeStorageFiles(bucket: string, paths: Array<string | null>, errors: CleanupError[]) {
  const uniquePaths = Array.from(new Set(paths.filter((path): path is string => Boolean(path))))
  if (uniquePaths.length === 0) return

  const { error } = await supabaseAdmin.storage.from(bucket).remove(uniquePaths)
  if (error) {
    console.warn('[delete-account] storage cleanup skipped:', { bucket, paths: uniquePaths, error })
  }
}

async function removeStoragePrefix(bucket: string, prefix: string, errors: CleanupError[]) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).list(prefix)
  if (error) {
    console.warn('[delete-account] storage prefix cleanup skipped:', { bucket, prefix, error })
    return
  }

  const paths = (data ?? [])
    .filter(item => item.name)
    .map(item => `${prefix}/${item.name}`)

  await removeStorageFiles(bucket, paths, errors)
}

export async function POST(_req: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    }

    const errors: CleanupError[] = []

    const { data: profile, error: profileReadError } = await supabaseAdmin
      .from(USERS_TABLE)
      .select('slug, pfp')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileReadError) {
      return NextResponse.json({ ok: false, error: profileReadError.message }, { status: 500 })
    }

    const slug = typeof profile?.slug === 'string' ? profile.slug : null
    const avatarPath = storagePathFromPublicUrl(
      typeof profile?.pfp === 'string' ? profile.pfp : null,
      AVATARS_BUCKET
    )

    const { data: conversations, error: conversationsReadError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)

    if (conversationsReadError) {
      if (conversationsReadError.code === '42P01' || conversationsReadError.code === '42703') {
        console.warn('[delete-account] skipped optional conversations lookup:', conversationsReadError)
      } else {
        errors.push({
          step: 'read conversations',
          message: conversationsReadError.message,
          code: conversationsReadError.code,
        })
      }
    }

    const conversationIds = (conversations ?? [])
      .map((conversation: { id: string | null }) => conversation.id)
      .filter((id): id is string => Boolean(id))

    if (conversationIds.length > 0) {
      await deleteStep(
        'conversation_messages by conversation',
        supabaseAdmin.from('conversation_messages').delete().in('conversation_id', conversationIds),
        errors,
        { optional: true }
      )
      await deleteStep(
        'conversations',
        supabaseAdmin.from('conversations').delete().in('id', conversationIds),
        errors,
        { optional: true }
      )
    }

    await deleteStep(
      'conversation_messages by sender',
      supabaseAdmin.from('conversation_messages').delete().eq('sender_id', user.id),
      errors,
      { optional: true }
    )
    await deleteStep(
      'messages to user',
      supabaseAdmin.from(MESSAGES_TABLE).delete().eq('to_user', user.id),
      errors
    )
    await deleteStep(
      'messages from user',
      supabaseAdmin.from(MESSAGES_TABLE).delete().eq('from_user', user.id),
      errors
    )
    await deleteStep(
      'links',
      supabaseAdmin.from('links').delete().eq('user_id', user.id),
      errors
    )
    await deleteStep(
      'user_ip_mapping',
      supabaseAdmin.from('user_ip_mapping').delete().eq('user_id', user.id),
      errors,
      { optional: true }
    )

    if (slug) {
      await removeStoragePrefix(MESSAGE_IMAGES_BUCKET, slug, errors)
    }
    await removeStorageFiles(
      AVATARS_BUCKET,
      [avatarPath],
      errors
    )

    await deleteStep(
      USERS_TABLE,
      supabaseAdmin.from(USERS_TABLE).delete().eq('user_id', user.id),
      errors
    )

    if (errors.length > 0) {
      console.error('[delete-account] cleanup failed:', errors)
      return NextResponse.json(
        { ok: false, error: 'Account cleanup failed', details: errors },
        { status: 500 }
      )
    }

    // Delete auth user last so DB cleanup can still identify ownership by user.id.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (authError) {
      return NextResponse.json({ ok: false, error: authError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
