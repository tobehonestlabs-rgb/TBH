import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function verifySignature(rawBody: string, signature: string, timestamp: string, secret: string) {
  const timestampSeconds = Number(timestamp)
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  const actualBytes = Buffer.from(signature, 'utf8')
  const expectedBytes = Buffer.from(expected, 'utf8')
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes)
}

export async function POST(request: NextRequest) {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET
  const signature = request.headers.get('x-webhook-signature') || ''
  const timestamp = request.headers.get('x-webhook-timestamp') || ''
  const rawBody = await request.text()

  if (!secret || !signature || !timestamp || !verifySignature(rawBody, signature, timestamp, secret)) {
    return NextResponse.json({ error: 'Invalid GeniusPay webhook signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
  }

  const payment = event.data
  if (event.event !== 'payment.success' || payment?.status !== 'completed') {
    return NextResponse.json({ received: true })
  }

  const userId = payment.metadata?.user_id || payment.metadata?.userId
  const reference = payment.reference || payment.id
  if (!userId || !reference) {
    console.error('[GeniusPay] Successful payment is missing user_id metadata or reference')
    return NextResponse.json({ received: true })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: currentUser, error: lookupError } = await supabase
    .from('users_table')
    .select('subscription_reference')
    .eq('user_id', userId)
    .maybeSingle()

  if (lookupError) {
    console.error('[GeniusPay] Could not check existing subscription:', lookupError)
    return NextResponse.json({ error: 'Database lookup failed' }, { status: 500 })
  }
  if (currentUser?.subscription_reference === String(reference)) {
    return NextResponse.json({ received: true })
  }

  const startedAt = new Date()
  const endsAt = new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
  const { error } = await supabase.from('users_table').update({
    active_subscription: true,
    subscription_code: `geniuspay:${reference}`,
    subscription_start: startedAt.toISOString(),
    subscription_end: endsAt.toISOString(),
    subscription_provider: 'geniuspay',
    subscription_reference: String(reference),
  }).eq('user_id', userId)

  if (error) {
    console.error('[GeniusPay] Could not activate subscription:', error)
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}