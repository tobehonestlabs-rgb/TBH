// app/api/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { logInfo, logError, logWarn, logDebug } from '@/app/api/_lib/logger'

const PREMIUM_PRICE_XOF = 1800

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Activate Premium with logging ──────────────────────────────────────
async function activatePremium(
  userId: string,
  data: { reference: string; provider: string; amount: number; currency: string }
) {
  const supabase = getAdminSupabase()
  const now = new Date().toISOString()

  await logInfo('activation', `Starting activation for userId: ${userId}`, {
    user_id: userId,
    reference: data.reference,
    metadata: { amount: data.amount, currency: data.currency }
  })

  // ✅ 1. Check if user exists using users_table
  const { data: userData, error: fetchError } = await supabase
    .from('users_table')
    .select('user_id, active_subscription, subscription_code')
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    await logError('activation', `User fetch failed: ${fetchError.message}`, {
      user_id: userId,
      reference: data.reference,
      metadata: { error: fetchError }
    })
    throw new Error(`User fetch failed: ${fetchError.message}`)
  }

  await logDebug('activation', `User found`, {
    user_id: userId,
    reference: data.reference,
    metadata: { userData }
  })

  if (userData?.active_subscription === true) {
    await logInfo('activation', `User ${userId} already has active subscription, skipping`, {
      user_id: userId,
      reference: data.reference
    })
    return
  }

  // ✅ 2. Update the user using users_table
  const updateData = {
    active_subscription: true,
    subscription_code: `${data.provider}:${data.reference}`,
    subscription_start: now,
    subscription_end: null,
    subscription_provider: data.provider,
    subscription_reference: data.reference,
  }

  await logDebug('activation', `Updating user with data`, {
    user_id: userId,
    reference: data.reference,
    metadata: { updateData }
  })

  const { error: updateError } = await supabase
    .from('users_table') // ✅ FIXED: Changed from 'users' to 'users_table'
    .update(updateData)
    .eq('user_id', userId) // ✅ Using user_id (correct)

  if (updateError) {
    await logError('activation', `Update failed: ${updateError.message}`, {
      user_id: userId,
      reference: data.reference,
      metadata: { error: updateError }
    })
    throw new Error(`Update failed: ${updateError.message}`)
  }

  // ✅ 3. Log transaction
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
      await logWarn('activation', `Transaction log failed: ${txError.message}`, {
        user_id: userId,
        reference: data.reference
      })
    }
  } catch (txErr) {
    await logWarn('activation', `Transaction insert error`, {
      user_id: userId,
      reference: data.reference,
      metadata: { error: txErr }
    })
  }

  await logInfo('activation', `✅ Premium fully activated for ${userId}`, {
    user_id: userId,
    reference: data.reference
  })
}

// ── POST: Initialize Payment ──────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()
    
    await logInfo('payment_init', `POST called for user: ${userId}`, {
      user_id: userId,
      metadata: { email }
    })

    if (!email || !userId) {
      await logError('payment_init', 'Missing email or userId', { user_id: userId })
      return NextResponse.json({ error: 'Email and userId required' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      await logError('payment_init', 'Paystack not configured - missing secret key')
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    const reference = `tbh_${userId.slice(0, 8)}_${Date.now()}`

    await logInfo('payment_init', `Creating reference: ${reference}`, {
      user_id: userId,
      reference
    })

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
      await logError('payment_init', `Init error: ${data.message}`, {
        user_id: userId,
        reference,
        metadata: { data }
      })
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    await logInfo('payment_init', `✅ Init successful. Access code: ${data.data?.access_code}`, {
      user_id: userId,
      reference
    })

    return NextResponse.json({
      success: true,
      reference,
      access_code: data.data?.access_code,
      authorization_url: data.data?.authorization_url,
    })
  } catch (error: any) {
    await logError('payment_init', `POST error: ${error.message}`, {
      metadata: { error }
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET: Verify Payment ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference')
    
    await logInfo('verification', `GET called with reference: ${reference}`, {
      reference: reference ?? undefined
    })

    if (!reference) {
      await logError('verification', 'Missing reference in GET request')
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim()
    if (!secretKey) {
      await logError('verification', 'Paystack not configured - missing secret key', {
        reference: reference ?? undefined
      })
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    // 1. Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    const data = await verifyRes.json()

    await logDebug('verification', `Paystack verify response`, {
      reference: reference ?? undefined,
      metadata: {
        status: data.status,
        data_status: data.data?.status,
        data_reference: data.data?.reference
      }
    })

    if (!data.status) {
      await logError('verification', `Paystack verify error: ${data.message}`, {
        reference: reference ?? undefined,
        metadata: { data }
      })
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    if (data.data?.status !== 'success') {
      await logInfo('verification', `Transaction not successful. Status: ${data.data?.status}`, {
        reference: reference ?? undefined,
        metadata: { status: data.data?.status }
      })
      return NextResponse.json({
        success: false,
        status: data.data?.status,
        reference,
      })
    }

    // 2. Transaction is successful → get userId
    const userId =
      data.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'uid')?.value ||
      data.data.metadata?.user_id

    await logInfo('verification', `Extracted userId: ${userId}`, {
      user_id: userId ?? undefined,
      reference: reference ?? undefined
    })

    if (!userId) {
      await logError('verification', 'No userId found in metadata', {
        reference: reference ?? undefined,
        metadata: { metadata: data.data.metadata }
      })
      return NextResponse.json({
        success: false,
        error: 'User ID not found in transaction metadata',
      }, { status: 400 })
    }

    // 3. Activate premium
    try {
      await logInfo('verification', `🚀 Calling activatePremium for ${userId}`, {
        user_id: userId,
        reference: reference ?? undefined
      })

      await activatePremium(userId, {
        reference: data.data.reference,
        provider: 'paystack',
        amount: data.data.amount,
        currency: data.data.currency,
      })

      await logInfo('verification', `✅ Activation completed for ${userId}`, {
        user_id: userId,
        reference: reference ?? undefined
      })

      return NextResponse.json({
        success: true,
        status: 'success',
        reference,
      })
    } catch (activationError: any) {
      await logError('verification', `Activation error: ${activationError.message}`, {
        user_id: userId,
        reference: reference ?? undefined,
        metadata: { error: activationError }
      })
      return NextResponse.json({
        success: false,
        error: activationError.message || 'Premium activation failed. Please contact support.',
        reference,
      }, { status: 500 })
    }
  } catch (error: any) {
    await logError('verification', `GET error: ${error.message}`, {
      reference: request.nextUrl.searchParams.get('reference') ?? undefined,
      metadata: { error }
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}