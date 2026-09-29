/** Countries currently listed for SasPay mobile-money checkout */
const SASPAY_COUNTRIES = new Set([
  'CI', 'SN', 'TG', 'BJ', 'CM', 'BF',
])

export function shouldUseSasPay(country: string | null | undefined): boolean {
  if (!country) return false
  return SASPAY_COUNTRIES.has(country.toUpperCase())
}
