import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'


export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ messages: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content, gif_url, image_url, photos } = await req.json()
    // Accept messages with text, a gif, a single image_url, or an array of photos
    if (!content?.trim() && !gif_url && !image_url && !(photos && Array.isArray(photos) && photos.length > 0)) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }

    const insertData: Record<string, any> = {
      conversation_id: params.id,
      sender_id: user.id,
      content: content?.trim() || '', // content is required in DB but can be empty string
    }
    if (gif_url)         insertData.gif_url = gif_url
    if (photos && Array.isArray(photos) && photos.length > 0) insertData.photos = photos
    else if (image_url)  insertData.image_url = image_url

    const { data, error } = await supabaseAdmin
      .from('conversation_messages')
      .insert(insertData)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update conversation last_message
    let lastMessageText = content?.trim() ?? ''
    if (gif_url) lastMessageText = '🎬 GIF'
    if ((photos && Array.isArray(photos) && photos.length > 0) || image_url) lastMessageText = '📷 Photo'
    if (!lastMessageText) lastMessageText = '📷 Photo'
    
    await supabaseAdmin
      .from('conversations')
      .update({
        last_message:    lastMessageText,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    return NextResponse.json({ message: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
