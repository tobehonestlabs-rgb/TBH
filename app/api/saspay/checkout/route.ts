import { NextRequest, NextResponse } from 'next/server'
import { getPaymentRequestUser } from '@/lib/paymentRequestUser'

const API_BASE = 'https://api.saspay.me/api/v1'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tbhonest.net'

export async function POST(request: NextRequest) {
  const apiKey = process.env.SASPAY_API_KEY
  const amount = process.env.SASPAY_AMOUNT
  const currency = process.env.SASPAY_CURRENCY || 'XOF'

  if (!apiKey || !amount) {
    return NextResponse.json({ error: 'SASPAY_API_KEY and SASPAY_AMOUNT are required' }, { status: 500 })
  }

  const user = await getPaymentRequestUser(request)
  if (!user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const payload = {
    amount,
    currency,
    description: 'TBH Pro access',
    customer_email: user.email,
    customer_name: user.email.split('@')[0],
    country: process.env.SASPAY_COUNTRY || undefined,
    return_url: `${APP_URL}/payment/saspay/status`,
    metadata: { user_id: user.id },
  }

  const response = await fetch(`${API_BASE}/checkout-sessions/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const result = await response.json()
  const checkout = result.data ?? result

  if (!response.ok || result.success === false || !checkout.checkout_url) {
    console.error('[SasPay] Checkout creation failed:', result)
    return NextResponse.json(
      { error: result.error?.message || result.message || 'Could not create SasPay checkout' },
      { status: response.status >= 400 && response.status < 500 ? response.status : 502 },
    )
  }

  return NextResponse.json({ checkoutUrl: checkout.checkout_url, checkoutId: checkout.id })
}