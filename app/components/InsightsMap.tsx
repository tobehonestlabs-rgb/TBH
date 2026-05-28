'use client'

import { useEffect, useRef } from 'react'

type Props = {
  latitude: number
  longitude: number
}

export default function InsightsMap({ latitude, longitude }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || !containerRef.current) return

    let map: mapboxgl.Map

    // Dynamic import keeps the heavy bundle out of the initial load
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = token

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [longitude, latitude],
        zoom: 9,
        interactive: false,
        attributionControl: false,
      })

      map.on('load', () => {
        map.addSource('location', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [longitude, latitude] },
            properties: {},
          },
        })

        // Outer glow
        map.addLayer({
          id: 'location-glow',
          type: 'circle',
          source: 'location',
          paint: {
            'circle-radius': 60,
            'circle-color': '#7C3AED',
            'circle-opacity': 0.18,
            'circle-blur': 1,
          },
        })

        // Inner pulse
        map.addLayer({
          id: 'location-core',
          type: 'circle',
          source: 'location',
          paint: {
            'circle-radius': 18,
            'circle-color': '#A855F7',
            'circle-opacity': 0.45,
            'circle-blur': 0.5,
          },
        })
      })
    })

    return () => { map?.remove() }
  }, [latitude, longitude])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '170px', borderRadius: '22px', overflow: 'hidden' }}
    />
  )
}
