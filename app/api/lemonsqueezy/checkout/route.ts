import { NextRequest, NextResponse } from 'next/server'
import { getPaymentRequestUser } from '@/lib/paymentRequestUser'

const API_URL = 'https://api.lemonsqueezy.com/v1'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tbhonest.net'

export async function POST(request: NextRequest) {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID
  const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID

  if (!apiKey || !storeId || !variantId) {
    return NextResponse.json({ error: 'LEMON_SQUEEZY_API_KEY, LEMON_SQUEEZY_STORE_ID and LEMON_SQUEEZY_VARIANT_ID are required' }, { status: 500 })
  }

  const user = await getPaymentRequestUser(request)
  if (!user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const response = await fetch(`${API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: { email: user.email, custom: { user_id: user.id } },
          product_options: { redirect_url: `${APP_URL}/payment/lemonsqueezy/status` },
        },
        relationships: {
          store: { data: { type: 'stores', id: String(storeId) } },
          variant: { data: { type: 'variants', id: String(variantId) } },
        },
      },
    }),
  })
  const result = await response.json()
  const checkoutUrl = result.data?.attributes?.url

  if (!response.ok || !checkoutUrl) {
    console.error('[Lemon Squeezy] Checkout creation failed:', result)
    return NextResponse.json(
      { error: result.errors?.[0]?.detail || 'Could not create Lemon Squeezy checkout' },
      { status: response.status >= 400 && response.status < 500 ? response.status : 502 },
    )
  }

  return NextResponse.json({ checkoutUrl, checkoutId: result.data.id })
}