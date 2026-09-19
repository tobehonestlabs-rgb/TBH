// app/api/creem/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Dynamic import with type-safe fallback ─────────────────────────────
async function getCreemClient() {
  const mod = await import('creem')
  // Try various export patterns
  const Creem = (mod as any).default || (mod as any).createCreem || mod
  return Creem({
    apiKey: process.env.CREEM_API_KEY || '',
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET || '',
    testMode: process.env.NODE_ENV !== 'production',
  })
}

// ── Supabase Admin Client ──────────────────────────────────────────────
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-creem-signature')

    console.log('[Creem Webhook] Received webhook')

    if (!signature) {
      console.error('[Creem Webhook] Missing signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const creem = await getCreemClient()

    let event
    try {
      event = creem.webhooks.verify(rawBody, signature)
    } catch (err: any) {
      console.error('[Creem Webhook] Invalid signature:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`[Creem Webhook] Event type: ${event.type}`)

    if (event.type === 'checkout.completed') {
      const userId = event.data.metadata?.userId
      const checkoutId = event.data.id

      console.log(`[Creem Webhook] Checkout completed for user: ${userId}`)

      if (!userId) {
        console.error('[Creem Webhook] No userId in metadata')
        return NextResponse.json({ received: true })
      }

      try {
        const supabase = getAdminSupabase()
        const now = new Date().toISOString()

        const { error: updateError } = await supabase
          .from('users_table')
          .update({
            active_subscription: true,
            subscription_code: `creem:${checkoutId}`,
            subscription_start: now,
            subscription_end: null,
            subscription_provider: 'creem',
            subscription_reference: checkoutId,
          })
          .eq('user_id', userId)

        if (updateError) {
          console.error('[Creem Webhook] Supabase update error:', updateError)
          return NextResponse.json(
            { error: 'Database update failed' },
            { status: 500 }
          )
        }

        console.log(`[Creem Webhook] ✅ Premium activated for user ${userId}`)
      } catch (dbError) {
        console.error('[Creem Webhook] Database error:', dbError)
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Creem Webhook] Error:', error.message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}