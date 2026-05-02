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

const PEN_COLORS = ['#FFFFFF', '#000000', '#FF3B30', '#FFD600', '#34C759', '#4D96FF']

// ── SVG icons ─────────────────────────────────────────────────────────────────
const PenIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const CensorIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" rx="1"/>
    <rect x="15" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" rx="1"/>
    <rect x="3" y="15" width="6" height="6" stroke="currentColor" strokeWidth="2" rx="1"/>
    <rect x="15" y="15" width="6" height="6" stroke="currentColor" strokeWidth="2" rx="1"/>
    <rect x="9" y="9" width="6" height="6" fill="currentColor" rx="1"/>
  </svg>
)

const CropIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M6 2v14a2 2 0 0 0 2 2h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 22V8a2 2 0 0 0-2-2H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const UndoIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M3 7v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CheckIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
  </svg>
)

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
  const [penColor, setPenColor] = useState('#FFFFFF')
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

  const pushHistory = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (historyRef.current.length >= 30) historyRef.current.shift()
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
  }

  const undo = () => {
    const canvas = canvasRef.current
    if (!canvas || historyRef.current.length < 2) return
    historyRef.current.pop()
    const prev = historyRef.current[historyRef.current.length - 1]
    if (prev.width !== canvas.width || prev.height !== canvas.height) {
      canvas.width = prev.width
      canvas.height = prev.height
    }
    canvas.getContext('2d')!.putImageData(prev, 0, 0)
  }

  // ── Coordinate helpers ────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
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

  const onUp = () => {
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
    const MAX_BYTES = 3 * 1024 * 1024
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

  // ── Crop overlay display rect ─────────────────────────────────────────────
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

  const showCropApply = !!(cropSel && cropSel.w > 15 && cropSel.h > 15)
  const sliderMin = tool === 'pen' ? 4 : 16
  const sliderMax = tool === 'pen' ? 36 : 80

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#0A0A0A',
      display: 'flex', flexDirection: 'column',
      fontFamily: font,
    }}>
      <style>{`
        .ime-btn { transition: transform 0.12s ease, opacity 0.12s ease; }
        .ime-btn:active { transform: scale(0.94); opacity: 0.85; }
        .ime-tool { transition: background 0.18s ease, color 0.18s ease; }
        input[type=range].ime-slider {
          -webkit-appearance: none; appearance: none;
          height: 4px; border-radius: 2px;
          background: rgba(255,255,255,0.15);
          outline: none;
        }
        input[type=range].ime-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 22px; height: 22px; border-radius: 50%;
          background: #fff; cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input[type=range].ime-slider::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 50%;
          background: #fff; cursor: pointer; border: none;
        }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        flexShrink: 0,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
      }}>
        <button
          className="ime-btn"
          onClick={onCancel}
          style={{
            background: 'rgba(255,255,255,0.08)', border: 'none',
            width: '38px', height: '38px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
          }}
        >
          <CloseIcon size={16} />
        </button>

        <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.2px' }}>
          Edit photo
        </span>

        <button
          className="ime-btn"
          onClick={handleDone}
          style={{
            background: '#FFFFFF', border: 'none', color: '#0A0A0A',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            fontFamily: font, padding: '9px 18px', borderRadius: '99px',
            letterSpacing: '-0.1px',
          }}
        >
          Done
        </button>
      </div>

      {/* ── Canvas area ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: '8px 16px', minHeight: 0,
      }}>
        <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: 'calc(100svh - 280px)',
              touchAction: 'none',
              cursor: 'crosshair',
              borderRadius: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
          />

          {/* ── Crop overlay ── */}
          {tool === 'crop' && cropDisplay && cropSel && cropSel.w > 5 && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: cropDisplay.top, background: 'rgba(0,0,0,0.55)' }} />
              <div style={{ position: 'absolute', left: 0, top: cropDisplay.top + cropDisplay.height, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)' }} />
              <div style={{ position: 'absolute', left: 0, top: cropDisplay.top, width: cropDisplay.left, height: cropDisplay.height, background: 'rgba(0,0,0,0.55)' }} />
              <div style={{ position: 'absolute', left: cropDisplay.left + cropDisplay.width, top: cropDisplay.top, right: 0, height: cropDisplay.height, background: 'rgba(0,0,0,0.55)' }} />

              <div style={{
                position: 'absolute',
                left: cropDisplay.left, top: cropDisplay.top,
                width: cropDisplay.width, height: cropDisplay.height,
                border: '1.5px solid rgba(255,255,255,0.95)',
                boxSizing: 'border-box',
              }}>
                <div style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.3)' }} />
                <div style={{ position: 'absolute', left: '66.6%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.3)' }} />
                <div style={{ position: 'absolute', top: '33.3%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                <div style={{ position: 'absolute', top: '66.6%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                {[
                  { top: -2, left: -2 }, { top: -2, right: -2 },
                  { bottom: -2, left: -2 }, { bottom: -2, right: -2 },
                ].map((pos, i) => (
                  <div key={i} style={{
                    position: 'absolute', ...pos,
                    width: 14, height: 14,
                    border: '3px solid #fff',
                    borderRadius: '2px',
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Brush size indicator overlay (centered, while not drawing) */}
          {tool !== 'crop' && !isDown.current && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none', opacity: 0,
            }} />
          )}
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div style={{
        flexShrink: 0,
        padding: '8px 16px 24px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        display: 'flex', flexDirection: 'column', gap: '14px',
        background: 'rgba(0,0,0,0.4)',
      }}>

        {/* Crop apply bar */}
        {tool === 'crop' && showCropApply && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="ime-btn"
              onClick={resetCrop}
              style={{
                flex: 1, height: '46px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: font,
              }}
            >
              Reset
            </button>
            <button
              className="ime-btn"
              onClick={applyCrop}
              style={{
                flex: 1.4, height: '46px', borderRadius: '14px',
                background: accentColor, border: 'none', color: '#fff',
                fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: font,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <CheckIcon size={14} />
              Apply crop
            </button>
          </div>
        )}

        {/* Brush controls (pen + censor) */}
        {tool !== 'crop' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Live brush size preview */}
            <div style={{
              width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <div style={{
                width: `${Math.min(36, Math.max(6, (brushSize / sliderMax) * 32))}px`,
                height: `${Math.min(36, Math.max(6, (brushSize / sliderMax) * 32))}px`,
                borderRadius: '50%',
                background: tool === 'pen' ? penColor : 'transparent',
                border: tool === 'pen'
                  ? (penColor === '#FFFFFF' ? '1px solid rgba(255,255,255,0.4)' : 'none')
                  : '2px dashed rgba(255,255,255,0.6)',
                transition: 'all 0.15s ease',
              }} />
            </div>

            <input
              type="range"
              className="ime-slider"
              min={sliderMin}
              max={sliderMax}
              value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              style={{ flex: 1 }}
            />

            {/* Pen colors */}
            {tool === 'pen' && (
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {PEN_COLORS.map(c => {
                  const selected = penColor === c
                  return (
                    <button
                      key={c}
                      className="ime-btn"
                      onClick={() => setPenColor(c)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: c,
                        border: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                        boxShadow: selected ? `0 0 0 2px #0A0A0A, 0 0 0 4px #fff` : 'none',
                        cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: c === '#FFFFFF' || c === '#FFD600' ? '#000' : '#fff',
                      }}
                    >
                      {selected && <CheckIcon size={11} />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tool selector */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '4px',
          gap: '4px',
        }}>
          {([
            ['pen', PenIcon, 'Draw'],
            ['censor', CensorIcon, 'Censor'],
            ['crop', CropIcon, 'Crop'],
          ] as [Tool, typeof PenIcon, string][]).map(([t, Icon, label]) => {
            const active = tool === t
            return (
              <button
                key={t}
                className="ime-tool ime-btn"
                onClick={() => { setTool(t); if (t !== 'crop') resetCrop() }}
                style={{
                  flex: 1, height: '52px', borderRadius: '12px',
                  background: active ? '#fff' : 'transparent',
                  color: active ? '#0A0A0A' : 'rgba(255,255,255,0.7)',
                  border: 'none', cursor: 'pointer', fontFamily: font,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '3px',
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '-0.1px' }}>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Undo */}
        <button
          className="ime-btn"
          onClick={undo}
          style={{
            alignSelf: 'center',
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.55)',
            fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: font, padding: '4px 16px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <UndoIcon size={14} />
          Undo
        </button>
      </div>
    </div>
  )
}
