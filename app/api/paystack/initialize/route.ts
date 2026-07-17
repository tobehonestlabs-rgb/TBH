import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'
import { PREMIUM_PRICE_CENTS } from '@/lib/premiumPayment'

/** Initialize a one-time Paystack charge for TBH Pro ($2.99). */
export async function POST(req: NextRequest) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const secretKey = (process.env.PAYSTACK_SECRET_KEY ?? '').trim()
  if (!secretKey) {
    return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
  }

  const reference = `tbh_${user.id.slice(0, 8)}_${Date.now()}`

  const requestBody = {
    email,
    amount: PREMIUM_PRICE_CENTS,
    currency: 'USD',
    reference,
    metadata: {
      user_id: user.id,
      type: 'premium',
      custom_fields: [
        { display_name: 'User ID', variable_name: 'uid', value: user.id },
        { display_name: 'Type', variable_name: 'type', value: 'premium' },
      ],
    },
  }

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const data = await res.json()
  if (!data.status) {
    return NextResponse.json({ error: data.message, details: data }, { status: 400 })
  }

  return NextResponse.json({
    reference,
    access_code: data.data?.access_code,
    authorization_url: data.data?.authorization_url,
  })
}
