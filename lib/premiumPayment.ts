import { supabaseAdmin } from '@/lib/supabaseAdmin'

/** One-time TBH Pro unlock — $2.99 USD */
export const PREMIUM_PRICE_USD = 2.99
export const PREMIUM_PRICE_CENTS = 299

export type PremiumProvider = 'paystack' | 'paypal'

export async function activatePremium(
  userId: string,
  opts: {
    reference: string
    provider: PremiumProvider
    amount: number
    currency: string
  },
) {
  const now = new Date().toISOString()

  const { error } = await supabaseAdmin
    .from('users_table')
    .update({
      active_subscription: true,
      subscription_code: `${opts.provider}:${opts.reference}`,
      subscription_start: now,
      subscription_end: null,
    })
    .eq('user_id', userId)

  if (error) throw error
}
