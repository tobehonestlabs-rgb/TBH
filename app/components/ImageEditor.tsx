'use client'

import { useRef, useState, useEffect } from 'react'

type Tool = 'pen' | 'censor' | 'crop'

interface Props {
  src: string
  onDone: (blob: Blob, dataUrl: string) => void
  onCancel: () => void
  accentColor?: string
  font?: string
}

const PEN_COLORS = ['#000000', '#FFFFFF', '#ff3f1d', '#FFD600', '#00D4FF']

export default function ImageEditor({
  src,
  onDone,
  onCancel,
  accentColor = '#ff3f1d',
  font = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const [tool, setTool] = useState<Tool>('pen')
  const [penColor, setPenColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(20)
  const [cropSel, setCropSel] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 })

  const isDown = useRef(false)
  const anchor = useRef<{ x: number; y: number } | null>(null)
  const lastPt = useRef<{ x: number; y: number } | null>(null)
  const historyRef = useRef<ImageData[]>([])

  // ── Load image onto canvas ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = new Image()
    img.onload = () => {
      const MAX = 1080
      const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      pushHistory(ctx, canvas)
    }
    img.crossOrigin = 'anonymous'
    img.src = src
  }, [src])

  // ── Track display size for crop overlay ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(entries => {
      const e = entries[0]
      if (e) setDisplaySize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // ── History helpers ───────────────────────────────────────────────────────
  const pushHistory = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (historyRef.current.length >= 30) historyRef.current.shift()
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
  }

  const undo = () => {
    const canvas = canvasRef.current
    if (!canvas || historyRef.current.length < 2) return
    historyRef.current.pop()
    const prev = historyRef.current[historyRef.current.length - 1]
    canvas.getContext('2d')!.putImageData(prev, 0, 0)
  }

  // ── Coordinate helpers ────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const sx = canvas.width / rect.width
    const sy = canvas.height / rect.height
    let cx: number, cy: number
    if ('touches' in e) {
      const t = e.touches[0] ?? e.changedTouches[0]
      if (!t) return null
      cx = t.clientX; cy = t.clientY
    } else {
      cx = (e as React.MouseEvent).clientX
      cy = (e as React.MouseEvent).clientY
    }
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy }
  }

  // ── Pixelate (censor) brush ───────────────────────────────────────────────
  const applyPixelate = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    const blockSize = Math.max(8, Math.round(r / 3))
    const x = Math.max(0, Math.round(cx - r))
    const y = Math.max(0, Math.round(cy - r))
    const w = Math.min(ctx.canvas.width - x, Math.round(r * 2))
    const h = Math.min(ctx.canvas.height - y, Math.round(r * 2))
    if (w < 2 || h < 2) return

    const tw = Math.max(1, Math.round(w / blockSize))
    const th = Math.max(1, Math.round(h / blockSize))
    const tmp = document.createElement('canvas')
    tmp.width = tw; tmp.height = th
    const tc = tmp.getContext('2d')!
    tc.imageSmoothingEnabled = false
    tc.drawImage(ctx.canvas, x, y, w, h, 0, 0, tw, th)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tmp, 0, 0, tw, th, x, y, w, h)
    ctx.imageSmoothingEnabled = true
  }

  // ── Pointer events ────────────────────────────────────────────────────────
  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const pos = getPos(e)
    if (!pos) return
    const canvas = canvasRef.current
    if (!canvas) return
    isDown.current = true
    anchor.current = pos
    lastPt.current = pos

    if (tool === 'pen') {
      const ctx = canvas.getContext('2d')!
      pushHistory(ctx, canvas)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    } else if (tool === 'censor') {
      const ctx = canvas.getContext('2d')!
      pushHistory(ctx, canvas)
      applyPixelate(ctx, pos.x, pos.y, brushSize)
    } else if (tool === 'crop') {
      setCropSel({ x: pos.x, y: pos.y, w: 0, h: 0 })
    }
  }

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDown.current) return
    e.preventDefault()
    const pos = getPos(e)
    if (!pos) return
    const canvas = canvasRef.current
    if (!canvas) return

    if (tool === 'pen') {
      const ctx = canvas.getContext('2d')!
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = penColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    } else if (tool === 'censor' && lastPt.current) {
      const dx = pos.x - lastPt.current.x
      const dy = pos.y - lastPt.current.y
      if (Math.sqrt(dx * dx + dy * dy) >= brushSize * 0.25) {
        applyPixelate(canvas.getContext('2d')!, pos.x, pos.y, brushSize)
        lastPt.current = pos
      }
    } else if (tool === 'crop' && anchor.current) {
      const x = Math.min(pos.x, anchor.current.x)
      const y = Math.min(pos.y, anchor.current.y)
      const w = Math.abs(pos.x - anchor.current.x)
      const h = Math.abs(pos.y - anchor.current.y)
      setCropSel({ x, y, w, h })
    }
    lastPt.current = pos
  }

  const onUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDown.current) return
    isDown.current = false
    const canvas = canvasRef.current
    if (!canvas) return
    if (tool === 'pen') {
      canvas.getContext('2d')!.closePath()
    }
  }

  // ── Crop apply ────────────────────────────────────────────────────────────
  const applyCrop = () => {
    if (!cropSel || cropSel.w < 10 || cropSel.h < 10) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y, w, h } = cropSel
    const data = ctx.getImageData(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
    canvas.width = Math.round(w)
    canvas.height = Math.round(h)
    ctx.putImageData(data, 0, 0)
    pushHistory(ctx, canvas)
    setCropSel(null)
    anchor.current = null
  }

  const resetCrop = () => {
    setCropSel(null)
    anchor.current = null
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  const handleDone = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const MAX_BYTES = 3 * 1024 * 1024 // 3MB — comfortably under Vercel's 4.5MB
    const tryEncode = (q: number): Promise<Blob | null> =>
      new Promise(res => canvas.toBlob(b => res(b), 'image/jpeg', q))
    ;(async () => {
      const qualities = [0.85, 0.75, 0.65, 0.55, 0.45]
      let final: Blob | null = null
      for (const q of qualities) {
        const b = await tryEncode(q)
        if (!b) continue
        final = b
        if (b.size <= MAX_BYTES) break
      }
      if (!final) return
      onDone(final, canvas.toDataURL('image/jpeg', 0.85))
    })()
  }

  // ── Crop overlay display rect (canvas-space → display-space) ──────────────
  const cropDisplay = (() => {
    const canvas = canvasRef.current
    if (!canvas || !cropSel || displaySize.w === 0) return null
    const sx = displaySize.w / canvas.width
    const sy = displaySize.h / canvas.height
    return {
      left: cropSel.x * sx,
      top: cropSel.y * sy,
      width: cropSel.w * sx,
      height: cropSel.h * sy,
    }
  })()

  const showCropApply = cropSel && cropSel.w > 15 && cropSel.h > 15

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      fontFamily: font,
    }}>
      <style>{`
        .img-ed-btn { transition: opacity 0.12s ease; }
        .img-ed-btn:active { opacity: 0.7; }
        input[type=range] { accent-color: ${accentColor}; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <button className="img-ed-btn" onClick={onCancel} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.55)', fontSize: '16px', fontWeight: '600',
          cursor: 'pointer', fontFamily: font, padding: '4px 0',
        }}>Cancel</button>

        <span style={{ color: '#fff', fontWeight: '800', fontSize: '16px' }}>Edit Photo</span>

        <button className="img-ed-btn" onClick={handleDone} style={{
          background: accentColor, border: 'none', color: '#fff',
          fontSize: '15px', fontWeight: '800', cursor: 'pointer',
          fontFamily: font, padding: '8px 22px', borderRadius: '99px',
        }}>Use Photo</button>
      </div>

      {/* ── Canvas area ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: '8px',
      }}>
        {/* Wrapper is inline-block so it hugs the canvas exactly */}
        <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: 'calc(100svh - 230px)',
              touchAction: 'none',
              cursor: tool === 'crop' ? 'crosshair' : 'crosshair',
              borderRadius: '8px',
            }}
          />

          {/* ── Crop overlay ── */}
          {tool === 'crop' && cropDisplay && cropSel && cropSel.w > 5 && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Dark mask — 4 rects around the selection */}
              <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: cropDisplay.top, background: 'rgba(0,0,0,0.6)' }} />
              <div style={{ position: 'absolute', left: 0, top: cropDisplay.top + cropDisplay.height, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)' }} />
              <div style={{ position: 'absolute', left: 0, top: cropDisplay.top, width: cropDisplay.left, height: cropDisplay.height, background: 'rgba(0,0,0,0.6)' }} />
              <div style={{ position: 'absolute', left: cropDisplay.left + cropDisplay.width, top: cropDisplay.top, right: 0, height: cropDisplay.height, background: 'rgba(0,0,0,0.6)' }} />

              {/* Selection border */}
              <div style={{
                position: 'absolute',
                left: cropDisplay.left, top: cropDisplay.top,
                width: cropDisplay.width, height: cropDisplay.height,
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxSizing: 'border-box',
              }}>
                {/* Rule-of-thirds grid lines */}
                <div style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.25)' }} />
                <div style={{ position: 'absolute', left: '66.6%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.25)' }} />
                <div style={{ position: 'absolute', top: '33.3%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.25)' }} />
                <div style={{ position: 'absolute', top: '66.6%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.25)' }} />
                {/* Corner handles */}
                {[
                  { top: -2, left: -2 }, { top: -2, right: -2 },
                  { bottom: -2, left: -2 }, { bottom: -2, right: -2 },
                ].map((pos, i) => (
                  <div key={i} style={{
                    position: 'absolute', ...pos,
                    width: 14, height: 14,
                    border: `3px solid #fff`,
                    borderRadius: '2px',
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div style={{ flexShrink: 0, padding: '10px 20px 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Crop action bar */}
        {tool === 'crop' && showCropApply && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="img-ed-btn" onClick={resetCrop} style={{
              flex: 1, maxWidth: 150, padding: '11px', borderRadius: '99px',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font,
            }}>Reset</button>
            <button className="img-ed-btn" onClick={applyCrop} style={{
              flex: 1, maxWidth: 150, padding: '11px', borderRadius: '99px',
              background: accentColor, border: 'none', color: '#fff',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font,
            }}>✂️ Apply</button>
          </div>
        )}

        {/* Tool selector */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {([
            ['pen', '✏️', 'Draw'],
            ['censor', '⬛', 'Censor'],
            ['crop', '✂️', 'Crop'],
          ] as [Tool, string, string][]).map(([t, icon, label]) => (
            <button
              key={t}
              className="img-ed-btn"
              onClick={() => { setTool(t); if (t !== 'crop') resetCrop() }}
              style={{
                flex: 1, maxWidth: 110, padding: '10px 6px', borderRadius: '14px',
                background: tool === t ? accentColor : 'rgba(255,255,255,0.1)',
                border: 'none', color: '#fff', cursor: 'pointer', fontFamily: font,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              }}
            >
              <span style={{ fontSize: '22px' }}>{icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '700' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Brush options (pen & censor) */}
        {tool !== 'crop' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 2px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '600', minWidth: 28 }}>Size</span>
            <input
              type="range"
              min={tool === 'pen' ? 4 : 16}
              max={tool === 'pen' ? 36 : 80}
              value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            {tool === 'pen' && (
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {PEN_COLORS.map(c => (
                  <button
                    key={c}
                    className="img-ed-btn"
                    onClick={() => setPenColor(c)}
                    style={{
                      width: 26, height: 26, borderRadius: '50%', background: c,
                      border: penColor === c ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Undo */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="img-ed-btn" onClick={undo} style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', fontFamily: font, padding: '4px 16px',
          }}>↩ Undo</button>
        </div>
      </div>
    </div>
  )
}
