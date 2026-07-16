import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getServerSupabase } from '@/lib/serverSupabase'

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference')
  if (!reference) return NextResponse.json({ error: 'No reference' }, { status: 400 })

  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${(process.env.NEXT_SECRET_PAYSTACK_API ?? '').trim()}` },
  })
  const data = await res.json()

  if (!data.status || data.data?.status !== 'success') {
    return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
  }

  await supabaseAdmin
    .from('users_table')
    .update({
      active_subscription: true,
      subscription_code: data.data?.subscription?.subscription_code ?? null,
    })
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
