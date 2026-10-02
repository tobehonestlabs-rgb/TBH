/** Countries currently supported by GeniusPay's listed mobile-money routes */
const GENIUSPAY_COUNTRIES = new Set([
  'BJ', 'BF', 'CM', 'CD', 'CG', 'CI', 'GA', 'KE', 'RW', 'SN', 'SL', 'TG', 'UG', 'ZM',
])

export function shouldUseGeniusPay(country: string | null | undefined): boolean {
  if (!country) return false
  return GENIUSPAY_COUNTRIES.has(country.toUpperCase())
}
