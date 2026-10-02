import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'
import { getPayPalAccessToken, PAYPAL_API_BASE } from '@/lib/paypal'
import { activatePremium } from '@/lib/premiumPayment'

/** PayPal return URL — captures payment and activates premium. */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('token')
  if (!orderId) {
    return NextResponse.redirect(new URL('/home?payment=failed', req.url))
  }

  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/sign-up', req.url))
  }

  try {
    const token = await getPayPalAccessToken()

    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()
    if (!res.ok || data.status !== 'COMPLETED') {
      console.error('[PayPal Capture]', data)
      return NextResponse.redirect(new URL('/home?payment=failed', req.url))
    }

    const unit = data.purchase_units?.[0]
    const customId = unit?.payments?.captures?.[0]?.custom_id ?? unit?.custom_id ?? user.id
    const captureId = unit?.payments?.captures?.[0]?.id ?? orderId
    const amount = parseFloat(unit?.payments?.captures?.[0]?.amount?.value ?? '2.99')
    const currency = unit?.payments?.captures?.[0]?.amount?.currency_code ?? 'USD'

    if (customId !== user.id) {
      console.error('[PayPal Capture] User mismatch:', customId, user.id)
      return NextResponse.redirect(new URL('/home?payment=failed', req.url))
    }

    await activatePremium(user.id, {
      reference: captureId,
      provider: 'paypal',
      amount,
      currency,
    })

    return NextResponse.redirect(new URL('/home?payment=success', req.url))
  } catch (error) {
    console.error('[PayPal Capture] Error:', error)
    return NextResponse.redirect(new URL('/home?payment=failed', req.url))
  }
}
