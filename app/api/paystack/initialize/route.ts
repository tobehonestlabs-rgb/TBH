import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  const reference = `tbh_${user.id.slice(0, 8)}_${Date.now()}`

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${(process.env.PAYSTACK_SECRET_KEY ?? '').trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: 299 * 100,
      currency: 'USD',
      reference,
    }),
  })
  const data = await res.json()
  if (!data.status) return NextResponse.json({ error: data.message }, { status: 400 })
  return NextResponse.json({ reference, access_code: data.data?.access_code, authorization_url: data.data?.authorization_url })
}
