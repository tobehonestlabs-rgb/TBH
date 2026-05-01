import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'images'
const TABLE = process.env.NEXT_PUBLIC_SUPABASE_TABLE || 'messages'
const USERS_TABLE = process.env.NEXT_PUBLIC_SUPABASE_USERS_TABLE || 'users_table'

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).slice(2, 8)
  const log = (...args: any[]) => console.log(`[messages ${reqId}]`, ...args)
  const logErr = (...args: any[]) => console.error(`[messages ${reqId}]`, ...args)

  try {
    const formData = await req.formData()
    const slug = formData.get('slug')
    const message = formData.get('message')
    const image = formData.get('image') as File | null

    log('start', { slug, hasImage: !!image, imageSize: image?.size, msgLen: typeof message === 'string' ? message.length : 0 })

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Extract IP server-side from headers
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      null

    // 1) Look up receiverId from slug
    const { data: user, error: userError } = await supabaseAdmin
      .from(USERS_TABLE)
      .select('user_id')
      .eq('slug', slug)
      .single()

    if (userError || !user) {
      logErr('user lookup failed', { slug, userError })
      return NextResponse.json({ error: 'User not found for this username', details: userError?.message }, { status: 404 })
    }

    const receiverId = user.user_id as string

    // 2) Optional image upload
    let imageUrl: string | null = null

    if (image && image.size > 0) {
      const extension = image.name?.split('.').pop() || 'jpg'
      const filePath = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

      log('uploading image', { filePath, size: image.size, type: image.type })
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filePath, image, {
          contentType: image.type || 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        logErr('upload failed', uploadError)
        return NextResponse.json({ error: 'Upload failed', details: uploadError.message }, { status: 500 })
      }

      const { data: publicUrl } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)
      imageUrl = publicUrl.publicUrl
    }

    // 3) Insert with ip_address
    const messageId = randomUUID().slice(0, 12)
    const createdAt = new Date().toISOString()

    const { error: insertError } = await supabaseAdmin
      .from(TABLE)
      .insert({
        to_user: receiverId,
        type: 'text_message',
        from_user: null,
        content: imageUrl != null ? '[IMAGE](' + imageUrl + ')\n' + message : message,
        media_url: imageUrl ?? '',
        message_id: messageId,
        created_at: createdAt,
        ip_address: ipAddress,
      })

    if (insertError) {
      console.error('[messages] insert error:', insertError)
      return NextResponse.json({ error: 'Database insert failed', details: insertError.message }, { status: 500 })
    }

    log('ok', { messageId })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    logErr('unexpected', error?.stack || error)
    return NextResponse.json({ error: 'Unexpected error', details: error?.message }, { status: 500 })
  }
}