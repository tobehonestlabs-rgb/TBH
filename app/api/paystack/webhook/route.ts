import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activatePremium, PREMIUM_PRICE_USD } from '@/lib/premiumPayment'

/**
 * Paystack webhook — one-time TBH Pro unlock ($2.99).
 * Pattern adapted from charge.success handler with signature verification.
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const paystackSignature = req.headers.get('x-paystack-signature')
  const secret = (process.env.PAYSTACK_SECRET_KEY ?? '').trim()

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')

  if (hash !== paystackSignature) {
    console.error('[Paystack Webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event !== 'charge.success') {
    return NextResponse.json({ ok: true })
  }

  try {
    const { metadata } = event.data ?? {}
    const customFields = metadata?.custom_fields ?? []
    const paymentType =
      customFields.find((f: { variable_name: string }) => f.variable_name === 'type')?.value ??
      metadata?.type ??
      'premium'

    if (paymentType !== 'premium') {
      console.warn('[Paystack Webhook] Ignoring non-premium payment type:', paymentType)
      return NextResponse.json({ ok: true })
    }

    const uid =
      customFields.find((f: { variable_name: string }) => f.variable_name === 'uid')?.value ??
      metadata?.user_id

    if (!uid) {
      console.error('[Paystack Webhook] Missing user id in metadata')
      return NextResponse.json({ ok: true })
    }

    const amount = (event.data?.amount ?? PREMIUM_PRICE_USD * 100) / 100
    const currency = event.data?.currency ?? 'USD'
    const reference = event.data?.reference ?? ''

    console.log(`[Paystack Webhook] Premium unlock: ${uid} (${amount} ${currency}, ref: ${reference})`)

    await activatePremium(uid, {
      reference,
      provider: 'paystack',
      amount,
      currency,
    })

    console.log(`[Paystack Webhook] Premium activated for ${uid}`)
  } catch (error) {
    console.error('[Paystack Webhook] Processing error:', error)
  }

  return NextResponse.json({ ok: true })
}
