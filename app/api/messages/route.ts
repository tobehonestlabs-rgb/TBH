import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const BUCKET = process.env.SUPABASE_BUCKET || 'images'
// This should match SupabaseKeys.messageTable in your Kotlin app
const TABLE = process.env.SUPABASE_TABLE || 'messages'
// Table where you resolve slug -> user id (equivalent of getUserID(receiver_slug))
const USERS_TABLE = process.env.SUPABASE_USERS_TABLE || 'users_table'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const slug = formData.get('slug')
    const message = formData.get('message')
    const image = formData.get('image') as File | null

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // 1) Look up receiverId from slug, like getUserID(receiver_slug) in Kotlin
    const { data: user, error: userError } = await supabaseAdmin
      .from(USERS_TABLE)
      .select('user_id')
      .eq('slug', slug)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found for this username' }, { status: 404 })
    }

    const receiverId = user.user_id as string

    // 2) Optional image upload to Supabase Storage
    let imageUrl: string | null = null

    if (image && image.size > 0) {
      const extension = image.name?.split('.').pop() || 'jpg'
      const filePath = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filePath, image, {
          contentType: image.type || 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json({ error: 'Upload failed', details: uploadError.message }, { status: 500 })
      }

      const { data: publicUrl } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)
      imageUrl = publicUrl.publicUrl
    }

    // 3) Insert into the same message table schema as your Kotlin client
    const messageId = randomUUID().slice(0, 12)
    const createdAt = new Date().toISOString()

    const { error: insertError } = await supabaseAdmin
      .from(TABLE)
      .insert({
        to_user: receiverId,
        type: 'text_message',
        from_user: "b4dd65ed-2282-45b4-bb5f-299a9767e3d5", // anonymous sender from web; adjust if you want a specific id
        content: imageUrl!= null ? "[IMAGE]" +"("+imageUrl+")\n"+ message : message,
        media_url: imageUrl ?? '',
        message_id: messageId,
        created_at: createdAt,
      })




    if (insertError) {
      return NextResponse.json({ error: 'Database insert failed', details: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Unexpected error', details: error?.message }, { status: 500 })
  }
}

