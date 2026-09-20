'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from '@/lib/i18n'

type Props = {
  latitude: number | string
  longitude: number | string
  city?: string
  country?: string
  region?: string
}

function ensureCss(id: string, href: string) {
  if (typeof document === 'undefined') return
  if (!document.getElementById(id)) {
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
}

function createGeoJSONCircle(center: [number, number], radiusInKm: number, points = 64) {
  const [lng, lat] = center
  const coords: [number, number][] = []
  const distanceX = radiusInKm / (111.32 * Math.cos((lat * Math.PI) / 180))
  const distanceY = radiusInKm / 110.574

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI)
    const x = distanceX * Math.cos(theta)
    const y = distanceY * Math.sin(theta)
    coords.push([lng + x, lat + y])
  }
  coords.push(coords[0])

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords],
    },
    properties: {},
  }
}

export default function InsightsMap({
  latitude: rawLat,
  longitude: rawLon,
  city,
  country,
  region,
}: Props) {
  const { t } = useTranslation()
  const inlineContainerRef = useRef<HTMLDivElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  
  const inlineMapRef = useRef<any>(null)
  const fullscreenMapRef = useRef<any>(null)
  
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const latitude = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat ?? ''))
  const longitude = typeof rawLon === 'number' ? rawLon : parseFloat(String(rawLon ?? ''))

  // Fetch token once
  useEffect(() => {
    let cancelled = false
    const loadToken = async () => {
      let resolved =
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
        process.env.NEXT_PUBLIC_MAPBOX_API_KEY ||
        null

      if (!resolved) {
        try {
          const res = await fetch('/api/mapbox-token')
          if (res.ok) {
            const data = await res.json()
            if (data?.token) resolved = data.token
          }
        } catch {}
      }

      if (!cancelled && resolved) {
        setToken(resolved)
      }
    }
    loadToken()
    return () => { cancelled = true }
  }, [])

  // Initialize Map helper
  const initializeMap = useCallback(async (
    container: HTMLDivElement,
    interactive: boolean,
    zoomLevel = 12
  ): Promise<any> => {
    if (isNaN(latitude) || isNaN(longitude)) return null

    // Ensure container is clean and ready
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id
    }
    container.innerHTML = ''

    // 1. Try Mapbox GL if token exists
    if (token && token.trim().length > 0) {
      try {
        ensureCss('mapbox-gl-css', 'https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css')
        const mapboxgl = (await import('mapbox-gl')).default
        mapboxgl.accessToken = token

        const map = new mapboxgl.Map({
          container,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [longitude, latitude],
          zoom: zoomLevel,
          minZoom: 2,
          maxZoom: 19,
          interactive,
          attributionControl: false,
          scrollZoom: interactive,
          dragPan: interactive,
          touchZoomRotate: interactive,
          doubleClickZoom: interactive,
        })

        map.on('load', () => {
          try {
            const circleGeoJSON = createGeoJSONCircle([longitude, latitude], 2.4)

            // Circle Area Source
            map.addSource('sender-circle', {
              type: 'geojson',
              data: circleGeoJSON,
            })

            // Wide ambient glow line
            map.addLayer({
              id: 'sender-circle-glow',
              type: 'line',
              source: 'sender-circle',
              paint: {
                'line-color': '#FFFFFF',
                'line-width': 8,
                'line-opacity': 0.35,
                'line-blur': 6,
              },
            })

            // Crisp glowing stroke
            map.addLayer({
              id: 'sender-circle-stroke',
              type: 'line',
              source: 'sender-circle',
              paint: {
                'line-color': '#FFFFFF',
                'line-width': 2,
                'line-opacity': 0.9,
              },
            })

            // Translucent white fill
            map.addLayer({
              id: 'sender-circle-fill',
              type: 'fill',
              source: 'sender-circle',
              paint: {
                'fill-color': '#FFFFFF',
                'fill-opacity': 0.16,
              },
            })

            // White glowing center pulse marker
            const el = document.createElement('div')
            el.className = 'tbh-white-glow-wrapper'
            el.innerHTML = `
              <div class="tbh-glow-pin">
                <div class="tbh-pulse-ring"></div>
                <div class="tbh-pulse-ring-2"></div>
                <div class="tbh-glow-aura"></div>
                <div class="tbh-white-dot"></div>
              </div>
            `

            new mapboxgl.Marker({ element: el })
              .setLngLat([longitude, latitude])
              .addTo(map)
          } catch (err) {
            console.warn('[InsightsMap] Failed to add Mapbox layers:', err)
          }
        })

        return map
      } catch (mapboxError) {
        console.warn('[InsightsMap] Mapbox GL failed, falling back to Leaflet:', mapboxError)
      }
    }

    // 2. Leaflet Fallback (Dark CARTO tiles with glowing white dot & position area)
    try {
      ensureCss('leaflet-css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css')
      const { default: L } = await import('leaflet')

      // Ensure container has clean state
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id
      }
      container.innerHTML = ''

      const map = L.map(container, {
        center: [latitude, longitude],
        zoom: zoomLevel,
        minZoom: 2,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Glowing position area (approximate sender zone)
      const areaCircle = L.circle([latitude, longitude], {
        radius: 2400,
        color: '#FFFFFF',
        fillColor: '#FFFFFF',
        fillOpacity: 0.12,
        weight: 1.5,
        opacity: 0.85,
        dashArray: '5, 8',
        className: 'tbh-glow-area-circle',
      }).addTo(map)

      // White glowing center dot marker
      const glowDotIcon = L.divIcon({
        className: 'tbh-white-glow-wrapper',
        html: `
          <div class="tbh-glow-pin">
            <div class="tbh-pulse-ring"></div>
            <div class="tbh-pulse-ring-2"></div>
            <div class="tbh-glow-aura"></div>
            <div class="tbh-white-dot"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      })

      L.marker([latitude, longitude], {
        icon: glowDotIcon,
        interactive: false,
      }).addTo(map)

      // Frame position area and glow dot nicely
      map.fitBounds(areaCircle.getBounds(), {
        padding: interactive ? [40, 40] : [15, 15],
        maxZoom: 13,
        animate: false,
      })

      return map
    } catch (leafletError) {
      console.error('[InsightsMap] Leaflet failed:', leafletError)
      return null
    }
  }, [latitude, longitude, token])

  // Setup inline map
  useEffect(() => {
    if (!inlineContainerRef.current) return
    let cancelled = false
    let ro: ResizeObserver | null = null

    if ((inlineContainerRef.current as any)._leaflet_id) {
      delete (inlineContainerRef.current as any)._leaflet_id
    }
    inlineContainerRef.current.innerHTML = ''

    initializeMap(inlineContainerRef.current, false, 12).then(map => {
      if (cancelled) {
        map?.remove?.()
        return
      }
      inlineMapRef.current = map

      const invalidate = () => {
        if (cancelled || !map) return
        if (typeof map.resize === 'function') map.resize()
        if (typeof map.invalidateSize === 'function') {
          map.invalidateSize({ pan: false })
          if (typeof map.setView === 'function') {
            map.setView([latitude, longitude], 12)
          }
        }
      }

      // Staggered size invalidation passes to handle sheet slide transition
      setTimeout(invalidate, 60)
      setTimeout(invalidate, 180)
      setTimeout(invalidate, 360)

      if (typeof ResizeObserver !== 'undefined' && inlineContainerRef.current) {
        ro = new ResizeObserver(() => invalidate())
        ro.observe(inlineContainerRef.current)
      }
    })

    return () => {
      cancelled = true
      if (ro) ro.disconnect()
      if (inlineMapRef.current) {
        inlineMapRef.current.remove?.()
        inlineMapRef.current = null
      }
    }
  }, [initializeMap])

  // Setup fullscreen map when opened
  useEffect(() => {
    if (!showFullscreen || !fullscreenContainerRef.current) return
    let cancelled = false
    let ro: ResizeObserver | null = null

    if ((fullscreenContainerRef.current as any)._leaflet_id) {
      delete (fullscreenContainerRef.current as any)._leaflet_id
    }
    fullscreenContainerRef.current.innerHTML = ''

    initializeMap(fullscreenContainerRef.current, true, 13).then(map => {
      if (cancelled) {
        map?.remove?.()
        return
      }
      fullscreenMapRef.current = map

      const invalidate = (center = false) => {
        if (cancelled || !map) return
        if (typeof map.resize === 'function') map.resize()
        if (typeof map.invalidateSize === 'function') {
          map.invalidateSize({ pan: false })
          if (center && typeof map.setView === 'function') {
            map.setView([latitude, longitude], 13)
          }
        }
      }

      setTimeout(() => invalidate(true), 60)
      setTimeout(() => invalidate(true), 200)

      if (typeof ResizeObserver !== 'undefined' && fullscreenContainerRef.current) {
        ro = new ResizeObserver(() => invalidate(false))
        ro.observe(fullscreenContainerRef.current)
      }
    })

    // Escape key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      cancelled = true
      window.removeEventListener('keydown', handleKeyDown)
      if (ro) ro.disconnect()
      if (fullscreenMapRef.current) {
        fullscreenMapRef.current.remove?.()
        fullscreenMapRef.current = null
      }
    }
  }, [showFullscreen, initializeMap])

  // Fullscreen zoom in / zoom out / center controls
  const handleZoomIn = () => {
    const map = fullscreenMapRef.current as any
    if (typeof map?.zoomIn === 'function') {
      map.zoomIn()
    }
  }

  const handleZoomOut = () => {
    const map = fullscreenMapRef.current as any
    if (typeof map?.zoomOut === 'function') {
      map.zoomOut()
    }
  }

  const handleCenter = () => {
    const map = fullscreenMapRef.current as any
    if (!map) return
    if (token && typeof map?.flyTo === 'function') {
      // Mapbox flyTo
      map.flyTo({ center: [longitude, latitude], zoom: 13, speed: 1.2 })
    } else if (typeof map?.flyTo === 'function') {
      // Leaflet flyTo
      map.flyTo([latitude, longitude], 13, { duration: 1.0 })
    } else if (typeof map?.setView === 'function') {
      map.setView([latitude, longitude], 13)
    }
  }

  const locationTitle = [city, region, country].filter(Boolean).join(', ')

  if (isNaN(latitude) || isNaN(longitude)) {
    return (
      <div className="w-full rounded-[22px] mb-5 flex items-center justify-center border border-[#EBEBEB]" style={{ height: 80 }}>
        <p className="text-[13px] text-[#ADADAD]">{t.locationMapNotAvailable || 'Carte de localisation indisponible'}</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes tbh-pulse-wave {
          0% {
            transform: scale(0.35);
            opacity: 0.95;
            border-width: 2px;
          }
          60% {
            opacity: 0.45;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes tbh-glow-breathe {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.3);
            opacity: 1;
          }
        }

        .leaflet-container {
          background: #121214 !important;
          outline: none;
          font-family: inherit;
        }

        .leaflet-div-icon.tbh-white-glow-wrapper,
        .tbh-white-glow-wrapper {
          background: transparent !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 44px !important;
          height: 44px !important;
          pointer-events: none !important;
        }

        .tbh-glow-pin {
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .tbh-pulse-ring {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.85);
          animation: tbh-pulse-wave 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          pointer-events: none;
        }

        .tbh-pulse-ring-2 {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.85);
          animation: tbh-pulse-wave 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          animation-delay: 1.2s;
          pointer-events: none;
        }

        .tbh-glow-aura {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 75%);
          filter: blur(3px);
          animation: tbh-glow-breathe 2.4s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .tbh-white-dot {
          position: relative;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2.5px solid #FFFFFF;
          box-shadow: 0 0 8px #FFFFFF, 0 0 18px rgba(255, 255, 255, 0.95), 0 0 32px rgba(255, 255, 255, 0.8);
          z-index: 2;
        }

        .tbh-glow-area-circle {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
        }
      `}</style>

      {/* ── Inline Map Container ── */}
      <div className="w-full flex flex-col">
        <div
          onClick={() => setShowFullscreen(true)}
          className="w-full relative overflow-hidden group cursor-pointer transition-all duration-200 active:scale-[0.98]"
          style={{
            height: '170px',
            borderRadius: '22px',
            background: '#121214',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
          title={t.tapToFullscreen || 'Appuyez pour le plein écran'}
        >
          <div
            ref={inlineContainerRef}
            className="w-full h-full pointer-events-none"
          />

          {/* Subtle click overlay hint */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors flex items-center justify-center pointer-events-none" />

          {/* Mini expand badge in corner */}
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-md pointer-events-none">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            <span className="text-[10px] font-bold text-white tracking-wide uppercase">Zoom</span>
          </div>
        </div>

        {/* Localized "Tap to fullscreen" button below the map */}
        <button
          type="button"
          onClick={() => setShowFullscreen(true)}
          className="w-full mt-2 py-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#8E8E93] hover:text-[#0D0D0D] active:opacity-60 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
          <span>{t.tapToFullscreen || 'Appuyez pour le plein écran'}</span>
        </button>
      </div>

      {/* ── Fullscreen Interactive Modal ── */}
      {showFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col animate-in fade-in duration-200 select-none">
          {/* Top Floating Glass Header */}
          <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4 flex items-center justify-between pointer-events-none">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setShowFullscreen(false)}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white font-bold text-[14px] backdrop-blur-xl border border-white/15 shadow-2xl active:scale-95 transition-all"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t.back || 'Retour'}</span>
            </button>

            {/* Location Pill */}
            {locationTitle && (
              <div className="pointer-events-auto px-3.5 py-2 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 shadow-2xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[13px] font-bold text-white tracking-tight truncate max-w-[200px]">
                  {locationTitle}
                </span>
              </div>
            )}
          </div>

          {/* Fullscreen Interactive Map Container */}
          <div
            ref={fullscreenContainerRef}
            className="w-full h-full flex-1 bg-[#121214]"
          />

          {/* Floating Map Zoom & Target Controls (Right Side) */}
          <div className="absolute right-4 bottom-24 z-20 flex flex-col gap-2.5">
            {/* Zoom In */}
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="w-11 h-11 rounded-full bg-black/75 hover:bg-black/95 text-white flex items-center justify-center backdrop-blur-xl border border-white/15 shadow-2xl active:scale-90 transition-all font-bold text-[20px]"
            >
              +
            </button>

            {/* Zoom Out */}
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="w-11 h-11 rounded-full bg-black/75 hover:bg-black/95 text-white flex items-center justify-center backdrop-blur-xl border border-white/15 shadow-2xl active:scale-90 transition-all font-bold text-[22px]"
            >
              −
            </button>

            {/* Re-center GPS Target */}
            <button
              type="button"
              onClick={handleCenter}
              aria-label="Center map"
              className="w-11 h-11 rounded-full bg-black/75 hover:bg-black/95 text-white flex items-center justify-center backdrop-blur-xl border border-white/15 shadow-2xl active:scale-90 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </button>
          </div>

          {/* Bottom Info Floating Pill */}
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-black/75 backdrop-blur-xl border border-white/15 shadow-2xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/70" />
              <span className="text-[12px] font-semibold text-white/90 whitespace-nowrap">
                {t.approximateInfo || 'Zone approximative de l’expéditeur'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
