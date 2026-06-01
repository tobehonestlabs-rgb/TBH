import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature')
  const secret = (process.env.PAYSTACK_SECRET_KEY ?? '').trim()
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const email: string | undefined = event.data?.customer?.email

  if (event.event === 'charge.success' || event.event === 'subscription.create') {
    if (email) {
      await supabaseAdmin.from('users_table').update({ active_subscription: true }).eq('email', email)
    }
  } else if (
    event.event === 'subscription.disable' ||
    event.event === 'subscription.not_renew' ||
    event.event === 'invoice.payment_failed'
  ) {
    if (email) {
      await supabaseAdmin.from('users_table').update({ active_subscription: false }).eq('email', email)
    }
  }

  return NextResponse.json({ ok: true })
}
