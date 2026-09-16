'use client'

import { useEffect, useRef, useState } from 'react'

type Props = { latitude: number; longitude: number }

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

export default function InsightsMap({ latitude, longitude }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [, setMapType] = useState<'mapbox' | 'leaflet' | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    const initMap = async () => {
      // 1. Check for Mapbox token (client env or server endpoint)
      let token =
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
        process.env.NEXT_PUBLIC_MAPBOX_API_KEY ||
        null

      if (!token) {
        try {
          const res = await fetch('/api/mapbox-token')
          if (res.ok) {
            const data = await res.json()
            if (data?.token) {
              token = data.token
            }
          }
        } catch {
          // Token fetch failed
        }
      }

      if (cancelled || !containerRef.current) return

      // Clean up previous map if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove?.()
        mapInstanceRef.current = null
      }

      // 2. If Mapbox token is available, initialize Mapbox GL
      if (token && token.trim().length > 0) {
        try {
          ensureCss('mapbox-gl-css', 'https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css')
          const mapboxgl = (await import('mapbox-gl')).default
          if (cancelled || !containerRef.current) return

          mapboxgl.accessToken = token

          const map = new mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [longitude, latitude],
            zoom: 11,
            interactive: false,
            attributionControl: false,
          })

          map.on('load', () => {
            if (cancelled || !map) return
            try {
              const circleGeoJSON = createGeoJSONCircle([longitude, latitude], 2.8)

              map.addSource('sender-circle', {
                type: 'geojson',
                data: circleGeoJSON,
              })

              map.addLayer({
                id: 'sender-circle-fill',
                type: 'fill',
                source: 'sender-circle',
                paint: {
                  'fill-color': '#A855F7',
                  'fill-opacity': 0.22,
                },
              })

              map.addLayer({
                id: 'sender-circle-stroke',
                type: 'line',
                source: 'sender-circle',
                paint: {
                  'line-color': '#C084FC',
                  'line-width': 1.8,
                  'line-opacity': 0.75,
                },
              })

              // Glowing center pulse marker
              const el = document.createElement('div')
              el.className = 'insight-glowing-pin'
              el.style.width = '14px'
              el.style.height = '14px'
              el.style.borderRadius = '50%'
              el.style.backgroundColor = '#C084FC'
              el.style.boxShadow = '0 0 16px #A855F7, 0 0 32px #7C3AED'
              el.style.border = '2px solid #FFFFFF'

              new mapboxgl.Marker({ element: el })
                .setLngLat([longitude, latitude])
                .addTo(map)
            } catch (err) {
              console.warn('[InsightsMap] Failed to add Mapbox layers:', err)
            }
          })

          mapInstanceRef.current = map
          setMapType('mapbox')
          return
        } catch (mapboxError) {
          console.warn('[InsightsMap] Mapbox init error, falling back to Leaflet:', mapboxError)
        }
      }

      // 3. Fallback to Leaflet + CartoDB Dark Matter
      try {
        ensureCss('leaflet-css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css')
        const { default: L } = await import('leaflet')
        if (cancelled || !containerRef.current) return

        const map = L.map(containerRef.current, {
          center: [latitude, longitude],
          zoom: 11,
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
        })

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(map)

        // Glowing approximate-location circle
        L.circle([latitude, longitude], {
          radius: 2800,
          color: '#C084FC',
          fillColor: '#7C3AED',
          fillOpacity: 0.22,
          weight: 1.5,
          opacity: 0.7,
        }).addTo(map)

        mapInstanceRef.current = map
        setMapType('leaflet')
      } catch (leafletError) {
        console.error('[InsightsMap] Leaflet init error:', leafletError)
      }
    }

    initMap()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove?.()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '170px',
        borderRadius: '22px',
        overflow: 'hidden',
        position: 'relative',
        background: '#121214',
      }}
    />
  )
}
