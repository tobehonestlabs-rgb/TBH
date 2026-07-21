// app/api/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ── Config ──────────────────────────────────────────────────────────────
const PREMIUM_PRICE_USD = 2.99

// ── Supabase Admin Client ──────────────────────────────────────────────
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Helper: Get USD → XOF conversion rate ─────────────────────────────
async function getUSDtoXOFRate(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()
    return data.rates?.XOF || 600
  } catch {
    return 600 // fallback
  }
}

// ── Helper: Activate Premium ────────────────────────────────────────────
async function activatePremium(
  userId: string,
  data: { reference: string; provider: string; amount: number; currency: string }
) {
  const supabase = getAdminSupabase()

  // Avoid duplicate activation
  const { data: userData } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', userId)
    .single()

  if (userData?.is_premium) {
    console.log(`[Paystack] User ${userId} already premium, skipping`)
    return
  }

  // Update user
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
      created_at: new Date().toISOString(),
    })

  if (txError) {
    console.error('[Paystack] Failed to log transaction:', txError)
  }

  console.log(`[Paystack] Premium activated for ${userId}`)
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

    const rate = await getUSDtoXOFRate()
    const amountInXOF = Math.round(PREMIUM_PRICE_USD * rate)

    console.log(`[Paystack] Converting $${PREMIUM_PRICE_USD} → ${amountInXOF} XOF`)

    const reference = `tbh_${userId.slice(0, 8)}_${Date.now()}`

    const requestBody = {
      email,
      amount: amountInXOF,
      currency: 'XOF', // Must match your Paystack account currency
      reference,
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
      price_usd: PREMIUM_PRICE_USD,
      price_xof: amountInXOF,
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
      return NextResponse.json({ error: data.message, details: data }, { status: 400 })
    }

    if (data.data?.status === 'success') {
      const metadata = data.data?.metadata ?? {}
      const customFields = metadata.custom_fields ?? []
      const userId = customFields.find(
        (f: any) => f.variable_name === 'uid'
      )?.value ?? metadata?.user_id

      if (userId) {
        await activatePremium(userId, {
          reference: data.data.reference,
          provider: 'paystack',
          amount: data.data.amount,
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
    console.log('[Paystack Webhook] Body length:', rawBody?.length || 0)

    if (!rawBody || rawBody.length === 0) {
      return NextResponse.json({ ok: true })
    }

    // Verify signature
    const paystackSignature = request.headers.get('x-paystack-signature')
    const secret = process.env.PAYSTACK_SECRET_KEY?.trim() || ''

    if (!paystackSignature) {
      console.warn('[Paystack Webhook] Missing signature')
      return NextResponse.json({ ok: true })
    }

    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

    if (hash !== paystackSignature) {
      console.error('[Paystack Webhook] Invalid signature')
      return NextResponse.json({ ok: true })
    }

    const event = JSON.parse(rawBody)
    console.log('[Paystack Webhook] Event:', event.event)

    if (event.event !== 'charge.success') {
      return NextResponse.json({ ok: true })
    }

    const { metadata } = event.data ?? {}
    const customFields = metadata?.custom_fields ?? []

    const paymentType =
      customFields.find((f: any) => f.variable_name === 'type')?.value ?? 'premium'

    if (paymentType !== 'premium') {
      return NextResponse.json({ ok: true })
    }

    const userId =
      customFields.find((f: any) => f.variable_name === 'uid')?.value ??
      metadata?.user_id

    if (!userId) {
      console.error('[Paystack Webhook] Missing user id')
      return NextResponse.json({ ok: true })
    }

    const amount = event.data?.amount ?? 0
    const currency = event.data?.currency ?? 'XOF'
    const reference = event.data?.reference ?? ''

    console.log(`[Paystack Webhook] Processing: ${userId} (${amount} ${currency})`)

    await activatePremium(userId, {
      reference,
      provider: 'paystack',
      amount,
      currency,
    })

    console.log(`[Paystack Webhook] Premium activated for ${userId}`)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[Paystack Webhook] Error:', error.message)
    return NextResponse.json({ ok: true })
  }
}