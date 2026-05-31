'use client'

import { useEffect, useRef } from 'react'

type Props = { latitude: number; longitude: number }

export default function InsightsMap({ latitude, longitude }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    import('leaflet').then(({ default: L }) => {
      if (cancelled || !containerRef.current) return
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }

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

      // Glowing approximate-location circle — no exact pin
      L.circle([latitude, longitude], {
        radius: 3000,
        color: '#A855F7',
        fillColor: '#7C3AED',
        fillOpacity: 0.22,
        weight: 1.5,
        opacity: 0.6,
      }).addTo(map)

      mapRef.current = map
    })

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [latitude, longitude])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '170px', borderRadius: '22px', overflow: 'hidden' }}
    />
  )
}
