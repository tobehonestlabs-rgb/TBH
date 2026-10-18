import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  const signature = request.headers.get('x-signature') || ''
  const rawBody = await request.text()

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Missing Lemon Squeezy webhook signature or secret' }, { status: 401 })
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const actualBytes = Buffer.from(signature, 'utf8')
  const expectedBytes = Buffer.from(expected, 'utf8')
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    return NextResponse.json({ error: 'Invalid Lemon Squeezy webhook signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventName = payload.meta?.event_name
  const attributes = payload.data?.attributes
  const userId = payload.meta?.custom_data?.user_id
  if (!userId || !attributes || !eventName?.startsWith('subscription_')) {
    return NextResponse.json({ received: true })
  }

  const status = attributes.status
  const accessActive = status === 'active' || status === 'on_trial' ||
    (status === 'cancelled' && attributes.ends_at && new Date(attributes.ends_at).getTime() > Date.now())
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error } = await supabase.from('users_table').update({
    active_subscription: Boolean(accessActive),
    subscription_code: `lemonsqueezy:${payload.data.id}`,
    subscription_start: attributes.created_at || new Date().toISOString(),
    subscription_end: attributes.ends_at || null,
    subscription_provider: 'lemonsqueezy',
    subscription_reference: String(payload.data.id),
  }).eq('user_id', userId)

  if (error) {
    console.error('[Lemon Squeezy] Subscription update failed:', error)
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}