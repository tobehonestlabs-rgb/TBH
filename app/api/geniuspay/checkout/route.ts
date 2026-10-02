import { NextRequest, NextResponse } from 'next/server'
import { getPaymentRequestUser } from '@/lib/paymentRequestUser'
import { isAfricanCountry } from '@/lib/paymentRegion'

const API_URL = 'https://pay.genius.ci/api/v1/merchant/payments'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tbhonest.net'

export async function POST(request: NextRequest) {
  const apiKey = process.env.GENIUSPAY_API_KEY
  const apiSecret = process.env.GENIUSPAY_API_SECRET
  const country = request.headers.get('x-vercel-ip-country')
  const isAfrica = isAfricanCountry(country)
  const amountEnv = isAfrica ? process.env.Africa_Amount : process.env.GlobalPriceAmount
  const currency = isAfrica ? process.env.Africa_Currency : process.env.GlobalCurrency
  const amount = Number(amountEnv)

  if (!apiKey || !apiSecret || !amountEnv || !currency || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: `GeniusPay API credentials and valid ${isAfrica ? 'Africa_Amount/Africa_Currency' : 'GlobalPriceAmount/GlobalCurrency'} settings are required` },
      { status: 500 },
    )
  }

  const user = await getPaymentRequestUser(request)
  if (!user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'X-API-Secret': apiSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      description: `TBH Pro access - 30 days (${isAfrica ? 'Africa' : 'Global'})`,
      customer: {
        name: user.email.split('@')[0],
        email: user.email,
      },
      success_url: `${APP_URL}/payment/geniuspay/status?result=success`,
      error_url: `${APP_URL}/payment/geniuspay/status?result=error`,
      metadata: { user_id: user.id, pricing_region: isAfrica ? 'africa' : 'global' },
    }),
  })

  const result = await response.json().catch(() => ({}))
  const checkout = result.data ?? result
  const checkoutUrl = checkout.checkout_url || checkout.payment_url

  if (!response.ok || result.success === false || !checkoutUrl) {
    console.error('[GeniusPay] Checkout creation failed:', result)
    return NextResponse.json(
      { error: result.error?.message || result.message || 'Could not create GeniusPay checkout' },
      { status: response.status >= 400 && response.status < 500 ? response.status : 502 },
    )
  }

  return NextResponse.json({ checkoutUrl, checkoutId: checkout.reference || checkout.id })
}