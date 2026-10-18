import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// In-memory cache for reverse geocode lookups keyed by rounded coordinates
const cache = new Map<string, { approximateLocation: string; district: string; city: string }>()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawLat = searchParams.get('lat')
    const rawLon = searchParams.get('lon')
    const lang = searchParams.get('lang') || 'fr'

    if (!rawLat || !rawLon) {
      return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 })
    }

    const latNum = parseFloat(rawLat)
    const lonNum = parseFloat(rawLon)

    if (isNaN(latNum) || isNaN(lonNum) || Math.abs(latNum) > 90 || Math.abs(lonNum) > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }

    // Fuzz coordinates to ~2 decimal places (~1.1 km resolution = neighborhood level)
    // Never expose exact pinpoint coordinates
    const fuzzedLat = Math.round(latNum * 100) / 100
    const fuzzedLon = Math.round(lonNum * 100) / 100
    const cacheKey = `${fuzzedLat.toFixed(2)},${fuzzedLon.toFixed(2)},${lang}`

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!
      return NextResponse.json({
        ...cached,
        fuzzedLatitude: fuzzedLat,
        fuzzedLongitude: fuzzedLon,
      })
    }

    let district = ''
    let city = ''

    // 1. Try BigDataCloud free client reverse geocoding API
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${fuzzedLat}&longitude=${fuzzedLon}&localityLanguage=${lang}`
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 3000)
      const res = await fetch(bdcUrl, { signal: ctrl.signal })
      clearTimeout(timer)

      if (res.ok) {
        const data = await res.json()
        const rawLocality = (data.locality || '').trim()
        const rawCity = (data.city || data.principalSubdivision || '').trim()

        if (rawLocality && rawCity && rawLocality.toLowerCase() !== rawCity.toLowerCase()) {
          district = rawLocality
          city = rawCity
        } else if (rawLocality) {
          district = rawLocality
          city = rawCity || data.countryName || ''
        } else if (rawCity) {
          city = rawCity
        }

        // If locality was equal to city, check administrative subdivisions for commune/arrondissement/district
        if ((!district || district.toLowerCase() === city.toLowerCase()) && Array.isArray(data.localityInfo?.administrative)) {
          const admins = data.localityInfo.administrative
          // Pick the most specific administrative level (order highest, usually adminLevel 8 or 9)
          for (let i = admins.length - 1; i >= 0; i--) {
            const admin = admins[i]
            if (admin?.name && admin.name.toLowerCase() !== city.toLowerCase() && (admin.adminLevel >= 7 || admin.order >= 6)) {
              district = admin.name.trim()
              break
            }
          }
        }
      }
    } catch {
      // Fallback to next provider
    }

    // 2. If district is still not found, try OpenStreetMap Nominatim with zoom=14 (neighborhood/suburb)
    if (!district) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${fuzzedLat}&lon=${fuzzedLon}&zoom=14`
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 3000)
        const res = await fetch(nomUrl, {
          signal: ctrl.signal,
          headers: { 'User-Agent': 'TBHApp/1.0' },
        })
        clearTimeout(timer)

        if (res.ok) {
          const data = await res.json()
          const addr = data.address || {}
          const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.district || ''
          const nomCity = addr.city || addr.town || addr.municipality || addr.state || ''

          if (suburb) district = suburb.trim()
          if (!city && nomCity) city = nomCity.trim()
        }
      } catch {
        // Silent fallback
      }
    }

    // Build the clean approximate location label (e.g. "Cocody, Abidjan")
    let approximateLocation = ''
    if (district && city && district.toLowerCase() !== city.toLowerCase()) {
      approximateLocation = `${district}, ${city}`
    } else if (district) {
      approximateLocation = district
    } else if (city) {
      approximateLocation = city
    } else {
      approximateLocation = 'Localisation approximative'
    }

    const result = {
      approximateLocation,
      district,
      city,
    }

    if (cache.size > 2000) cache.clear()
    cache.set(cacheKey, result)

    return NextResponse.json({
      ...result,
      fuzzedLatitude: fuzzedLat,
      fuzzedLongitude: fuzzedLon,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Reverse geocoding failed' }, { status: 500 })
  }
}
