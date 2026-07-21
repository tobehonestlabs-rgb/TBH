// app/api/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ── Config ──────────────────────────────────────────────────────────────
const PREMIUM_PRICE_XOF = 1800 // ✅ FIXED: Matches frontend

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

  // Check if user exists
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
    console.log(`[Paystack] ⏭️ User ${userId} already has active subscription, skipping`)
    return
  }

  // Update user
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

  // Log transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      reference: data.reference,
      provider: data.provider,
      amount: data.amount,
      currency: data.currency,
      type: 'premium',
      status: 'success',
      created_at: now,
    })

  if (txError) {
    console.error('[Paystack] ⚠️ Transaction log error:', txError)
  }

  console.log(`[Paystack] ✅ Premium activated for ${userId}`)
}

// ── POST: Initialize Payment ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userId } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    console.log(`[Paystack] 💰 Charging ${PREMIUM_PRICE_XOF} XOF for user ${userId}`)

    const reference = `tbh_${userId.slice(0, 8)}_${Date.now()}`

    const requestBody = {
      email,
      amount: PREMIUM_PRICE_XOF,
      currency: 'XOF',
      reference,
      // ✅ Add callback_url so Paystack redirects back to your app
      callback_url: 'https://tbhonest.net/payment-return',
      metadata: {
        custom_fields: [
          { display_name: 'User ID', variable_name: 'uid', value: userId },
          { display_name: 'Type', variable_name: 'type', value: 'premium' },
          { display_name: 'Amount XOF', variable_name: 'amount_xof', value: PREMIUM_PRICE_XOF.toString() },
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
      console.error('[Paystack] Init error:', data.message)
      return NextResponse.json(
        { error: data.message, details: data },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      reference,
      access_code: data.data?.access_code,
      authorization_url: data.data?.authorization_url,
      price_xof: PREMIUM_PRICE_XOF,
    })
  } catch (error: any) {
    console.error('[Paystack] POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

// ── GET: Verify Payment ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const reference = url.searchParams.get('reference')

    console.log(`[Paystack] 🔍 GET verification called with reference: ${reference}`)

    if (!reference) {
      console.error('[Paystack] ❌ No reference provided')
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    console.log(`[Paystack] 🔍 Verifying payment: ${reference}`)

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })

    const data = await response.json()

    console.log(`[Paystack] 📊 Verify response status: ${data.status}`)
    console.log(`[Paystack] 📊 Transaction status: ${data.data?.status}`)

    if (!data.status) {
      console.error('[Paystack] ❌ Verify error:', data.message)
      return NextResponse.json({ error: data.message, details: data }, { status: 400 })
    }

    if (data.data?.status === 'success') {
      const metadata = data.data?.metadata ?? {}
      const customFields = metadata.custom_fields ?? []
      const userId = customFields.find(
        (f: any) => f.variable_name === 'uid'
      )?.value ?? metadata?.user_id

      console.log(`[Paystack] ✅ Payment successful for user: ${userId}`)

      if (userId) {
        try {
          await activatePremium(userId, {
            reference: data.data.reference,
            provider: 'paystack',
            amount: data.data.amount,
            currency: data.data.currency,
          })
          console.log(`[Paystack] ✅ Premium activated via GET verification for ${userId}`)
        } catch (activationError) {
          console.error('[Paystack] ❌ Activation failed:', activationError)
          return NextResponse.json({
            success: true,
            status: data.data.status,
            reference: data.data.reference,
            activationError: 'Premium activation failed. Please contact support.',
          })
        }
      }

      return NextResponse.json({
        success: true,
        status: data.data.status,
        reference: data.data.reference,
      })
    }

    console.log(`[Paystack] ⚠️ Transaction status: ${data.data?.status}`)
    return NextResponse.json({
      success: false,
      status: data.data?.status,
      reference: data.data?.reference,
    })
  } catch (error: any) {
    console.error('[Paystack] GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

// ── PUT: Webhook Handler ──────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const rawBody = await request.text()
    console.log('[Paystack Webhook] 📨 Body received, length:', rawBody?.length || 0)

    if (!rawBody || rawBody.length === 0) {
      console.warn('[Paystack Webhook] ⚠️ Empty body')
      return NextResponse.json({ ok: true })
    }

    const paystackSignature = request.headers.get('x-paystack-signature')
    const secret = process.env.PAYSTACK_SECRET_KEY?.trim() || ''

    if (!paystackSignature) {
      console.warn('[Paystack Webhook] ⚠️ Missing signature header')
      return NextResponse.json({ ok: true })
    }

    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

    if (hash !== paystackSignature) {
      console.error('[Paystack Webhook] ❌ Invalid signature')
      return NextResponse.json({ ok: true })
    }

    const event = JSON.parse(rawBody)
    console.log('[Paystack Webhook] 📊 Event:', event.event)

    if (event.event !== 'charge.success') {
      console.log('[Paystack Webhook] ⏭️ Ignoring event:', event.event)
      return NextResponse.json({ ok: true })
    }

    const { metadata } = event.data ?? {}
    const customFields = metadata?.custom_fields ?? []

    const paymentType =
      customFields.find((f: any) => f.variable_name === 'type')?.value ?? 'premium'

    if (paymentType !== 'premium') {
      console.log('[Paystack Webhook] ⏭️ Ignoring payment type:', paymentType)
      return NextResponse.json({ ok: true })
    }

    const userId =
      customFields.find((f: any) => f.variable_name === 'uid')?.value ??
      metadata?.user_id

    if (!userId) {
      console.error('[Paystack Webhook] ❌ Missing user id in metadata')
      return NextResponse.json({ ok: true })
    }

    const amount = event.data?.amount ?? 0
    const currency = event.data?.currency ?? 'XOF'
    const reference = event.data?.reference ?? ''

    console.log(`[Paystack Webhook] 🎯 Processing premium for user: ${userId}`)

    try {
      await activatePremium(userId, {
        reference,
        provider: 'paystack',
        amount,
        currency,
      })
      console.log(`[Paystack Webhook] ✅ Premium activated for ${userId}`)
    } catch (activationError) {
      console.error('[Paystack Webhook] ❌ Activation failed:', activationError)
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[Paystack Webhook] ❌ Error:', error.message)
    return NextResponse.json({ ok: true })
  }
}