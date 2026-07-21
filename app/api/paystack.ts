// app/api/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'
import crypto from 'crypto'

// ── Config ──────────────────────────────────────────────────────────────
const PREMIUM_PRICE_CENTS = 299 // $2.99 in cents

// ── Helper: Activate Premium ────────────────────────────────────────────
async function activatePremium(
  userId: string,
  data: { reference: string; provider: string; amount: number; currency: string }
) {
  const supabase = getServerSupabase()
  
  // Check if user already has premium to avoid duplicates
  const { data: userData } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', userId)
    .single()

  if (userData?.is_premium) {
    console.log(`[Paystack] User ${userId} already has premium, skipping activation`)
    return
  }

  // Update user's premium status
  const { error: userError } = await supabase
    .from('users')
    .update({
      is_premium: true,
      premium_activated_at: new Date().toISOString(),
      premium_reference: data.reference,
      premium_provider: data.provider,
    })
    .eq('id', userId)

  if (userError) {
    console.error('[Paystack] Failed to activate premium:', userError)
    throw userError
  }

  // Log the transaction
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
      created_at: new Date().toISOString(),
    })

  if (txError) {
    console.error('[Paystack] Failed to log transaction:', txError)
    // Don't throw, premium was already activated
  }

  console.log(`[Paystack] Premium activated for ${userId} (Ref: ${data.reference})`)
}

// ── POST: Initialize Payment ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const secretKey = (process.env.PAYSTACK_SECRET_KEY ?? '').trim()
  if (!secretKey) {
    return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
  }

  const reference = `tbh_${user.id.slice(0, 8)}_${Date.now()}`

  const requestBody = {
    email,
    amount: PREMIUM_PRICE_CENTS,
    currency: 'USD',
    reference,
    metadata: {
      custom_fields: [
        { display_name: 'User ID', variable_name: 'uid', value: user.id },
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
    console.error('[Paystack] Init error:', data.message)
    return NextResponse.json(
      { error: data.message, details: data },
      { status: 400 }
    )
  }

  return NextResponse.json({
    reference,
    access_code: data.data?.access_code,
    authorization_url: data.data?.authorization_url,
  })
}

// ── GET: Verify Payment ────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const reference = url.searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'Reference required' }, { status: 400 })
  }

  const secretKey = (process.env.PAYSTACK_SECRET_KEY ?? '').trim()
  if (!secretKey) {
    return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })

  const data = await response.json()

  if (!data.status) {
    return NextResponse.json(
      { error: data.message, details: data },
      { status: 400 }
    )
  }

  if (data.data?.status === 'success') {
    const metadata = data.data?.metadata ?? {}
    const customFields = metadata.custom_fields ?? []
    const uid = customFields.find(
      (f: { variable_name: string }) => f.variable_name === 'uid'
    )?.value ?? metadata?.user_id

    if (uid) {
      await activatePremium(uid, {
        reference: data.data.reference,
        provider: 'paystack',
        amount: data.data.amount / 100,
        currency: data.data.currency,
      })
    }

    return NextResponse.json({
      success: true,
      status: data.data.status,
      reference: data.data.reference,
    })
  }

  return NextResponse.json({
    success: false,
    status: data.data?.status,
    reference: data.data?.reference,
  })
}

// ── Webhook Handler ──────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    // ⚠️ CRITICAL: Use req.text() for webhooks, not req.json()
    const rawBody = await req.text()
    
    console.log('[Paystack Webhook] Raw body length:', rawBody.length)
    console.log('[Paystack Webhook] Raw body preview:', rawBody.substring(0, 200))

    // If body is empty, return 200 (Paystack may retry)
    if (!rawBody || rawBody.length === 0) {
      console.warn('[Paystack Webhook] Empty body received')
      return NextResponse.json({ ok: true })
    }

    // Verify signature
    const paystackSignature = req.headers.get('x-paystack-signature')
    const secret = (process.env.PAYSTACK_SECRET_KEY ?? '').trim()

    if (!paystackSignature) {
      console.warn('[Paystack Webhook] Missing signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

    if (hash !== paystackSignature) {
      console.error('[Paystack Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Parse JSON body
    const event = JSON.parse(rawBody)
    console.log('[Paystack Webhook] Event:', event.event)

    // Only handle charge.success events
    if (event.event !== 'charge.success') {
      console.log('[Paystack Webhook] Ignoring event:', event.event)
      return NextResponse.json({ ok: true })
    }

    const { metadata } = event.data ?? {}
    const customFields = metadata?.custom_fields ?? []
    
    const paymentType = customFields.find(
      (f: { variable_name: string }) => f.variable_name === 'type'
    )?.value ?? metadata?.type ?? 'premium'

    // Only handle premium payments
    if (paymentType !== 'premium') {
      console.warn('[Paystack Webhook] Ignoring non-premium payment type:', paymentType)
      return NextResponse.json({ ok: true })
    }

    const uid = customFields.find(
      (f: { variable_name: string }) => f.variable_name === 'uid'
    )?.value ?? metadata?.user_id

    if (!uid) {
      console.error('[Paystack Webhook] Missing user id in metadata')
      return NextResponse.json({ ok: true })
    }

    const amount = (event.data?.amount ?? PREMIUM_PRICE_CENTS) / 100
    const currency = event.data?.currency ?? 'USD'
    const reference = event.data?.reference ?? ''

    console.log(`[Paystack Webhook] Processing premium: ${uid} (${amount} ${currency}, ref: ${reference})`)

    await activatePremium(uid, {
      reference,
      provider: 'paystack',
      amount,
      currency,
    })

    console.log(`[Paystack Webhook] Premium activated for ${uid}`)
    return NextResponse.json({ ok: true })

  } catch (error: any) {
    console.error('[Paystack Webhook] Error:', error.message)
    // Always return 200 for webhooks to prevent Paystack from retrying
    return NextResponse.json({ ok: true })
  }
}