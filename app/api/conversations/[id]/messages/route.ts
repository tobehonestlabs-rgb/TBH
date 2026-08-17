import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'

// --------------------------------------------------------------------
// GET : Récupère les messages d'une conversation
// --------------------------------------------------------------------
export async function GET( 
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, gif_url, image_url, photos } = await req.json()

    // Vérifier qu'il y a au moins un contenu
    const hasText = content?.trim()?.length > 0
    const hasGif = !!gif_url
    const hasImageUrl = !!image_url
    const hasPhotos = photos && Array.isArray(photos) && photos.length > 0

    if (!hasText && !hasGif && !hasImageUrl && !hasPhotos) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }

    // Construire l'objet d'insertion
    const insertData: Record<string, any> = {
      conversation_id: id,
      sender_id: user.id,
      content: content?.trim() || '', // champ requis en DB
    }

    if (hasGif) insertData.gif_url = gif_url
    if (hasPhotos) insertData.photos = photos
    else if (hasImageUrl) insertData.image_url = image_url

    // Insérer le message
    const { data, error } = await supabaseAdmin
      .from('conversation_messages')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mettre à jour la conversation (dernier message)
    let lastMessageText = '📷 Photo' // fallback
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