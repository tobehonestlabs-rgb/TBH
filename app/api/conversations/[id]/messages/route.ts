import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createClient } from '@supabase/supabase-js'
import { extractPhotoUrls } from '@/lib/chatImages'

// --------------------------------------------------------------------
// GET : Récupère les messages d'une conversation
// --------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Extraire le token du header Authorization
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 })
    }

    // 2. Créer un client Supabase avec ce token pour vérifier l'utilisateur
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: invalid token' }, { status: 401 })
    }

    // 3. Récupérer les messages (avec supabaseAdmin)
    const { data, error } = await supabaseAdmin
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const messages = (data ?? []).map((msg: any) => {
      const parsedPhotos = extractPhotoUrls(msg.photos, msg.image_url)
      return {
        ...msg,
        photos: parsedPhotos,
        image_url: msg.image_url || (parsedPhotos.length > 0 ? parsedPhotos[0] : null),
      }
    })

    return NextResponse.json({ messages })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// --------------------------------------------------------------------
// POST : Envoie un nouveau message (texte, GIF, image, photos)
// --------------------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: invalid token' }, { status: 401 })
    }

    const { content, gif_url, image_url, photos, reply_to_id, reply_to_content } = await req.json()

    const extractedPhotos = extractPhotoUrls(photos, image_url)
    const hasText = content?.trim()?.length > 0
    const hasGif = !!gif_url
    const hasPhotos = extractedPhotos.length > 0

    if (!hasText && !hasGif && !hasPhotos) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }

    const insertData: Record<string, any> = {
      conversation_id: id,
      sender_id: user.id,
      content: content?.trim() || '',
    }

    if (reply_to_id) insertData.reply_to_id = reply_to_id
    if (reply_to_content) insertData.reply_to_content = reply_to_content
    if (hasGif) insertData.gif_url = gif_url
    if (hasPhotos) {
      insertData.photos = extractedPhotos
      insertData.image_url = extractedPhotos[0]
    }

    const { data, error } = await supabaseAdmin
      .from('conversation_messages')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mettre à jour la conversation
    let lastMessageText = 'Photo'
    if (hasText) lastMessageText = content.trim()
    else if (hasGif) lastMessageText = 'GIF'
    else if (hasPhotos) lastMessageText = 'Photo'

    await supabaseAdmin
      .from('conversations')
      .update({
        last_message: lastMessageText,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', id)

    const parsedPhotos = extractPhotoUrls(data?.photos, data?.image_url)
    const normalizedMessage = data ? {
      ...data,
      photos: parsedPhotos,
      image_url: data.image_url || (parsedPhotos.length > 0 ? parsedPhotos[0] : null),
    } : data

    return NextResponse.json({ message: normalizedMessage })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}