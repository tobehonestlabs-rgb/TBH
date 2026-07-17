import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  const reference = `tbh_${user.id.slice(0, 8)}_${Date.now()}`
  const planCode = (process.env.PAYSTACK_PLAN_CODE ?? '').trim()
  const secretKey = (process.env.PAYSTACK_SECRET_KEY ?? '').trim()

  console.log('[Paystack Initialize] Debug info:')
  console.log('  - Plan code:', planCode ? `SET (${planCode})` : 'NOT SET')
  console.log('  - Secret key:', secretKey ? `SET (starts with: ${secretKey.slice(0, 8)})` : 'NOT SET')

  const requestBody: any = {
    email,
    reference,
    metadata: {
      user_id: user.id,
      user_email: email,
    },
  }

  if (planCode) {
    requestBody.plan = planCode
  } else {
    // Fallback to a fixed amount if no plan code is set (for testing)
    requestBody.amount = 299 * 100 // 299 USD in cents
    requestBody.currency = 'USD'
  }

  console.log('[Paystack Initialize] Request body:', requestBody)

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  const data = await res.json()
  console.log('[Paystack Initialize] Response:', data)
  
  if (!data.status) return NextResponse.json({ error: data.message, details: data }, { status: 400 })
  return NextResponse.json({ reference, access_code: data.data?.access_code, authorization_url: data.data?.authorization_url })
}
