// app/api/creem/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Creem } from 'creem'

// ── Creem Client ──────────────────────────────────────────────────────────
const creem = new Creem({
  apiKey: process.env.CREEM_API_KEY || '',
  server: process.env.NODE_ENV !== 'production' ? 'test' : 'prod',
})

const PRODUCT_ID = process.env.CREEM_PRODUCT_ID || 'prod_YOUR_PRODUCT_ID'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tbhonest.net'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail } = body

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'userId et userEmail sont requis' },
        { status: 400 }
      )
    }

    console.log(`[Creem] Creating checkout for user: ${userId}`)

    // ── Create dynamic checkout session ──────────────────────────────────
    const session = await creem.checkouts.create({
      productId: PRODUCT_ID,
      customer: {
        email: userEmail,
      },
      metadata: {
        userId: userId,
      },
      successUrl: `${APP_URL}/payment/creem/status`,
    })

    console.log(`[Creem] Checkout created: ${session.id}`)

    return NextResponse.json({
      success: true,
      checkoutUrl: session.checkoutUrl,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('[Creem] Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}