/** Paystack-supported African markets */
const PAYSTACK_COUNTRIES = new Set([
  'NG', 'GH', 'ZA', 'KE', 'CI', 'EG',
])

export function shouldUsePaystack(country: string | null | undefined): boolean {
  if (!country) return false
  return PAYSTACK_COUNTRIES.has(country.toUpperCase())
}
