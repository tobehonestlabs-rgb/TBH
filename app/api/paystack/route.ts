// app/api/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const APP_URL = process.env.PAYSTACK_RETURN_URL || 'https://tbhonest.net'

// ── Supabase Admin Client ──────────────────────────────────────────────
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(request: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY missing' }, { status: 500 })
  }

  const body = await request.json()
  const { email, userId } = body

  if (!email || !userId) {
    return NextResponse.json(
      { error: 'Email et userId sont requis' },
      { status: 400 }
    )
  }

  // ✅ Price: 1800 XOF (change to 1800 for production)
  const amount = 500 // 1 XOF for testing

  const payload = {
    email,
    amount: Number(amount) * 100, // Paystack uses kobo (100 = 1 XOF)
    currency: 'XOF',
    metadata: {
      userId,
    },
    // ✅ Explicitly specify channels to include card payments
    channels: ['card', 'mobile_money', 'bank_transfer', 'ussd'],
    callback_url: `${APP_URL}/payment/status`,
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok || !data.status) {
    console.error('Paystack error:', data)
    return NextResponse.json(
      { error: data.message || 'Erreur lors de l\'initialisation du paiement' },
      { status: 502 }
    )
  }

  return NextResponse.json({
    status: 'success',
    message: 'Paiement initialisé avec succès',
    data: {
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      access_code: data.data.access_code,
    },
  })
}

export async function GET(request: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY missing' }, { status: 500 })
  }

  const url = new URL(request.url)
  const reference = url.searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'Référence de transaction requise' }, { status: 400 })
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (!response.ok || !data.status) {
    console.error('Paystack verification error:', data)
    return NextResponse.json(
      { error: data.message || 'Erreur de vérification' },
      { status: 400 }
    )
  }

  const transaction = data.data
  const isSuccessful = transaction.status === 'success'
  const userId = transaction.metadata?.userId

  if (isSuccessful && userId) {
    try {
      const supabase = getAdminSupabase()
      
      const { error: updateError } = await supabase
        .from('users_table')
        .update({
          active_subscription: true,
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Supabase update error:', updateError)
      } else {
        console.log(`✅ Premium activated for user ${userId}`)
      }
    } catch (error) {
      console.error('Supabase update exception:', error)
    }
  }

  return NextResponse.json({
    status: isSuccessful ? 'success' : 'failed',
    message: isSuccessful ? 'Paiement vérifié avec succès' : 'Le paiement n\'a pas abouti',
    data: {
      reference: transaction.reference,
      amount: transaction.amount / 100,
      status: transaction.status,
      userId,
      paid_at: transaction.paid_at,
      channel: transaction.channel,
    },
  })
}