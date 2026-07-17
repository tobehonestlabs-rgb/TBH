import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'
import { activatePremium } from '@/lib/premiumPayment'

/** Client-side fallback verification after Paystack inline checkout. */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference')
  if (!reference) return NextResponse.json({ error: 'No reference' }, { status: 400 })

  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${(process.env.PAYSTACK_SECRET_KEY ?? '').trim()}` },
  })
  const data = await res.json()

  if (!data.status || data.data?.status !== 'success') {
    return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
  }

  const amount = (data.data?.amount ?? 0) / 100
  const currency = data.data?.currency ?? 'USD'

  await activatePremium(user.id, {
    reference,
    provider: 'paystack',
    amount,
    currency,
  })

  return NextResponse.json({ ok: true })
}
