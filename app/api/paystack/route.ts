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
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ── Helper: Get USD to XOF conversion rate ────────────────────────────
async function getUSDtoXOFRate(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) {
      console.warn('[Paystack] Exchange rate API failed, using fallback rate')
      return 600
    }
    
    const data = await response.json()
    const rate = data.rates?.XOF
    
    if (!rate) {
      console.warn('[Paystack] XOF rate not found, using fallback')
      return 600
    }
    
    return rate
  } catch (error) {
    console.warn('[Paystack] Exchange rate fetch error, using fallback:', error)
    return 600
  }
}

// ── Helper: Activate Premium ────────────────────────────────────────────
async function activatePremium(
  userId: string,
  data: { reference: string; provider: string; amount: number; currency: string }
) {
  const supabase = getAdminSupabase()
  
  // Check if user already has premium
  const { data: userData } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', userId)
    .single()

  if (userData?.is_premium) {
    console.log(`[Paystack] User ${userId} already has premium, skipping`)
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
  }

  console.log(`[Paystack] Premium activated for ${userId}`)
}

// ── POST: Initialize Payment ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  console.log('[Paystack] POST request received')
  
  try {
    // Get user from authorization header or session
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null
    
    if (authHeader?.startsWith('Bearer ')) {
      // You can verify the token here if needed
      // For now, we'll get it from the request body
    }
    
    const body = await request.json()
    console.log('[Paystack] Request body:', { ...body, email: body.email })
    
    const { email, userId: uid } = body
    
    if (!email) {
      console.error('[Paystack] Missing email')
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    if (!uid) {
      console.error('[Paystack] Missing userId')
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      console.error('[Paystack] Missing secret key')
      return NextResponse.json(
        { error: 'Paystack not configured' },
        { status: 500 }
      )
    }

    // Currency Conversion: USD → XOF
    const rate = await getUSDtoXOFRate()
    const amountInXOF = Math.round(PREMIUM_PRICE_USD * rate)
    
    console.log(`[Paystack] Converting $${PREMIUM_PRICE_USD} → ${amountInXOF} XOF`)

    const reference = `tbh_${uid.slice(0, 8)}_${Date.now()}`

    const requestBody = {
      email,
      amount: amountInXOF,
      currency: 'XOF',
      reference,
      metadata: {
        custom_fields: [
          { display_name: 'User ID', variable_name: 'uid', value: uid },
          { display_name: 'Type', variable_name: 'type', value: 'premium' },
          { display_name: 'Amount USD', variable_name: 'amount_usd', value: PREMIUM_PRICE_USD.toString() },
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

// ── GET: Verify Payment ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  console.log('[Paystack] GET request received')
  
  try {
    const url = new URL(request.url)
    const reference = url.searchParams.get('reference')
    const uid = url.searchParams.get('userId')

    if (!reference) {
      console.error('[Paystack] Missing reference')
      return NextResponse.json(
        { error: 'Reference required' },
        { status: 400 }
      )
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      console.error('[Paystack] Missing secret key')
      return NextResponse.json(
        { error: 'Paystack not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    })

    const data = await response.json()

    if (!data.status) {
      console.error('[Paystack] Verify error:', data.message)
      return NextResponse.json(
        { error: data.message, details: data },
        { status: 400 }
      )
    }

    if (data.data?.status === 'success') {
      const metadata = data.data?.metadata ?? {}
      const customFields = metadata.custom_fields ?? []
      const userId = customFields.find(
        (f: { variable_name: string }) => f.variable_name === 'uid'
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
        user_id: userId,
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
  console.log('[Paystack Webhook] Request received')
  
  try {
    const rawBody = await request.text()
    console.log('[Paystack Webhook] Body length:', rawBody?.length || 0)

    if (!rawBody || rawBody.length === 0) {
      console.warn('[Paystack Webhook] Empty body')
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
      console.log('[Paystack Webhook] Ignoring event:', event.event)
      return NextResponse.json({ ok: true })
    }

    const { metadata } = event.data ?? {}
    const customFields = metadata?.custom_fields ?? []
    
    const paymentType = customFields.find(
      (f: { variable_name: string }) => f.variable_name === 'type'
    )?.value ?? 'premium'

    if (paymentType !== 'premium') {
      console.warn('[Paystack Webhook] Ignoring type:', paymentType)
      return NextResponse.json({ ok: true })
    }

    const uid = customFields.find(
      (f: { variable_name: string }) => f.variable_name === 'uid'
    )?.value

    if (!uid) {
      console.error('[Paystack Webhook] Missing user id')
      return NextResponse.json({ ok: true })
    }

    const amount = event.data?.amount ?? 0
    const currency = event.data?.currency ?? 'XOF'
    const reference = event.data?.reference ?? ''

    console.log(`[Paystack Webhook] Processing: ${uid} (${amount} ${currency})`)

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
    return NextResponse.json({ ok: true })
  }
}