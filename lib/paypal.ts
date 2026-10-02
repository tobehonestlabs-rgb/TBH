const PAYPAL_API_BASE =
  (process.env.PAYPAL_MODE ?? 'sandbox') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getPayPalAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const clientId = (process.env.PAYPAL_CLIENT_ID ?? '').trim()
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET ?? '').trim()
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description ?? 'PayPal auth failed')
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}

export { PAYPAL_API_BASE }
