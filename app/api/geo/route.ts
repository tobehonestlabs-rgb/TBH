export const runtime = 'edge'

function isPrivateIp(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    ip.startsWith('fc00:') ||
    ip.startsWith('fe80:')
  )
}

export async function GET(req: Request) {
  let country   = req.headers.get('x-vercel-ip-country') ?? null
  let city      = req.headers.get('x-vercel-ip-city') ?? null
  let region    = req.headers.get('x-vercel-ip-country-region') ?? null
  let latitude  = req.headers.get('x-vercel-ip-latitude') ?? null
  let longitude = req.headers.get('x-vercel-ip-longitude') ?? null

  // If Vercel geolocation headers are missing (e.g. running on localhost, Netlify, etc.)
  if (!latitude || !longitude || !city) {
    const rawIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      null

    try {
      const url = rawIp && !isPrivateIp(rawIp)
        ? `http://ip-api.com/json/${rawIp}?fields=status,country,regionName,city,lat,lon`
        : 'http://ip-api.com/json/?fields=status,country,regionName,city,lat,lon'

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        if (data && data.status === 'success') {
          country   = country   || data.country || null
          city      = city      || data.city || null
          region    = region    || data.regionName || null
          latitude  = latitude  || (data.lat != null ? String(data.lat) : null)
          longitude = longitude || (data.lon != null ? String(data.lon) : null)
        }
      }
    } catch {
      // Fallback silently if external lookup fails or times out
    }
  }

  return Response.json({
    country,
    city,
    region,
    latitude,
    longitude,
  })
}

