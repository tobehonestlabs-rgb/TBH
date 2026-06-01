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

    const { content, gif_url } = await req.json()
    if (!content?.trim() && !gif_url) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

    const insertData: Record<string, any> = {
      conversation_id: params.id,
      sender_id: user.id,
    }
    if (content?.trim()) insertData.content = content.trim()
    if (gif_url)         insertData.gif_url = gif_url

    const { data, error } = await supabaseAdmin
      .from('conversation_messages')
      .insert(insertData)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update conversation last_message
    await supabaseAdmin
      .from('conversations')
      .update({
        last_message:    content?.trim() ?? '🎬 GIF',
        last_message_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    return NextResponse.json({ message: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
