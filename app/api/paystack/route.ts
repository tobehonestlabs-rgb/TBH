// app/api/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ── Config ──────────────────────────────────────────────────────────────
const PREMIUM_PRICE_XOF = 100 // ✅ Fixed to 1800

// ── Supabase Admin Client ──────────────────────────────────────────────
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Helper: Activate Premium ────────────────────────────────────────────
async function activatePremium(
  userId: string,
  data: { reference: string; provider: string; amount: number; currency: string }
) {
  const supabase = getAdminSupabase()
  const now = new Date().toISOString()

  console.log(`[Paystack] 🎯 Activating premium for user: ${userId}`)
  console.log(`[Paystack] 📝 Reference: ${data.reference}, Amount: ${data.amount} ${data.currency}`)

  const { data: existingUser, error: fetchError } = await supabase
    .from('users_table')
    .select('active_subscription, user_id')
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    console.error('[Paystack] ❌ User fetch error:', fetchError)
    throw fetchError
  }

  if (existingUser?.active_subscription) {
    console.log(`[Paystack] ⏭️ User ${userId} already active, skipping`)
    return
  }

  const { error: userError } = await supabase
    .from('users_table')
    .update({
      active_subscription: true,
      subscription_code: `${data.provider}:${data.reference}`,
      subscription_start: now,
      subscription_end: null,
      subscription_provider: data.provider,
      subscription_reference: data.reference,
    })
    .eq('user_id', userId)

  if (userError) {
    console.error('[Paystack] ❌ Update error:', userError)
    throw userError
  }

  await supabase.from('transactions').insert({
    user_id: userId,
    reference: data.reference,
    provider: data.provider,
    amount: data.amount,
    currency: data.currency,
    type: 'premium',
    status: 'success',
    created_at: now,
  })

  console.log(`[Paystack] ✅ Premium activated for ${userId}`)
}

// ── POST: Initialize Payment ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()
    if (!email || !userId) {
      return NextResponse.json({ error: 'Email and userId required' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    const reference = `tbh_${userId.slice(0, 8)}_${Date.now()}`

    const requestBody = {
      email,
      amount: PREMIUM_PRICE_XOF,
      currency: 'XOF',
      reference,
      // No callback_url — we use inline iframe
      metadata: {
        custom_fields: [
          { display_name: 'User ID', variable_name: 'uid', value: userId },
          { display_name: 'Type', variable_name: 'type', value: 'premium' },
        ],
      },
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()
    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      reference,
      access_code: data.data?.access_code,
      authorization_url: data.data?.authorization_url,
    })
  } catch (error: any) {
    console.error('[Paystack] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET: Verify Payment ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference')
    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    const data = await response.json()

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    if (data.data?.status === 'success') {
      const userId =
        data.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'uid')?.value ||
        data.data.metadata?.user_id

      if (userId) {
        await activatePremium(userId, {
          reference: data.data.reference,
          provider: 'paystack',
          amount: data.data.amount,
          currency: data.data.currency,
        })
      }

      return NextResponse.json({ success: true, status: 'success', reference })
    }

    return NextResponse.json({ success: false, status: data.data?.status })
  } catch (error: any) {
    console.error('[Paystack] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PUT: Webhook (optional) ─────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const rawBody = await request.text()
    if (!rawBody) return NextResponse.json({ ok: true })

    const signature = request.headers.get('x-paystack-signature')
    const secret = process.env.PAYSTACK_SECRET_KEY || ''
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
    if (hash !== signature) return NextResponse.json({ ok: true })

    const event = JSON.parse(rawBody)
    if (event.event !== 'charge.success') return NextResponse.json({ ok: true })

    const { metadata } = event.data
    const customFields = metadata?.custom_fields || []
    const userId = customFields.find((f: any) => f.variable_name === 'uid')?.value
    if (!userId) return NextResponse.json({ ok: true })

    await activatePremium(userId, {
      reference: event.data.reference,
      provider: 'paystack',
      amount: event.data.amount,
      currency: event.data.currency,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}