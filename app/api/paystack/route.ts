// app/api/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ── Config ──────────────────────────────────────────────────────────────
const PREMIUM_PRICE_XOF = 100 // Fixed price in XOF

// ── Supabase Admin Client ──────────────────────────────────────────────
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Generate Unique Reference ──────────────────────────────────────────
function generateReference(userId: string): string {
  const prefix = userId.slice(0, 8)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8) // 6 random chars
  return `tbh_${prefix}_${timestamp}_${random}`
}

// ── Helper: Activate Premium ────────────────────────────────────────────
async function activatePremium(
  userId: string,
  data: { reference: string; provider: string; amount: number; currency: string }
) {
  const supabase = getAdminSupabase()
  const now = new Date().toISOString()

  console.log(`[Paystack] 🔍 Activating premium for userId: ${userId}`)

  // 1. Check if user exists and get current status
  const { data: userData, error: fetchError } = await supabase
    .from('users') // ← CHANGE to your actual table name!
    .select('id, active_subscription, subscription_code')
    .eq('id', userId) // ← CHANGE to your primary key column!
    .single()

  if (fetchError) {
    console.error('[Paystack] ❌ Fetch error:', JSON.stringify(fetchError, null, 2))
    throw new Error(`User fetch failed: ${fetchError.message}`)
  }

  console.log(`[Paystack] 👤 User found:`, userData)

  if (userData?.active_subscription === true) {
    console.log(`[Paystack] ⏭️ User ${userId} already has active subscription`)
    return // Already premium
  }

  // 2. Update the user
  const updateData = {
    active_subscription: true,
    subscription_code: `${data.provider}:${data.reference}`,
    subscription_start: now,
    subscription_end: null,
    subscription_provider: data.provider,
    subscription_reference: data.reference,
  }

  console.log(`[Paystack] 📝 Updating user with:`, updateData)

  const { error: updateError } = await supabase
    .from('users') // ← CHANGE to your actual table name!
    .update(updateData)
    .eq('id', userId) // ← CHANGE to your primary key column!

  if (updateError) {
    console.error('[Paystack] ❌ Update error:', JSON.stringify(updateError, null, 2))
    throw new Error(`Update failed: ${updateError.message}`)
  }

  console.log(`[Paystack] ✅ Update successful for user ${userId}`)

  // 3. Log transaction (optional)
  try {
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
      console.warn('[Paystack] ⚠️ Transaction log failed:', txError.message)
    }
  } catch (txErr) {
    console.warn('[Paystack] ⚠️ Transaction insert error:', txErr)
  }

  console.log(`[Paystack] 🎉 Premium fully activated for ${userId}`)
}

// ── POST: Initialize Payment ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()
    console.log(`[Paystack] 📩 POST /api/paystack called for user: ${userId}`)

    if (!email || !userId) {
      return NextResponse.json({ error: 'Email and userId required' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    // ✅ Generate unique reference
    const reference = generateReference(userId)

    console.log(`[Paystack] 💰 Reference: ${reference}`)

    const requestBody = {
      email,
      amount: PREMIUM_PRICE_XOF,
      currency: 'XOF',
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
      console.error('[Paystack] ❌ Init error:', data.message)
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    console.log(`[Paystack] ✅ Init successful. Reference: ${reference}`)

    return NextResponse.json({
      success: true,
      reference,
      access_code: data.data?.access_code,
      authorization_url: data.data?.authorization_url,
    })
  } catch (error: any) {
    console.error('[Paystack] ❌ POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET: Verify Payment ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference')
    console.log(`[Paystack] 🔍 GET /api/paystack?reference=${reference}`)

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    // 1. Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    const data = await verifyRes.json()

    console.log(`[Paystack] 📊 Paystack verify response:`, {
      status: data.status,
      data_status: data.data?.status,
      reference: data.data?.reference,
    })

    if (!data.status) {
      console.error('[Paystack] ❌ Paystack verify error:', data.message)
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    if (data.data?.status !== 'success') {
      console.log(`[Paystack] ⏭️ Transaction not successful. Status: ${data.data?.status}`)
      return NextResponse.json({
        success: false,
        status: data.data?.status,
        reference,
      })
    }

    // 2. Transaction is successful → activate premium
    const userId =
      data.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'uid')?.value ||
      data.data.metadata?.user_id

    console.log(`[Paystack] 👤 Extracted userId: ${userId}`)

    if (!userId) {
      console.error('[Paystack] ❌ No userId found in metadata')
      return NextResponse.json({
        success: false,
        error: 'User ID not found in transaction metadata',
      }, { status: 400 })
    }

    // 3. Activate premium
    try {
      console.log(`[Paystack] 🚀 Calling activatePremium for ${userId}`)
      await activatePremium(userId, {
        reference: data.data.reference,
        provider: 'paystack',
        amount: data.data.amount,
        currency: data.data.currency,
      })
      console.log(`[Paystack] ✅ Activation completed for ${userId}`)

      return NextResponse.json({
        success: true,
        status: 'success',
        reference,
      })
    } catch (activationError: any) {
      console.error('[Paystack] ❌ Activation error:', activationError)
      return NextResponse.json({
        success: false,
        error: activationError.message || 'Premium activation failed. Please contact support.',
        reference,
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('[Paystack] ❌ GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PUT: Webhook (REMOVED to avoid duplicate activation) ─────────────────
// The GET verification is the primary path for activation.
// No webhook needed to prevent double activation.