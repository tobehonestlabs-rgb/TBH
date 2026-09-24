import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'
import { getPayPalAccessToken, PAYPAL_API_BASE } from '@/lib/paypal'
import { PREMIUM_PRICE_USD } from '@/lib/premiumPayment'

/** Create a PayPal order for one-time TBH Pro unlock ($2.99). */
export async function POST(req: NextRequest) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const origin = req.nextUrl.origin
  const token = await getPayPalAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: PREMIUM_PRICE_USD.toFixed(2),
          },
          custom_id: user.id,
          description: 'TBH Pro — lifetime premium unlock',
        },
      ],
      application_context: {
        brand_name: 'TBH',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${origin}/api/paypal/capture`,
        cancel_url: `${origin}/home?payment=cancelled`,
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    console.error('[PayPal Create Order]', data)
    return NextResponse.json({ error: 'Could not create PayPal order' }, { status: 400 })
  }

  const approvalUrl = data.links?.find((l: { rel: string }) => l.rel === 'approve')?.href
  if (!approvalUrl) {
    return NextResponse.json({ error: 'No PayPal approval URL' }, { status: 400 })
  }

  return NextResponse.json({ orderId: data.id, approvalUrl })
}
