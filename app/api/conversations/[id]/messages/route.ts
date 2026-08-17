import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createClient } from '@supabase/supabase-js'

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
    const token = authHeader?.split(' ')[1] // "Bearer <token>"

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

    // 3. Récupérer les messages (avec supabaseAdmin qui a les droits)
    const { data, error } = await supabaseAdmin
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data ?? [] })
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

    const { content, gif_url, image_url, photos } = await req.json()

    const hasText = content?.trim()?.length > 0
    const hasGif = !!gif_url
    const hasImageUrl = !!image_url
    const hasPhotos = photos && Array.isArray(photos) && photos.length > 0

    if (!hasText && !hasGif && !hasImageUrl && !hasPhotos) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }

    const insertData: Record<string, any> = {
      conversation_id: id,
      sender_id: user.id,
      content: content?.trim() || '',
    }

    if (hasGif) insertData.gif_url = gif_url
    if (hasPhotos) insertData.photos = photos
    else if (hasImageUrl) insertData.image_url = image_url

    const { data, error } = await supabaseAdmin
      .from('conversation_messages')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mettre à jour la conversation
    let lastMessageText = '📷 Photo'
    if (hasText) lastMessageText = content.trim()
    else if (hasGif) lastMessageText = '🎬 GIF'
    else if (hasPhotos || hasImageUrl) lastMessageText = '📷 Photo'

    await supabaseAdmin
      .from('conversations')
      .update({
        last_message: lastMessageText,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({ message: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}