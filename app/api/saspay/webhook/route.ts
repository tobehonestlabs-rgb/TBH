import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function verifySignature(rawBody: string, signature: string, timestamp: string, secret: string) {
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  const actualBytes = Buffer.from(signature, 'utf8')
  const expectedBytes = Buffer.from(expected, 'utf8')
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes)
}

export async function POST(request: NextRequest) {
  const secret = process.env.SASPAY_WEBHOOK_SECRET
  const signature = request.headers.get('x-webhook-signature') || ''
  const timestamp = request.headers.get('x-webhook-timestamp') || ''
  const rawBody = await request.text()

  if (!secret || !signature || !timestamp || !verifySignature(rawBody, signature, timestamp, secret)) {
    return NextResponse.json({ error: 'Invalid SasPay webhook signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  if (event.event !== 'transaction.success' || event.data?.status !== 'SUCCESS') {
    return NextResponse.json({ received: true })
  }

  const userId = event.data.metadata?.user_id || event.data.metadata?.userId
  if (!userId) {
    console.error('[SasPay] Successful transaction has no user_id metadata')
    return NextResponse.json({ received: true })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const startedAt = new Date()
  const endsAt = new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
  const { error } = await supabase.from('users_table').update({
    active_subscription: true,
    subscription_code: `saspay:${event.data.id}`,
    subscription_start: startedAt.toISOString(),
    subscription_end: endsAt.toISOString(),
    subscription_provider: 'saspay',
    subscription_reference: event.data.reference || event.data.id,
  }).eq('user_id', userId)

  if (error) {
    console.error('[SasPay] Could not activate subscription:', error)
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}