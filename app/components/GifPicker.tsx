'use client'

import { useState, useEffect, useRef } from 'react'

export type GifResult = {
  id: string
  url: string       // full-res GIF
  preview: string   // small preview GIF for thumbnail
}

type Props = {
  onSelect: (gif: GifResult) => void
  onClose:  () => void
}

const API_KEY = (process.env.NEXT_PUBLIC_TENOR_API_KEY ?? '').trim()

export default function GifPicker({ onSelect, onClose }: Props) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<GifResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = async (q: string) => {
    setLoading(true)
    try {
      const base = q.trim()
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${API_KEY}&limit=24&media_filter=gif`
        : `https://tenor.googleapis.com/v2/featured?key=${API_KEY}&limit=24&media_filter=gif`
      const data = await fetch(base).then(r => r.json())
      const gifs: GifResult[] = (data.results ?? []).map((r: any) => ({
        id:      r.id,
        url:     r.media_formats?.gif?.url     ?? '',
        preview: r.media_formats?.tinygif?.url ?? r.media_formats?.gif?.url ?? '',
      }))
      setResults(gifs)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { search('') }, [])

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(query), 420)
    return () => { if (debounce.current) clearTimeout(debounce.current) }
  }, [query])

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-2 rounded-[20px] overflow-hidden"
      style={{ background: '#1A1A1A', boxShadow: '0 -8px 40px rgba(0,0,0,0.5)', maxHeight: '300px', display: 'flex', flexDirection: 'column' }}
    >
      {/* Search bar + close */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search GIFs…"
          className="flex-1 rounded-[10px] bg-white/10 text-white px-3 py-2 text-[14px] outline-none placeholder:text-white/30"
          style={{ fontFamily: 'inherit' }}
        />
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-y-auto px-3 pb-3" style={{ flex: 1 }}>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <p className="text-white/30 text-[13px] text-center py-8">No GIFs found</p>
        ) : (
          <div className="columns-2 gap-2">
            {results.map(gif => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif)}
                className="w-full mb-2 rounded-[10px] overflow-hidden block active:scale-95 transition-transform"
              >
                <img src={gif.preview} alt="" className="w-full h-auto block" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tenor attribution */}
      <div className="px-3 pb-2 flex-shrink-0">
        <p className="text-white/20 text-[10px] text-center">Powered by Tenor</p>
      </div>
    </div>
  )
}
